import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// The Universal Audit Malha (Security Interceptor)
export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        if (['create', 'update', 'delete', 'upsert'].includes(operation) && model !== 'SystemLog' && model !== 'AuditLog') {
           // We intercept write operations silently
           // For a production-ready app you might capture the before/after state (audit diffing).
           // Here we log the high-level operation into SystemLog.
           
           const result = await query(args);
           
           try {
             await prismaClient.systemLog.create({
                data: {
                   action: operation,
                   entityType: model || 'Unknown',
                   entityId: (result as any)?.id ? String((result as any).id) : 'BulkOrUnknown',
                   changes: JSON.stringify(args)
                }
             });
           } catch(e) {
             console.error("[SystemLog] Failed to audit operation", e);
           }
           
           return result;
        }
        return query(args);
      },
    },
  },
});
