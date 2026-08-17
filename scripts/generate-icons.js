// Genera los íconos reales de la PWA a partir de un SVG simple, en vez
// de dejar placeholders rotos en public/icons/. Correr con:
//   npm run generate-icons
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')

const BG_COLOR = '#0f172a'
const TEXT_COLOR = '#ffffff'

/**
 * @param {{ size: number, rounded: boolean, fontScale: number }} opts
 */
function buildSvg({ size, rounded, fontScale }) {
  const cornerRadius = rounded ? size * 0.2 : 0
  const fontSize = Math.round(size * fontScale)

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${BG_COLOR}" />
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="${TEXT_COLOR}"
  >CH</text>
</svg>`.trim()
}

/**
 * @param {string} name
 * @param {number} size
 * @param {{ rounded: boolean, fontScale: number }} options
 */
async function generate(name, size, options) {
  const svg = buildSvg({ size, ...options })
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, name))
  console.log(`✓ ${name} (${size}x${size})`)
}

async function main() {
  await mkdir(outDir, { recursive: true })

  // Íconos normales: esquinas redondeadas, el texto usa casi todo el
  // lienzo.
  await generate('icon-192.png', 192, { rounded: true, fontScale: 0.42 })
  await generate('icon-512.png', 512, { rounded: true, fontScale: 0.42 })

  // Maskable: fondo a sangre completa (SIN esquinas redondeadas — el
  // sistema operativo recorta la forma final con su propia máscara) y
  // el texto más chico, dentro del ~80% central de seguridad, para que
  // ningún recorte agresivo se coma el diseño.
  await generate('icon-512-maskable.png', 512, { rounded: false, fontScale: 0.3 })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
