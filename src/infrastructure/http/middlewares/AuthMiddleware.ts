import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export async function AuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token missing or invalid' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ error: 'Token missing' }, 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { id: string; role: string; companyId: string };
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Token expired or invalid' }, 401);
  }
}

export function RoleMiddleware(requiredRole: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || user.role !== requiredRole) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  };
}
