import { motion } from 'framer-motion'

export default function FloatingOrbs() {
  const orbs = [
    { size: 300, x: '10%', y: '20%', color: '#8b5cf6', delay: 0, duration: 8 },
    { size: 200, x: '80%', y: '10%', color: '#22c55e', delay: 2, duration: 10 },
    { size: 250, x: '60%', y: '70%', color: '#6366f1', delay: 1, duration: 7 },
    { size: 150, x: '20%', y: '80%', color: '#8b5cf6', delay: 3, duration: 9 },
    { size: 180, x: '45%', y: '40%', color: '#22c55e', delay: 1.5, duration: 6 },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}20 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -30, 20, -10, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
