import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('..', import.meta.url))));
const port = Number(process.env.PORT || process.argv[2] || 5173);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, safePath === '/' ? 'index.html' : safePath);
  if (!filePath.startsWith(root)) return null;
  if (!existsSync(filePath)) return null;
  const stats = statSync(filePath);
  return stats.isDirectory() ? join(filePath, 'index.html') : filePath;
}

const server = createServer((request, response) => {
  const filePath = resolvePath(request.url || '/');
  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Thumbnail AI Studio running at http://localhost:${port}`);
});
