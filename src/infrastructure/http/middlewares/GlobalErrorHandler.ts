import { Context } from 'hono';

export function GlobalErrorHandler(err: Error, c: Context) {
  console.error(err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
}
