import { createContext, useContext, useEffect, useState } from 'react'

const DateContext = createContext(null)

const STORAGE_KEY = 'our-date-plan'

const initialState = {
  answeredYes: false,
  date: '',
  time: '',
  foods: [], // array of food ids
  note: '', // ข้อความ/เมนูพิเศษที่พิมพ์เอง
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState, ...JSON.parse(raw) }
  } catch {
    // ignore corrupt storage
  }
  return initialState
}

export function DateProvider({ children }) {
  const [plan, setPlan] = useState(load)

  // persist every change so a refresh (or coming back later) keeps the data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
    } catch {
      // ignore quota / private-mode errors
    }
  }, [plan])

  const update = (patch) => setPlan((prev) => ({ ...prev, ...patch }))
  const reset = () => setPlan(initialState)

  return (
    <DateContext.Provider value={{ plan, update, reset }}>
      {children}
    </DateContext.Provider>
  )
}

export function useDatePlan() {
  const ctx = useContext(DateContext)
  if (!ctx) throw new Error('useDatePlan must be used within DateProvider')
  return ctx
}
