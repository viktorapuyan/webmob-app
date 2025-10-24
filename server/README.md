Python model service for UNet model

Overview
- `python_server.py` is a small Flask service that loads `unet_best_(1).h5` from the project root and exposes POST /segment.
- It accepts JSON with a base64 image (or data URI) in the `image` field and returns JSON: `{ image: <data-uri PNG>, width: <original width>, height: <original height> }`.

Installation (Windows, cmd.exe)
1. Create and activate a virtual environment (recommended):

   python -m venv .venv
   .\.venv\Scripts\activate

2. Install dependencies:

   pip install -r requirements.txt

3. Start the Python service (default port 5000):

   python python_server.py

Notes
- The Flask server expects the model file `unet_best_(1).h5` to be in the project root (one level up from `server/`). If your model has a different name/place, edit `python_server.py`.
- Installing `tensorflow` may take time and requires appropriate Python and pip versions. If you only need CPU inference, consider `tensorflow-cpu` to reduce size.

Using the endpoint from Node/Front-end
- The Node Express API has a proxy route at `/api/segment` (in `server/index.js`) which expects JSON `{"image": "<base64 or data-uri>"}` and will forward it to the Python service.

Example fetch from front-end (React Native / web):

const res = await fetch('/api/segment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: dataUriOrBase64String })
});
const json = await res.json();
// json.image is data:image/png;base64,...
// json.width / json.height are original dimensions

Troubleshooting
- If you get CORS or connection refused, ensure the Python server is running and accessible at http://127.0.0.1:5000. You can change the Python service port by setting env PY_MODEL_PORT and the Express proxy URL by setting PY_MODEL_URL.
