import { describe, it, expect, mock } from 'bun:test';
import { AuthMiddleware, RoleMiddleware } from './AuthMiddleware';
import jwt from 'jsonwebtoken';

mock.module('jsonwebtoken', () => ({
  default: { verify: mock(), sign: mock() }
}));

describe('AuthMiddleware', () => {
    it('should return 401 if no auth header', async () => {
        const c: any = { req: { header: mock().mockReturnValue(undefined) }, json: mock() };
        const next = mock();
        await AuthMiddleware(c, next);
        expect(c.json).toHaveBeenCalledWith({ error: 'Token missing or invalid' }, 401);
    });

    it('should return 401 if invalid format', async () => {
        const c: any = { req: { header: mock().mockReturnValue('Basic token') }, json: mock() };
        const next = mock();
        await AuthMiddleware(c, next);
        expect(c.json).toHaveBeenCalledWith({ error: 'Token missing or invalid' }, 401);
    });

    it('should inject user to req and call next if token is valid', async () => {
        const c: any = { req: { header: mock().mockReturnValue('Bearer valid-token') }, set: mock() };
        const next = mock();
        (jwt.verify as any).mockReturnValue({ id: '1', role: 'ADMIN', companyId: '1' } as any);
        await AuthMiddleware(c, next);
        expect(c.set).toHaveBeenCalledWith('user', { id: '1', role: 'ADMIN', companyId: '1' });
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
        const c: any = { req: { header: mock().mockReturnValue('Bearer expired-token') }, json: mock() };
        const next = mock();
        (jwt.verify as any).mockImplementation(() => { throw new Error('expired'); });
        await AuthMiddleware(c, next);
        expect(c.json).toHaveBeenCalledWith({ error: 'Token expired or invalid' }, 401);
    });
});

describe('RoleMiddleware', () => {
    it('should block if user role does not match', async () => {
        const c: any = { get: mock().mockReturnValue({ role: 'USER' }), json: mock() };
        const next = mock();
        await RoleMiddleware('ADMIN')(c, next);
        expect(c.json).toHaveBeenCalledWith({ error: 'Forbidden' }, 403);
    });

    it('should allow if role matches', async () => {
        const c: any = { get: mock().mockReturnValue({ role: 'ADMIN' }) };
        const next = mock();
        await RoleMiddleware('ADMIN')(c, next);
        expect(next).toHaveBeenCalled();
    });
});
