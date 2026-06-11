# 💌 ชวนแฟนไปเที่ยว (Date Invite Web App)

เว็บน่ารักๆ 3 หน้า สำหรับชวนแฟนไปกินๆ เที่ยวๆ ทำด้วย React + Vite ใช้บนมือถือได้ deploy ขึ้น Vercel ได้เลย

## หน้าเว็บ
1. **หน้าถาม** (`/`) — "อยากไปกินๆ เที่ยวๆ กับเค้าไหม?" ปุ่ม No หนีเมาส์ กดได้แค่ Yes
2. **หน้าวางแผน** (`/plan`) — เลือกวันที่ + เวลา + อาหาร 6 อย่าง แล้วกดยืนยัน
3. **หน้าสรุป** (`/summary`) — แสดงวัน เวลา และเมนูที่เลือก พร้อมปุ่มส่งเข้า LINE

## รันบนเครื่อง
```bash
npm install
npm run dev
```
เปิด http://localhost:5173

## Build
```bash
npm run build      # ได้โฟลเดอร์ dist/
npm run preview    # ลองดู build จริง
```

## Deploy ขึ้น Vercel
1. push โค้ดขึ้น GitHub
2. เข้า https://vercel.com → New Project → เลือก repo นี้
3. Vercel จะตรวจเจอ Vite อัตโนมัติ (Build: `npm run build`, Output: `dist`) → กด Deploy

หรือใช้ CLI:
```bash
npm i -g vercel
vercel
```

## ปรับแต่ง
- **ตัวเลือกอาหาร** → แก้ที่ `src/foods.js`
- **ข้อความ / สี** → แก้ที่ไฟล์ใน `src/pages/` และสีในตัวแปร `:root` ของ `src/index.css`

## ข้อมูลถูกเก็บยังไง?
ข้อมูลที่เลือก (วัน/เวลา/อาหาร) ส่งต่อระหว่างหน้าด้วย React Context และเก็บใน `localStorage`
ของเบราว์เซอร์ (กันข้อมูลหายตอนรีเฟรช) — ไม่ต้องมี backend หน้าสรุปมีปุ่มแชร์เข้า LINE
เพื่อส่งข้อความนัดให้กันได้
