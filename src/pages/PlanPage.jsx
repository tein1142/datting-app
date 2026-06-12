import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDatePlan } from '../state.jsx'
import { FOODS } from '../foods.js'

export default function PlanPage() {
  const navigate = useNavigate()
  const { plan, update } = useDatePlan()

  const [date, setDate] = useState(plan.date)
  const [time, setTime] = useState(plan.time)
  const [foods, setFoods] = useState(plan.foods)
  const [note, setNote] = useState(plan.note)
  const [error, setError] = useState('')

  // ถ้ายังไม่ได้ตอบ Yes ให้กลับไปหน้าแรกก่อน
  useEffect(() => {
    if (!plan.answeredYes) navigate('/', { replace: true })
  }, [plan.answeredYes, navigate])

  const toggleFood = (id) => {
    setFoods((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
    setError('')
  }

  const submit = () => {
    if (!date) return setError('เลือกวันที่ก่อนน้า 📅')
    if (!time) return setError('เลือกเวลาด้วยน้า ⏰')
    if (foods.length === 0) return setError('เลือกอาหารอย่างน้อย 1 อย่างน้า 🍽️')
    update({ date, time, foods, note: note.trim() })
    navigate('/summary')
  }

  // วันที่ขั้นต่ำ = วันนี้ (กันเลือกย้อนหลัง)
  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.main
      className="page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card card-wide">
        <div className="big-emoji">🥰</div>
        <h1>ดีใจที่ตอบตกลงคับบ</h1>
        <p className="sub">ไปเท่ววกันนน 😆💕</p>

        <section className="field">
          <label className="field-label">📅 ไปวันไหนดี?</label>
          <input
            type="date"
            className="input"
            value={date}
            min={today}
            onChange={(e) => { setDate(e.target.value); setError('') }}
          />
        </section>

        <section className="field">
          <label className="field-label">⏰ กี่โมงดี?</label>
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => { setTime(e.target.value); setError('') }}
          />
        </section>

        <section className="field">
          <label className="field-label">🍽️ อยากกินอะไร? (เลือกได้หลายอย่าง)</label>
          <div className="food-grid">
            {FOODS.map((f) => {
              const active = foods.includes(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`food-card ${active ? 'active' : ''}`}
                  onClick={() => toggleFood(f.id)}
                >
                  <span className="food-emoji">{f.emoji}</span>
                  <span className="food-label">{f.label}</span>
                  {active && <span className="food-check">✓</span>}
                </button>
              )
            })}
          </div>
        </section>

        <section className="field">
          <label className="field-label">📝 อยากกินอะไรเป็นพิเศษ? (พิมพ์ได้เลย)</label>
          <input
            type="text"
            className="input"
            placeholder="เช่น ร้านหมูกระทะเจ้าประจำ, ชานมไข่มุก..."
            value={note}
            maxLength={120}
            onChange={(e) => setNote(e.target.value)}
          />
        </section>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-submit" onClick={submit}>
          ยืนยันนัดเดต 💌
        </button>
      </div>
    </motion.main>
  )
}
