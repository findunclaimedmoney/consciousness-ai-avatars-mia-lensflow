import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const port = Number(process.env.PORT) || 3000;
const basePath = (process.env.BASE_PATH || '/missingcash/').replace(/\/$/, '');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);

    if (p === basePath || p === basePath + '/') {
      p = '/index.html';
    } else if (p.startsWith(basePath + '/')) {
      p = p.slice(basePath.length);
    } else if (p === '/') {
      p = '/index.html';
    }

    if (p.endsWith('/')) p += 'index.html';

    const file = join(root, normalize(p));
    if (!file.startsWith(root)) {
      res.writeHead(403).end('forbidden');
      return;
    }

    let body;
    let contentType;
    try {
      body = await readFile(file);
      contentType = types[extname(file).toLowerCase()] || 'application/octet-stream';
    } catch {
      // Try appending .html for extensionless paths
      const htmlFile = file + '.html';
      body = await readFile(htmlFile);
      contentType = 'text/html; charset=utf-8';
    }
    res.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('404 not found');
  }
}).listen(port, '0.0.0.0', () =>
  console.log(`missingcash serving on http://localhost:${port}${basePath}/`)
);
