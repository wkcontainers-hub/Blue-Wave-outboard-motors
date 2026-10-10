import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './server/db.ts';
import { apiRouter } from './server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parser with 50mb limit for product photo uploads & payment receipt screenshots
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static folders for images and user uploads
  const uploadsPath = path.resolve(__dirname, 'uploads');
  const publicImagesPath = path.resolve(__dirname, 'public/images');
  const srcImagesPath = path.resolve(__dirname, 'src/assets/images');

  app.use('/uploads', express.static(uploadsPath));
  app.use('/images', express.static(publicImagesPath));
  app.use('/assets/images', express.static(publicImagesPath));
  // Fallback aliases for legacy /src/assets/images requests
  app.use('/src/assets/images', express.static(publicImagesPath));
  app.use('/src/assets/images', express.static(srcImagesPath));

  // Initialize SQLite database & seed records
  initDatabase();
  console.log('✓ SQLite database initialized successfully');

  // Mount API Router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ BlueWave Outboard Motors server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
