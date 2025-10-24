import os
import io
import base64
from pathlib import Path
from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import logging

# Try to minimize TF logging noise
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
except Exception as e:
    logging.error('Failed to import TensorFlow: %s', e)
    raise

app = Flask(__name__)

# Attempt to find the model in project root
BASE = Path(__file__).resolve().parent
MODEL_PATHS = [BASE.parent / 'unet_best_(1).h5', BASE.parent / 'unet_best.h5', BASE / 'unet_best_(1).h5']
MODEL_FILE = None
for p in MODEL_PATHS:
    if p.exists():
        MODEL_FILE = p
        break

if not MODEL_FILE:
    raise FileNotFoundError('Model file not found. Looked for: ' + ', '.join(str(p) for p in MODEL_PATHS))

print('Loading model from', MODEL_FILE)
model = load_model(str(MODEL_FILE), compile=False)
print('Model loaded.')

# Determine expected input size
def get_model_input_size(m):
    # typical input shape: (None, H, W, C)
    shape = getattr(m, 'input_shape', None)
    if not shape:
        return None
    # shape may be tuple like (None, H, W, C)
    if len(shape) == 4:
        _, h, w, c = shape
        if h and w:
            return (int(w), int(h), int(c))
    # fallback
    return None

input_spec = get_model_input_size(model)
print('Model input spec:', input_spec)


def decode_base64_image(data_uri_or_b64):
    if not isinstance(data_uri_or_b64, str):
        raise ValueError('Image must be a base64 string')
    b = data_uri_or_b64
    if b.startswith('data:'):
        b = b.split(',')[1]
    return base64.b64decode(b)


@app.route('/segment', methods=['POST'])
def segment():
    try:
        body = request.get_json(force=True)
        if not body:
            return jsonify({'error': 'Missing JSON body'}), 400
        img_b64 = body.get('image')
        if not img_b64:
            return jsonify({'error': 'Missing image (base64)'}), 400

        img_bytes = decode_base64_image(img_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        orig_w, orig_h = img.size

        # Prepare input for model
        if input_spec:
            target_w, target_h, channels = input_spec
            # model input spec returned (w,h,c) as we built it earlier
            resized = img.resize((target_w, target_h), Image.BILINEAR)
        else:
            # fallback to 256x256
            target_w, target_h = 256, 256
            resized = img.resize((target_w, target_h), Image.BILINEAR)

        arr = np.array(resized).astype('float32') / 255.0
        if arr.ndim == 2:
            arr = np.stack([arr]*3, axis=-1)
        if arr.shape[-1] == 4:
            arr = arr[..., :3]

        batch = np.expand_dims(arr, axis=0)

        # Run prediction
        pred = model.predict(batch)
        # prediction could be (1,H,W,1) or (1,H,W,2) or (1,H,W)
        pred = np.squeeze(pred)
        if pred.ndim == 3 and pred.shape[-1] > 1:
            # take argmax for multi-class
            mask = np.argmax(pred, axis=-1)
        elif pred.ndim == 2:
            mask = pred
        elif pred.ndim == 3 and pred.shape[-1] == 1:
            mask = pred[..., 0]
        else:
            # fallback
            mask = pred

        # Normalize mask to 0-255 uint8
        # If mask is probabilities, threshold at 0.5
        if mask.dtype.kind == 'f':
            mask_norm = (mask >= 0.5).astype('uint8') * 255
        else:
            # integer labels -> scale
            mask_norm = (mask.astype('uint8') > 0).astype('uint8') * 255

        mask_img = Image.fromarray(mask_norm.astype('uint8'))
        mask_img = mask_img.resize((orig_w, orig_h), Image.NEAREST)

        # Create overlay: red overlay where mask present
        orig_rgba = img.convert('RGBA')
        colored = Image.new('RGBA', (orig_w, orig_h), (255, 0, 0, 120))
        # use mask as alpha
        colored.putalpha(mask_img)
        result = Image.alpha_composite(orig_rgba, colored)

        # Serialize result to PNG
        out_buf = io.BytesIO()
        result.save(out_buf, format='PNG')
        out_bytes = out_buf.getvalue()
        out_b64 = base64.b64encode(out_bytes).decode('utf-8')
        data_uri = 'data:image/png;base64,' + out_b64

        return jsonify({
            'image': data_uri,
            'width': orig_w,
            'height': orig_h,
        })

    except Exception as e:
        logging.exception('Error in /segment')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PY_MODEL_PORT', 5000))
    print(f'Starting Python model service on http://127.0.0.1:{port}')
    app.run(host='0.0.0.0', port=port)
