import { readFile, writeFile } from 'node:fs/promises'

const source = new URL('../dist-single/index.html', import.meta.url)
const destination = new URL('../dist-single/id-generator.html', import.meta.url)

let html = await readFile(source, 'utf8')

// A local file must not depend on the PWA manifest or external icons.
html = html.replace(/\s*<link\b[^>]*\brel=["'](?:manifest|icon|apple-touch-icon)["'][^>]*>/gi, '')

if (!/<script\b[^>]*>[^]*?<\/script>/i.test(html)) {
  throw new Error('Single-file HTML is missing its embedded JavaScript.')
}
if (!/<style\b[^>]*>[^]*?<\/style>/i.test(html)) {
  throw new Error('Single-file HTML is missing its embedded CSS.')
}
if (/<(?:script|link)\b[^>]*(?:src|href)=["'](?:https?:|\/|\.\/|\.\.\/)/i.test(html)) {
  throw new Error('Single-file HTML has an external script or link dependency.')
}
if (/\b(?:src|href)=["'][^"']*\.(?:js|css|webmanifest|png|svg)["']/i.test(html)) {
  throw new Error('Single-file HTML references a separate asset.')
}

await writeFile(destination, html)
console.log('Created dist-single/id-generator.html')
