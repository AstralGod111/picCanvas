import type { IncomingMessage, ServerResponse } from "http";

type Drawing = {
  id: string;
  name: string;
  imageData: string;
  originalImage: string | null;
  metadata: any | null;
  createdAt: string;
  updatedAt: string;
};

const g = globalThis as any;
if (!g.__DRAWINGS_STORE__) {
  g.__DRAWINGS_STORE__ = new Map<string, Drawing>();
}
const store: Map<string, Drawing> = g.__DRAWINGS_STORE__;

export default async function handler(req: IncomingMessage & { method?: string; url?: string; }, res: ServerResponse) {
  try {
    const urlParts = (req.url || '').split('/');
    const id = urlParts[urlParts.length - 1];
    if (!id) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'id required' }));
    }

    const existing = store.get(id);
    if (!existing) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    if (req.method === 'GET') {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(existing));
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      let body = '';
      req.on('data', chunk => { body += chunk });
      req.on('end', () => {
        const data = JSON.parse(body || '{}');
        const updated: Drawing = {
          ...existing,
          name: data.name ?? existing.name,
          imageData: data.imageData ?? existing.imageData,
          originalImage: (typeof data.originalImage !== 'undefined') ? data.originalImage : existing.originalImage,
          metadata: (typeof data.metadata !== 'undefined') ? data.metadata : existing.metadata,
          updatedAt: new Date().toISOString()
        };
        store.set(id, updated);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(updated));
      });
      return;
    }

    if (req.method === 'DELETE') {
      store.delete(id);
      res.statusCode = 204;
      return res.end();
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET,PUT,PATCH,DELETE');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message || String(err) }));
  }
}