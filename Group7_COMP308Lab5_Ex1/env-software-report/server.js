import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { generateSummary, getRecentSources } from './summarizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8').trim();
  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

async function serveStaticFile(res, pathname) {
  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const normalizedPath = path.normalize(requestedPath);
  const filePath = path.resolve(publicDir, normalizedPath);

  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    sendJson(res, 403, { error: 'Forbidden path.' });
    return;
  }

  try {
    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.byteLength
    });
    res.end(fileBuffer);
  } catch {
    sendJson(res, 404, { error: 'File not found.' });
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: 'Invalid request.' });
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (pathname === '/api/sources' && req.method === 'GET') {
    sendJson(res, 200, { sources: getRecentSources() });
    return;
  }

  if (pathname === '/api/summarize' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const selectedSourceIds = Array.isArray(body.selectedSourceIds)
        ? body.selectedSourceIds
        : [];
      const additionalContext =
        typeof body.additionalContext === 'string' ? body.additionalContext.trim() : '';
      const modelName = typeof body.modelName === 'string' ? body.modelName.trim() : '';

      const result = await generateSummary({
        selectedSourceIds,
        additionalContext,
        modelName
      });
      sendJson(res, 200, {
        summary: result.summary,
        selectedSources: result.selectedSources,
        providerUsed: result.providerUsed,
        modelUsed: result.modelUsed,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      sendJson(res, 500, {
        error: 'Failed to generate summary.',
        details: error.message || String(error)
      });
    }
    return;
  }

  if (req.method === 'GET') {
    await serveStaticFile(res, pathname);
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed.' });
});

server.listen(port, () => {
  console.log(`UI available at http://localhost:${port}`);
});
