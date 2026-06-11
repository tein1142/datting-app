import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDatePlan } from '../state.jsx'
import cryCat from '../assets/cry-cat.jpg'

// ข้อความเปลี่ยนไปเรื่อยๆ ทุกครั้งที่พยายามกด No ให้ขำๆ
const NO_TAUNTS = [
  'No',
  'แน่ใจ? 🥺',
  'คิดดีๆ นะ',
  'ไม่ได้น้า~',
  'อย่าน้าาา 😭',
  'กดไม่โดนหรอก 😝',
  'ยอมแพ้เถอะ 💕',
]

export default function AskPage() {
  const navigate = useNavigate()
  const { update } = useDatePlan()
  const areaRef = useRef(null)
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const [dodges, setDodges] = useState(0)

  // ย้ายปุ่ม No ไปตำแหน่งสุ่มภายในกรอบ ทำให้กดไม่โดน
  const dodge = () => {
    const area = areaRef.current
    if (!area) return
    const padding = 70
    const maxX = Math.max(40, area.clientWidth - padding * 2)
    const maxY = Math.max(40, area.clientHeight - padding * 2)
    // ใช้ค่าสุ่มแต่เลี่ยงค่ากลางๆ ให้กระโดดไกลขึ้น
    const rx = (Math.random() - 0.5) * maxX
    const ry = (Math.random() - 0.5) * maxY
    setNoPos({ x: rx, y: ry })
    setDodges((d) => d + 1)
  }

  const onNoTouch = (e) => {
    e.preventDefault()
    dodge()
  }

  const sayYes = () => {
    update({ answeredYes: true })
    navigate('/plan')
  }

  const noLabel = NO_TAUNTS[Math.min(dodges, NO_TAUNTS.length - 1)]

  return (
    <motion.main
      className="page center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card">
        <img className="ask-cat" src={cryCat} alt="แมวตาละห้อย" />
        <h1>อยากไปกินๆ เที่ยวๆ<br />กับเค้าไหม?</h1>
        <p className="sub">เลือกเลยน้า~ 💕</p>

        <div className="ask-area" ref={areaRef}>
          <button className="btn btn-yes" onClick={sayYes}>
            Yes 💖
          </button>

          <motion.button
            type="button"
            className="btn btn-no"
            animate={{ x: noPos.x, y: noPos.y }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            onMouseEnter={dodge}
            onClick={dodge}
            onTouchStart={onNoTouch}
          >
            {noLabel}
          </motion.button>
        </div>

        {dodges > 2 && (
          <p className="hint">(ปุ่ม No มันหนีน่ะ… กด Yes สิ 😆)</p>
        )}
      </div>
    </motion.main>
  )
}
