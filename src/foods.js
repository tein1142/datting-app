// 6 ตัวเลือกอาหาร — เปลี่ยน emoji / label ได้ตามใจเลย
export const FOODS = [
  { id: 'thai', emoji: '🍛', label: 'อาหารไทย' },
  { id: 'shabu', emoji: '🍲', label: 'ชาบู' },
  { id: 'ramen', emoji: '🍜', label: 'ราเมง' },
  { id: 'pizza', emoji: '🍕', label: 'พิซซ่า' },
  { id: 'cafe', emoji: '☕', label: 'คาเฟ่' },
  { id: 'kbbq', emoji: '🍖', label: 'ปิ้งย่างเกาหลี' },
]

export const foodById = (id) => FOODS.find((f) => f.id === id)
