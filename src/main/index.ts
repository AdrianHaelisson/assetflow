import { app } from '../infrastructure/http/app';

const PORT = process.env.PORT || 3000;

console.log(`AssetFlow API running on port ${PORT}\nhttp://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch
};
