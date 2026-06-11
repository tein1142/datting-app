// 6 ตัวเลือกอาหาร — เปลี่ยน emoji / label ได้ตามใจเลย
export const FOODS = [
  { id: 'thai', emoji: '🍛', label: 'อาหารไทย' },
  { id: 'shabu', emoji: '🍲', label: 'ชาบู' },
  { id: 'japanese', emoji: '🍣', label: 'อาหารญี่ปุ่น' },
  { id: 'pizza', emoji: '🍕', label: 'พิซซ่า' },
  { id: 'cafe', emoji: '☕', label: 'คาเฟ่' },
  { id: 'isan', emoji: '🥗', label: 'อาหารอีสาน' },
]

export const foodById = (id) => FOODS.find((f) => f.id === id)
