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

export default async function handler(req: IncomingMessage & { method?: string; body?: any; }, res: ServerResponse & { json?: (body: any) => void }) {
  try {
    if (req.method === 'GET') {
      const all = Array.from(store.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(all));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk });
      req.on('end', () => {
        const data = JSON.parse(body || '{}');
        const id = Math.random().toString(36).slice(2);
        const now = new Date().toISOString();
        const drawing: Drawing = {
          id,
          name: data.name ?? 'Untitled',
          imageData: data.imageData ?? '',
          originalImage: data.originalImage ?? null,
          metadata: data.metadata ?? null,
          createdAt: now,
          updatedAt: now,
        };
        store.set(id, drawing);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(drawing));
      });
      return;
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET,POST');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message || String(err) }));
  }
}