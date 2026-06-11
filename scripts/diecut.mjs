// ไดคัทพื้นหลังดำออกแบบเนียน:
//  - flood-fill จากขอบภาพ เพื่อลบเฉพาะ "พื้นหลังดำ" ที่ติดกับขอบ
//    (ไม่ใช่ลบดำทั้งภาพ จะได้ไม่กินเส้นผม/รายละเอียด)
//  - เกลี่ย (blur) ช่อง alpha เล็กน้อย ให้ขอบเส้นผมนุ่ม ไม่หยัก
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '..', 'src', 'assets', 'couple-original.jpg')
const OUT = path.join(__dirname, '..', 'src', 'assets', 'couple.png')

// ปรับขนาดให้พอเหมาะกับเว็บ (เร็วขึ้น + ไฟล์เล็ก)
const TARGET_W = 1000
// ความ "ดำ" ที่ถือว่าเป็นพื้นหลัง
const HARD = 48 // ขอบภาพต้องดำกว่านี้ถึงเริ่มลาม
const SOFT = 90 // ลามต่อไปได้ถ้าค่าความสว่างต่ำกว่านี้

const img = sharp(SRC).resize({ width: TARGET_W })
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const px = w * h

const maxChannel = (i) => {
  const o = i * 4
  return Math.max(data[o], data[o + 1], data[o + 2])
}

// alpha mask: 255 = เก็บไว้, 0 = พื้นหลัง
const alpha = new Uint8Array(px).fill(255)
const visited = new Uint8Array(px)
const stack = []

const seed = (x, y) => {
  const i = y * w + x
  if (!visited[i] && maxChannel(i) < HARD) {
    visited[i] = 1
    stack.push(i)
  }
}
for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }

while (stack.length) {
  const i = stack.pop()
  alpha[i] = 0
  const x = i % w
  const y = (i / w) | 0
  const nb = []
  if (x > 0) nb.push(i - 1)
  if (x < w - 1) nb.push(i + 1)
  if (y > 0) nb.push(i - w)
  if (y < h - 1) nb.push(i + w)
  for (const n of nb) {
    if (!visited[n] && maxChannel(n) < SOFT) {
      visited[n] = 1
      stack.push(n)
    }
  }
}

const removed = alpha.reduce((s, v) => s + (v === 0 ? 1 : 0), 0)
console.log(`size ${w}x${h}, removed ${(removed / px * 100).toFixed(1)}% as background`)

// หดขอบ (erode) เพื่อตัดขอบขาว/แสงเรืองที่ยังเหลือรอบตัว
const ERODE = 2
for (let pass = 0; pass < ERODE; pass++) {
  const snap = alpha.slice()
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (snap[i] === 0) continue
      // ถ้าเพื่อนบ้านด้านใดเป็นพื้นหลัง → ตัดพิกเซลขอบนี้ออก
      if (
        (x > 0 && snap[i - 1] === 0) ||
        (x < w - 1 && snap[i + 1] === 0) ||
        (y > 0 && snap[i - w] === 0) ||
        (y < h - 1 && snap[i + w] === 0)
      ) {
        alpha[i] = 0
      }
    }
  }
}

// เกลี่ยขอบ alpha ให้นุ่ม ด้วย box-blur แบบ separable (เขียนเองกัน buffer เพี้ยน)
// blur 1 มิติ: lineCount เส้น แต่ละเส้นยาว len, เริ่มที่ startOf(line), ก้าวทีละ stride
const boxBlur1D = (src, dst, len, lineCount, startOf, stride, radius) => {
  const win = radius * 2 + 1
  for (let line = 0; line < lineCount; line++) {
    const start = startOf(line)
    let sum = 0
    for (let k = -radius; k <= radius; k++) {
      sum += src[start + Math.min(len - 1, Math.max(0, k)) * stride]
    }
    for (let i = 0; i < len; i++) {
      dst[start + i * stride] = sum / win
      const addI = Math.min(len - 1, i + radius + 1)
      const subI = Math.max(0, i - radius)
      sum += src[start + addI * stride] - src[start + subI * stride]
    }
  }
}
// ลบชิ้นส่วนเล็กๆ ที่หลุดลอย: เก็บเฉพาะ connected component ที่ใหญ่พอ
const MIN_AREA = px * 0.004 // ก้อนที่เล็กกว่า 0.4% ของภาพ ถือว่าเป็นเศษ ตัดทิ้ง
{
  const lab = new Int32Array(px).fill(-1)
  const q = new Int32Array(px)
  for (let s = 0; s < px; s++) {
    if (alpha[s] === 0 || lab[s] !== -1) continue
    // BFS เก็บสมาชิกของก้อนนี้
    let head = 0, tail = 0
    q[tail++] = s
    lab[s] = s
    const members = [s]
    while (head < tail) {
      const i = q[head++]
      const x = i % w, y = (i / w) | 0
      const nb = []
      if (x > 0) nb.push(i - 1)
      if (x < w - 1) nb.push(i + 1)
      if (y > 0) nb.push(i - w)
      if (y < h - 1) nb.push(i + w)
      for (const n of nb) {
        if (alpha[n] !== 0 && lab[n] === -1) {
          lab[n] = s
          q[tail++] = n
          members.push(n)
        }
      }
    }
    if (members.length < MIN_AREA) {
      for (const m of members) alpha[m] = 0 // เศษเล็ก → โปร่งใส
    }
  }
}

const fa = Float32Array.from(alpha)
const tmp = new Float32Array(px)
const R = 1
boxBlur1D(fa, tmp, w, h, (y) => y * w, 1, R) // แนวนอน: h แถว เริ่มที่ y*w ก้าว 1
boxBlur1D(tmp, fa, h, w, (x) => x, w, R)     // แนวตั้ง: w คอลัมน์ เริ่มที่ x ก้าว w

// เขียน alpha ที่เกลี่ยแล้วกลับเข้า buffer RGBA โดยตรง
for (let i = 0; i < px; i++) {
  data[i * 4 + 3] = Math.round(fa[i])
}

await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT)

console.log('wrote', OUT)
