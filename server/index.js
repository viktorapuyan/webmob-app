import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('Starting API…', { hasUri: !!process.env.MONGODB_URI });

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in environment. Check server/.env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment. Add JWT_SECRET to server/.env');
  process.exit(1);
}

let dbName;
try {
  const u = new URL(uri);
  dbName = u.pathname && u.pathname !== '/' ? u.pathname.slice(1) : undefined;
} catch {
  dbName = undefined;
}

await mongoose.connect(uri, dbName ? { dbName } : {});

const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : true,
  credentials: true
}));

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const signupSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email(),
  password: z.string().min(6)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    const msg = e.errors?.[0]?.message || e.message || 'Signup failed';
    res.status(400).json({ error: msg });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    const msg = e.errors?.[0]?.message || e.message || 'Login failed';
    res.status(400).json({ error: msg });
  }
});

app.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.sub).select('_id name email');
  res.json({ user });
});


// Basic root route and health check to avoid 404s on '/'
// Basic root route and health check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'webmob-auth-api',
    version: process.env.npm_package_version || '1.0.0',
    time: new Date().toISOString(),
    endpoints: ['/auth/signup', '/auth/login', '/me', '/healthz']
  });
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Friendly 404 for any other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Start server once, with a consistent default port and basic error handling
const port = Number(process.env.PORT) || 4000;
const server = app.listen(port, () => {
  console.log(`API on http://localhost:${port}`);
});
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set PORT to a different value or stop the conflicting process.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
