// หัวใจลอยขึ้นเป็นพื้นหลังน่ารักๆ (ตกแต่งเฉยๆ ไม่กดได้)
const HEARTS = ['💖', '💕', '💗', '🩷', '✨', '💞']

export default function Hearts() {
  const items = Array.from({ length: 12 })
  return (
    <div className="hearts" aria-hidden="true">
      {items.map((_, i) => {
        const left = (i * 8.3 + (i % 3) * 5) % 100
        const delay = (i % 6) * 1.4
        const duration = 9 + (i % 5) * 2
        const size = 16 + (i % 4) * 8
        return (
          <span
            key={i}
            className="heart"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${size}px`,
            }}
          >
            {HEARTS[i % HEARTS.length]}
          </span>
        )
      })}
    </div>
  )
}
