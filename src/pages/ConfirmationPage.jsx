import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import FloatingOrbs from '../components/FloatingOrbs'

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const signature = searchParams.get('signature') || ''
  const amount = searchParams.get('amount') || '0'
  const to = searchParams.get('to') || ''
  const failed = searchParams.get('failed') === 'true'
  const [copied, setCopied] = useState(false)

  const shortSig = signature ? `${signature.slice(0, 8)}...${signature.slice(-8)}` : ''
  const shortTo = to ? `${to.slice(0, 4)}...${to.slice(-4)}` : ''
  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`

  const copyHash = () => {
    navigator.clipboard.writeText(signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <FloatingOrbs />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.7 }}
          className="card"
          style={{
            border: failed ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
            boxShadow: failed
              ? '0 0 40px rgba(239,68,68,0.1)'
              : '0 0 40px rgba(34,197,94,0.1)',
          }}
        >
          {!failed ? (
            /* Success State */
            <div className="text-center">
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, duration: 0.7 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
              >
                <motion.svg
                  viewBox="0 0 40 40"
                  className="w-12 h-12"
                >
                  <motion.path
                    d="M8 20 L16 28 L32 12"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.svg>
              </motion.div>

              <h1 className="text-3xl font-black text-white mb-2">Payment Sent!</h1>
              <p className="text-slate-400 text-sm mb-8">Your transaction was confirmed on Solana Devnet</p>

              {/* Amount */}
              <div className="bg-slate-700/40 rounded-xl p-4 mb-4 text-center">
                <div className="text-slate-400 text-xs mb-1">Amount Paid</div>
                <div className="text-2xl font-black text-accent">{amount} SOL</div>
                {shortTo && <div className="text-slate-500 text-xs mt-1">To: {shortTo}</div>}
              </div>

              {/* Transaction Hash */}
              {signature && (
                <div className="bg-slate-700/40 rounded-xl p-4 mb-6">
                  <div className="text-slate-400 text-xs mb-2">Transaction Hash</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono text-xs flex-1 truncate">{shortSig}</span>
                    <button
                      onClick={copyHash}
                      className="text-primary text-xs hover:underline whitespace-nowrap"
                    >
                      {copied ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {signature && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 rounded-xl text-white font-bold text-center"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      boxShadow: '0 0 20px rgba(34,197,94,0.3)',
                    }}
                  >
                    🔍 View on Solana Explorer
                  </motion.a>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="block w-full py-3 rounded-xl btn-secondary"
                >
                  Back to Home
                </motion.button>
              </div>
            </div>
          ) : (
            /* Failure State */
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                ❌
              </motion.div>
              <h1 className="text-3xl font-black text-white mb-2">Transaction Failed</h1>
              <p className="text-slate-400 text-sm mb-8">
                {searchParams.get('error') || 'Something went wrong. Please try again.'}
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(-1)}
                  className="w-full py-3 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                >
                  🔄 Retry Payment
                </motion.button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-xl btn-secondary"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
