import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import FloatingOrbs from '../components/FloatingOrbs'
import ParticleBackground from '../components/ParticleBackground'

export default function DashboardPage() {
  const { publicKey, balance, disconnect, fetchBalance } = useWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (!publicKey) navigate('/')
  }, [publicKey, navigate])

  useEffect(() => {
    if (publicKey) fetchBalance(publicKey)
  }, [publicKey, fetchBalance])

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : ''

  const copyAddress = () => {
    navigator.clipboard.writeText(publicKey || '')
    alert('Address copied!')
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingOrbs />
      <ParticleBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome to <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400">Manage your splits and wallet</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-3xl"
              >
                👻
              </motion.div>
              <div>
                <div className="text-white font-bold">Phantom Wallet</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-accent text-xs font-medium">Connected · Devnet</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/40 rounded-xl p-4 mb-4">
              <div className="text-slate-400 text-xs mb-1">Wallet Address</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-sm">{shortAddress}</span>
                <button
                  onClick={copyAddress}
                  className="text-primary text-xs hover:underline"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-slate-700/40 rounded-xl p-4 mb-6">
              <div className="text-slate-400 text-xs mb-1">SOL Balance</div>
              {balance === null ? (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-7 w-24 bg-slate-600 rounded"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-3xl font-black text-white">{balance.toFixed(4)}</span>
                  <span className="text-slate-400 font-medium">SOL</span>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchBalance(publicKey)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => { disconnect(); navigate('/') }}
                className="flex-1 py-2 rounded-xl text-error border border-error/30 text-sm hover:bg-error/10 transition-all"
              >
                Disconnect
              </button>
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card flex flex-col"
            style={{ border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/create-split')}
              className="flex items-center gap-4 p-5 rounded-xl cursor-pointer mb-4 group"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.1))',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <div className="text-3xl">➗</div>
              <div>
                <div className="text-white font-bold group-hover:text-primary transition-colors">Create New Split</div>
                <div className="text-slate-400 text-sm">Split expenses with friends</div>
              </div>
              <div className="ml-auto text-slate-500 group-hover:text-primary transition-colors">→</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-center gap-4 p-5 rounded-xl cursor-not-allowed opacity-50"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="text-3xl">📜</div>
              <div>
                <div className="text-white font-bold">Activity History</div>
                <div className="text-slate-400 text-sm">Coming soon</div>
              </div>
              <div className="ml-auto text-xs text-slate-600 border border-slate-700 px-2 py-0.5 rounded">Soon</div>
            </motion.div>

            <div className="mt-auto pt-6 text-center">
              <div className="text-slate-500 text-xs">Powered by Solana Devnet</div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs">Network Online</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mt-8"
        >
          {[
            { label: 'Network', value: 'Devnet', icon: '🌐' },
            { label: 'Wallet', value: 'Phantom', icon: '👻' },
            { label: 'Token', value: 'SOL', icon: '◎' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="card text-center py-4"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-slate-500 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
