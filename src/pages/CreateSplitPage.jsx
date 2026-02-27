import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import FloatingOrbs from '../components/FloatingOrbs'
import { PublicKey } from '@solana/web3.js'

function isValidPublicKey(address) {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export default function CreateSplitPage() {
  const { publicKey } = useWallet()
  const navigate = useNavigate()
  const [totalAmount, setTotalAmount] = useState('')
  const [numParticipants, setNumParticipants] = useState(2)
  const [addresses, setAddresses] = useState(['', ''])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!publicKey) navigate('/')
  }, [publicKey, navigate])

  useEffect(() => {
    setAddresses(prev => Array.from({ length: numParticipants }, (_, i) => prev[i] || ''))
  }, [numParticipants])

  const amountPerPerson = totalAmount && numParticipants > 0
    ? (parseFloat(totalAmount) / numParticipants).toFixed(6)
    : '0'

  const validate = () => {
    const newErrors = {}
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    addresses.forEach((addr, i) => {
      if (!addr) {
        newErrors[`addr_${i}`] = 'Address is required'
      } else if (!isValidPublicKey(addr)) {
        newErrors[`addr_${i}`] = 'Invalid wallet address'
      }
    })
    const unique = new Set(addresses.filter(Boolean))
    if (unique.size !== addresses.filter(Boolean).length) {
      newErrors.duplicate = 'Duplicate addresses detected'
    }
    if (addresses.includes(publicKey)) {
      newErrors.self = 'Cannot include your own address'
    }
    return newErrors
  }

  const isValid = () => {
    const e = validate()
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      const splitData = {
        totalAmount: parseFloat(totalAmount),
        numParticipants,
        addresses,
        amountPerPerson: parseFloat(amountPerPerson),
        createdAt: new Date().toISOString(),
        creator: publicKey,
      }
      localStorage.setItem('currentSplit', JSON.stringify(splitData))
      navigate('/payment-generated')
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingOrbs />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          ← Back to Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2">
            Create <span className="gradient-text">Split</span>
          </h1>
          <p className="text-slate-400">Enter the expense details and participants</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Amount Card */}
          <div className="card" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <label className="text-white font-semibold block mb-2">
              Total Amount (SOL)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">◎</span>
              <input
                type="number"
                step="0.001"
                min="0"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                placeholder="0.000"
                className="input-field pl-10"
              />
            </div>
            {errors.amount && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-error text-xs mt-2 flex items-center gap-1"
              >
                ⚠ {errors.amount}
              </motion.p>
            )}
          </div>

          {/* Participants */}
          <div className="card" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <label className="text-white font-semibold block mb-2">
              Number of Participants
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setNumParticipants(Math.max(2, numParticipants - 1))}
                className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold hover:bg-primary/50 transition-colors"
              >
                −
              </button>
              <span className="text-3xl font-black text-white">{numParticipants}</span>
              <button
                type="button"
                onClick={() => setNumParticipants(Math.min(10, numParticipants + 1))}
                className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold hover:bg-primary/50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Preview */}
          <AnimatePresence>
            {totalAmount && parseFloat(totalAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(139,92,246,0.05))',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <div className="text-slate-400 text-sm mb-1">Each person pays</div>
                <motion.div
                  key={amountPerPerson}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-black gradient-text"
                >
                  {amountPerPerson} SOL
                </motion.div>
                <div className="text-slate-500 text-xs mt-1">
                  {totalAmount} SOL ÷ {numParticipants} people
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Addresses */}
          <div className="card" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <label className="text-white font-semibold block mb-4">
              Participant Wallet Addresses
            </label>
            {errors.duplicate && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-error text-xs mb-3 flex items-center gap-1"
              >
                ⚠ {errors.duplicate}
              </motion.p>
            )}
            {errors.self && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-error text-xs mb-3 flex items-center gap-1"
              >
                ⚠ {errors.self}
              </motion.p>
            )}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {addresses.map((addr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <label className="text-slate-400 text-xs mb-1 block">Participant {i + 1}</label>
                    <input
                      type="text"
                      value={addr}
                      onChange={e => {
                        const next = [...addresses]
                        next[i] = e.target.value
                        setAddresses(next)
                      }}
                      placeholder="Solana wallet address..."
                      className={`input-field font-mono text-sm ${errors[`addr_${i}`] ? 'border-error' : ''}`}
                    />
                    {errors[`addr_${i}`] && (
                      <p className="text-error text-xs mt-1">⚠ {errors[`addr_${i}`]}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: isValid() ? 1.02 : 1 }}
            whileTap={{ scale: isValid() ? 0.98 : 1 }}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200"
            style={{
              background: isValid()
                ? 'linear-gradient(135deg, #8b5cf6, #22c55e)'
                : 'rgba(100,100,100,0.3)',
              boxShadow: isValid() ? '0 0 30px rgba(139,92,246,0.4)' : 'none',
              color: isValid() ? 'white' : '#64748b',
              cursor: isValid() ? 'pointer' : 'not-allowed',
            }}
          >
            🚀 Generate Split
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
