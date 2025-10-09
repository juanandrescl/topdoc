export const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3');
export const PORT = parseInt(process.env.PORT || '8080'); // Cloud Run uses 8080

export const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};