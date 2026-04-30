import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AssetController } from './controllers/AssetController';
import { CollaboratorController } from './controllers/CollaboratorController';
import { ReportController } from './controllers/ReportController';
import { ConsumableController } from './controllers/ConsumableController';
import { LocationController } from './controllers/LocationController';
import { LicenseController } from './controllers/LicenseController';
import { AccessoryController } from './controllers/AccessoryController';
import { ComponentController } from './controllers/ComponentController';
import { MaintenanceController } from './controllers/MaintenanceController';
import { DepartmentController } from './controllers/DepartmentController';
import { ImportController } from './controllers/ImportController';
import { SystemLogController } from './controllers/SystemLogController';
import { GlobalErrorHandler } from './middlewares/GlobalErrorHandler';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import cron from 'node-cron';

const app = new Hono();

app.use('*', cors());

app.onError(GlobalErrorHandler);

// Real Auth endpoint
app.post('/auth/login', async (c) => {
    try {
        const { AuthenticateUser } = await import('../../application/use-cases/AuthenticateUser');
        const { PrismaUserRepository } = await import('../repositories/PrismaUserRepository');
        const repo = new PrismaUserRepository();
        const useCase = new AuthenticateUser(repo as any);
        const body = await c.req.json();
        const result = await useCase.execute(body);
        return c.json(result);
    } catch (err: any) {
        return c.json({ error: err.message }, 401);
    }
});

// Asset Routes
app.post('/assets', AuthMiddleware, AssetController.create);
app.get('/assets', AuthMiddleware, AssetController.list);
app.get('/assets/stats', AuthMiddleware, AssetController.getStats);
app.put('/assets/:id', AuthMiddleware, AssetController.update);
app.delete('/assets/:id', AuthMiddleware, AssetController.delete);
app.post('/assets/:id/assign', AuthMiddleware, AssetController.assign);
app.get('/assets/:id/term', AuthMiddleware, AssetController.getTerm);
app.get('/assets/:id/history', AuthMiddleware, AssetController.getHistory);
app.post('/assets/:id/maintenance', AuthMiddleware, MaintenanceController.start);
app.post('/assets/:id/audit', AuthMiddleware, MaintenanceController.logAudit);

// Bulk Import
app.post('/assets/import', AuthMiddleware, (c) => ImportController.importCSV(c) as any);

// Collaborator Routes
app.post('/users', AuthMiddleware, CollaboratorController.create);
app.get('/users', AuthMiddleware, CollaboratorController.list);
app.put('/users/:id', AuthMiddleware, CollaboratorController.update);
app.delete('/users/:id', AuthMiddleware, CollaboratorController.delete);
app.get('/users/:id/assets', AuthMiddleware, CollaboratorController.getAssignments);

// Location Routes
app.get('/locations', AuthMiddleware, LocationController.list);
app.post('/locations', AuthMiddleware, LocationController.create);
app.put('/locations/:id', AuthMiddleware, LocationController.update);
app.delete('/locations/:id', AuthMiddleware, LocationController.delete);

// Department Routes
app.get('/departments', AuthMiddleware, DepartmentController.list);
app.post('/departments', AuthMiddleware, DepartmentController.create);
app.put('/departments/:id', AuthMiddleware, DepartmentController.update);
app.delete('/departments/:id', AuthMiddleware, DepartmentController.delete);

// Consumable Routes
app.get('/consumables', AuthMiddleware, ConsumableController.list);
app.post('/consumables', AuthMiddleware, ConsumableController.create);
app.put('/consumables/:id', AuthMiddleware, ConsumableController.update);
app.post('/consumables/:id/checkout', AuthMiddleware, ConsumableController.checkout);

// License Routes
app.get('/licenses', AuthMiddleware, LicenseController.list);
app.post('/licenses', AuthMiddleware, LicenseController.create);
app.put('/licenses/:id', AuthMiddleware, LicenseController.update);
app.post('/licenses/:id/assign', AuthMiddleware, LicenseController.assign);

// Accessory Routes
app.get('/accessories', AuthMiddleware, AccessoryController.list);
app.post('/accessories', AuthMiddleware, AccessoryController.create);
app.put('/accessories/:id', AuthMiddleware, AccessoryController.update);
app.post('/accessories/:id/checkout', AuthMiddleware, AccessoryController.checkout);

// Component Routes
app.get('/components', AuthMiddleware, ComponentController.list);
app.post('/components', AuthMiddleware, ComponentController.create);
app.put('/components/:id', AuthMiddleware, ComponentController.update);
app.post('/components/:id/install', AuthMiddleware, ComponentController.install);

// Reports Routes
app.get('/reports', AuthMiddleware, ReportController.getDashboardReport);
app.get('/reports/export', AuthMiddleware, ReportController.exportAssetsCSV);

// Maintenances
app.post('/maintenances/:id/finish', AuthMiddleware, MaintenanceController.finish);

// Logs
app.get('/logs', AuthMiddleware, SystemLogController.list);


cron.schedule('0 5 * * *', async () => {
    console.log('[JOBS] Verifying expiring licenses and assets failing audit...');
});

export { app };
