import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingOrbs from '../components/FloatingOrbs'
import { useWallet } from '../contexts/WalletContext'

export default function PaymentGeneratedPage() {
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const [splitData, setSplitData] = useState(null)
  const [copied, setCopied] = useState(null)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('currentSplit')
    if (!data) { navigate('/dashboard'); return }
    setSplitData(JSON.parse(data))
    const t = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(t)
  }, [navigate])

  if (!splitData) return null

  const baseUrl = window.location.origin
  const links = splitData.addresses.map((addr, i) => ({
    address: addr,
    url: `${baseUrl}/pay?to=${publicKey}&amount=${splitData.amountPerPerson}&from=${addr}`,
    short: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
  }))

  const copyLink = (url, idx) => {
    navigator.clipboard.writeText(url)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    const text = links.map((l, i) => `Participant ${i+1}: ${l.url}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingOrbs />

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
                animate={{ y: window.innerHeight + 20, rotate: Math.random() * 720 }}
                exit={{ opacity: 0 }}
                transition={{ duration: Math.random() * 3 + 2, delay: Math.random() * 2 }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  background: ['#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          ← Back to Dashboard
        </motion.button>

        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">
            Split <span className="gradient-text">Created!</span>
          </h1>
          <p className="text-slate-400">Share these links with your participants</p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(139,92,246,0.05))',
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 0 30px rgba(34,197,94,0.1)',
          }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-xs mb-1">Total</div>
              <div className="text-white font-bold">{splitData.totalAmount} SOL</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Participants</div>
              <div className="text-white font-bold">{splitData.numParticipants}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Each Pays</div>
              <div className="text-accent font-bold">{splitData.amountPerPerson} SOL</div>
            </div>
          </div>
        </motion.div>

        {/* Payment Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-6"
          style={{ border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Payment Links</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyAll}
              className="text-xs px-3 py-1.5 rounded-lg text-primary border border-primary/30 hover:bg-primary/10 transition-all"
            >
              {copied === 'all' ? '✓ All Copied!' : 'Copy All'}
            </motion.button>
          </div>

          <div className="space-y-3">
            {links.map((link, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
                className="bg-slate-700/40 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm font-medium">Participant {i + 1}</span>
                  <span className="text-slate-500 text-xs font-mono">{link.short}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={link.url}
                    className="flex-1 bg-transparent text-slate-400 text-xs font-mono truncate outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyLink(link.url, i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      copied === i
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                    }`}
                  >
                    {copied === i ? '✓ Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-split')}
            className="flex-1 btn-secondary py-3"
          >
            + New Split
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            Dashboard
          </motion.button>
        </div>
      </div>
    </div>
  )
}
