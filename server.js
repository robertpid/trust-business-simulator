/**
 * TRUST Business Simulator - Servidor Local de Desarrollo
 * 
 * Servidor HTTP nativo en Node.js (cero dependencias externas)
 * para servir los módulos ES6 y la interfaz de usuario.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url_path = req.url.split('?')[0];
  let file_path = path.join(__dirname, url_path === '/' ? 'index.html' : url_path);

  // Seguridad: evitar directory traversal
  if (!file_path.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return;
  }

  fs.stat(file_path, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 No Encontrado: ${url_path}`);
      return;
    }

    const ext = path.extname(file_path).toLowerCase();
    const mime_type = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mime_type,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(file_path);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[TRUST SIMULATOR] Servidor local ejecutándose en: http://localhost:${PORT}`);
  console.log(`[TRUST SIMULATOR] Presiona Ctrl+C para detener el servidor.`);
});
