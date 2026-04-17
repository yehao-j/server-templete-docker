import { createApp } from './app.js';
import { logger } from './logger.js';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173';
const app = createApp(clientOrigin);

app.listen(port, host, () => {
    logger.info(
        {
            clientOrigin,
            host,
            port
        },
        'Backend listening'
    );
});
