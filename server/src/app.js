import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';
import env from './config/env.js';
import prisma from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import userRoutes from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');
const allowedOrigins = new Set(env.frontendUrls.map(normalizeOrigin));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new AppError(`Origin ${origin} is not allowed by CORS`, 403));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {},
  });
});

if (env.nodeEnv !== 'production') {
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Maktabatul Ilm API is running',
    });
  });
}

app.get('/health/db', async (_req, res, next) => {
  try
  {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Database connection is healthy',
      data: {},
    });
  } catch (error)
  {
    error.statusCode = 503;
    error.message = 'Database connection failed';
    next(error);
  }
});

app.get('/health/config', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Configuration status',
    data: {
      nodeEnv: env.nodeEnv,
      frontendUrls: env.frontendUrls,
      configured: {
        database: Boolean(env.databaseUrl),
        jwtSecret: Boolean(env.jwtSecret),
        cloudinary: Boolean(
          env.cloudinaryCloudName &&
            env.cloudinaryApiKey &&
            env.cloudinaryApiSecret,
        ),
        supabase: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
        supabaseBucket: env.supabaseStorageBucket,
        resend: Boolean(env.resendApiKey),
        googleOAuth: Boolean(env.googleClientId && env.googleClientSecret),
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/users', userRoutes);

if (env.nodeEnv === 'production') {
  app.use(express.static(clientDistPath));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
