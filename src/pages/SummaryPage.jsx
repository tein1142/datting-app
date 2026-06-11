import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { useDatePlan } from '../state.jsx'
import { foodById } from '../foods.js'
import catImg from '../assets/cat.png'

// แปลงวันที่เป็นภาษาไทยสวยๆ เช่น "วันเสาร์ที่ 14 มิถุนายน 2569"
function formatThaiDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  return `วัน${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}

export default function SummaryPage() {
  const navigate = useNavigate()
  const { plan } = useDatePlan()
  const { date, time, foods, note } = plan

  // ถ้าไม่มีข้อมูล (เข้าตรงๆ) ให้กลับไปเริ่มใหม่
  useEffect(() => {
    if (!date || !time || foods.length === 0) navigate('/', { replace: true })
  }, [date, time, foods, navigate])

  if (!date || !time || foods.length === 0) return null

  const selectedFoods = foods.map(foodById).filter(Boolean)
  const thaiDate = formatThaiDate(date)

  const captureRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // แคปการ์ดสรุปเป็นรูป PNG แล้วดาวน์โหลด (ไว้ส่งให้แฟนทีหลัง)
  const saveImage = async () => {
    if (!captureRef.current || saving) return
    setSaving(true)
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#fff2f8',
      })
      const link = document.createElement('a')
      link.download = 'our-date.png'
      link.href = dataUrl
      link.click()
      setSaved(true)
      setTimeout(() => setSaved(false), 3500)
    } catch (e) {
      console.error('save image failed', e)
      alert('บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้งน้า 🥲')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.main
      className="page center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45 }}
    >
      <div className="card">
        <div className="capture-area" ref={captureRef}>
        <div className="couple-wrap">
          <span className="glow" />
          <img className="cat-photo" src={catImg} alt="แมวถือดอกไม้ให้เธอ" />
          <span className="sparkle s1">✨</span>
          <span className="sparkle s2">💕</span>
          <span className="sparkle s3">💖</span>
          <span className="sparkle s4">⭐</span>
        </div>
        <h1>นัดเดตเรียบร้อย!</h1>
        <p className="sub">เจอกานนนน 💕</p>

        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-key">📅 วันที่</span>
            <span className="summary-val">{thaiDate}</span>
          </div>
          <div className="summary-row">
            <span className="summary-key">⏰ เวลา</span>
            <span className="summary-val">{time} น.</span>
          </div>
          <div className="summary-row summary-foods">
            <span className="summary-key">🍽️ เมนูที่อยากกิน</span>
            <div className="summary-food-chips">
              {selectedFoods.map((f) => (
                <span key={f.id} className="chip">
                  {f.emoji} {f.label}
                </span>
              ))}
            </div>
          </div>
          {note && (
            <div className="summary-row">
              <span className="summary-key">📝 อยากกินเป็นพิเศษ</span>
              <span className="summary-val">{note}</span>
            </div>
          )}
        </div>

        <p className="closing">ไว้เจอกันน้า ที่รัก~ 💖✨</p>
        </div>

        <p className="capture-hint">📸 บันทึกรูปนี้ไว้ แล้วส่งให้แฟนทีหลังน้า~</p>
        <div className="action-row">
          <button className="btn btn-capture" onClick={saveImage} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว! 🎉' : 'บันทึกรูปหน้านี้ 📸'}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/plan')}>
            แก้ไขนัด ✏️
          </button>
        </div>
      </div>
    </motion.main>
  )
}
