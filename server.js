import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const publicRoot = resolve(projectRoot, 'dist')
const port = Number(process.env.PORT) || 3000
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function respond(res, status, message) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(message)
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    respond(res, 405, 'Method not allowed')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
  } catch {
    respond(res, 400, 'Bad request')
    return
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '')
  let filePath = resolve(publicRoot, relativePath)
  if (filePath !== publicRoot && !filePath.startsWith(publicRoot + sep)) {
    respond(res, 403, 'Forbidden')
    return
  }

  let fileInfo
  try {
    fileInfo = await stat(filePath)
    if (!fileInfo.isFile()) throw Object.assign(new Error('Not a file'), { code: 'ENOENT' })
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
      respond(res, 500, 'Internal server error')
      return
    }

    if (extname(pathname)) {
      respond(res, 404, 'Not found')
      return
    }

    filePath = resolve(publicRoot, 'index.html')
    try {
      fileInfo = await stat(filePath)
    } catch {
      respond(res, 500, 'Built app not found. Run npm run build first.')
      return
    }
  }

  const extension = extname(filePath).toLowerCase()
  res.writeHead(200, {
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    'Content-Length': fileInfo.size,
    'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  createReadStream(filePath).on('error', () => {
    if (!res.headersSent) respond(res, 500, 'Internal server error')
    else res.destroy()
  }).pipe(res)
})

server.listen(port, '0.0.0.0', () => {
  console.info('Streakly listening on port ' + port)
})
