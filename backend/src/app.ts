import cors from 'cors';
import express from 'express';

export function createApp(clientOrigin: string) {
  const app = express();

  app.use(
    cors({
      origin: clientOrigin
    })
  );
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      message: '后端服务运行正常。'
    });
  });

  return app;
}
