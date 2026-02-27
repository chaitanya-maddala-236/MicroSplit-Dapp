import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import WalletModal from '../components/WalletModal'
import FloatingOrbs from '../components/FloatingOrbs'

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { publicKey, balance, connect, setShowModal, sendTransaction } = useWallet()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const to = searchParams.get('to') || ''
  const amount = parseFloat(searchParams.get('amount') || '0')
  const from = searchParams.get('from') || ''

  const shortTo = to ? `${to.slice(0, 4)}...${to.slice(-4)}` : 'Unknown'

  const handlePay = async () => {
    setError('')
    setPaying(true)
    try {
      const signature = await sendTransaction(to, amount)
      navigate(`/confirmation?signature=${signature}&amount=${amount}&to=${to}`)
    } catch (err) {
      setError(err.message || 'Transaction failed')
    } finally {
      setPaying(false)
    }
  }

  const hasBalance = balance !== null && balance >= amount

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <FloatingOrbs />
      <WalletModal />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="card"
          style={{
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 50px rgba(139,92,246,0.15)',
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              💸
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-1">Payment Request</h1>
            <p className="text-slate-400 text-sm">Complete your split payment</p>
          </div>

          {/* Amount */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center py-6 mb-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,197,94,0.1))',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="text-slate-400 text-sm mb-2">Amount Due</div>
            <div className="text-5xl font-black gradient-text mb-1">{amount}</div>
            <div className="text-2xl text-slate-300 font-bold">SOL</div>
          </motion.div>

          {/* To address */}
          <div className="bg-slate-700/40 rounded-xl p-4 mb-6">
            <div className="text-slate-400 text-xs mb-1">Pay To</div>
            <div className="text-white font-mono text-sm">{shortTo}</div>
            {from && (
              <div className="text-slate-500 text-xs mt-1">
                Your wallet: {`${from.slice(0, 4)}...${from.slice(-4)}`}
              </div>
            )}
          </div>

          {/* Balance warning */}
          {publicKey && !hasBalance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-center"
            >
              <p className="text-amber-400 text-sm">⚠️ Insufficient balance</p>
              <p className="text-slate-400 text-xs mt-1">
                You have {balance?.toFixed(4) ?? 0} SOL but need {amount} SOL
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-error/10 border border-error/30 rounded-xl p-3 mb-4 text-center"
            >
              <p className="text-error text-sm">⚠ {error}</p>
            </motion.div>
          )}

          {/* Action Button */}
          {!publicKey ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 0 25px rgba(139,92,246,0.4)',
              }}
            >
              🔗 Connect Wallet to Pay
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: !paying && hasBalance ? 1.03 : 1 }}
              whileTap={{ scale: !paying && hasBalance ? 0.97 : 1 }}
              onClick={handlePay}
              disabled={paying || !hasBalance}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all"
              style={{
                background: paying || !hasBalance
                  ? 'rgba(100,100,100,0.3)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: !paying && hasBalance ? '0 0 25px rgba(34,197,94,0.4)' : 'none',
                color: paying || !hasBalance ? '#64748b' : 'white',
                cursor: paying || !hasBalance ? 'not-allowed' : 'pointer',
              }}
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                `💳 Pay ${amount} SOL`
              )}
            </motion.button>
          )}

          <div className="mt-4 text-center text-slate-500 text-xs">
            Transaction will be executed on Solana Devnet
          </div>
        </motion.div>
      </div>
    </div>
  )
}
