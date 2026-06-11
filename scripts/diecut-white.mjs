// ไดคัทพื้น "ขาว" ออกแบบเนียน (สำหรับรูปน้องแมวถือทิวลิป)
//  - flood-fill จากขอบ ลบเฉพาะพื้นขาวที่ติดขอบ (เก็บแมว/ทิวลิป/มือไว้)
//  - ลบเศษเล็ก + เกลี่ยขอบให้นุ่ม
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '..', 'src', 'assets', 'cat-original.jpg')
const OUT = path.join(__dirname, '..', 'src', 'assets', 'cat.png')

const TARGET_W = 760
const HARD = 240 // ขอบต้อง "ขาว" กว่านี้ถึงเริ่มลาม (min channel)
const SOFT = 222 // ลามต่อได้ถ้ายัง "สว่าง/ขาว" กว่านี้

const { data, info } = await sharp(SRC).resize({ width: TARGET_W }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const px = w * h

const minChannel = (i) => {
  const o = i * 4
  return Math.min(data[o], data[o + 1], data[o + 2])
}

const alpha = new Uint8Array(px).fill(255)
const visited = new Uint8Array(px)
const stack = []
const seed = (x, y) => {
  const i = y * w + x
  if (!visited[i] && minChannel(i) > HARD) { visited[i] = 1; stack.push(i) }
}
for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }

while (stack.length) {
  const i = stack.pop()
  alpha[i] = 0
  const x = i % w, y = (i / w) | 0
  const nb = []
  if (x > 0) nb.push(i - 1)
  if (x < w - 1) nb.push(i + 1)
  if (y > 0) nb.push(i - w)
  if (y < h - 1) nb.push(i + w)
  for (const n of nb) {
    if (!visited[n] && minChannel(n) > SOFT) { visited[n] = 1; stack.push(n) }
  }
}

// หดขอบ 1px ตัดขอบขาวเรืองรอบตัว
{
  const snap = alpha.slice()
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x
    if (snap[i] === 0) continue
    if ((x > 0 && snap[i - 1] === 0) || (x < w - 1 && snap[i + 1] === 0) ||
        (y > 0 && snap[i - w] === 0) || (y < h - 1 && snap[i + w] === 0)) alpha[i] = 0
  }
}

// ลบชิ้นเล็กที่หลุดลอย (เก็บเฉพาะก้อนใหญ่)
{
  const MIN_AREA = px * 0.003
  const lab = new Int32Array(px).fill(-1)
  const q = new Int32Array(px)
  for (let s = 0; s < px; s++) {
    if (alpha[s] === 0 || lab[s] !== -1) continue
    let head = 0, tail = 0; q[tail++] = s; lab[s] = s
    const members = [s]
    while (head < tail) {
      const i = q[head++]
      const x = i % w, y = (i / w) | 0
      const nb = []
      if (x > 0) nb.push(i - 1)
      if (x < w - 1) nb.push(i + 1)
      if (y > 0) nb.push(i - w)
      if (y < h - 1) nb.push(i + w)
      for (const n of nb) if (alpha[n] !== 0 && lab[n] === -1) { lab[n] = s; q[tail++] = n; members.push(n) }
    }
    if (members.length < MIN_AREA) for (const m of members) alpha[m] = 0
  }
}

// เกลี่ยขอบ alpha ให้นุ่ม (box-blur separable)
const boxBlur1D = (src, dst, len, lineCount, startOf, stride, radius) => {
  const win = radius * 2 + 1
  for (let line = 0; line < lineCount; line++) {
    const start = startOf(line)
    let sum = 0
    for (let k = -radius; k <= radius; k++) sum += src[start + Math.min(len - 1, Math.max(0, k)) * stride]
    for (let i = 0; i < len; i++) {
      dst[start + i * stride] = sum / win
      sum += src[start + Math.min(len - 1, i + radius + 1) * stride] - src[start + Math.max(0, i - radius) * stride]
    }
  }
}
const fa = Float32Array.from(alpha)
const tmp = new Float32Array(px)
boxBlur1D(fa, tmp, w, h, (y) => y * w, 1, 1)
boxBlur1D(tmp, fa, h, w, (x) => x, w, 1)
for (let i = 0; i < px; i++) data[i * 4 + 3] = Math.round(fa[i])

const removed = alpha.reduce((s, v) => s + (v === 0 ? 1 : 0), 0)
console.log(`size ${w}x${h}, removed ${(removed / px * 100).toFixed(1)}% white bg`)

await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(OUT)
console.log('wrote', OUT)
