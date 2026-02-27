import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ParticleBackground from '../components/ParticleBackground'
import FloatingOrbs from '../components/FloatingOrbs'
import WalletModal from '../components/WalletModal'
import Navbar from '../components/Navbar'
import { useWallet } from '../contexts/WalletContext'
import { useEffect } from 'react'

const steps = [
  { icon: '🔗', title: 'Connect Wallet', desc: 'Link your Phantom wallet in one click. Secure and instant.' },
  { icon: '💰', title: 'Enter Amount & Friends', desc: 'Add total expense and your friends\' wallet addresses.' },
  { icon: '🚀', title: 'Generate Payment Link', desc: 'Share a link — friends pay instantly on-chain.' },
]

const benefits = [
  { icon: '⚡', title: 'Instant Settlement', desc: 'Transactions confirm in seconds on Solana.' },
  { icon: '🔍', title: 'Transparent Payments', desc: 'Every payment is verifiable on the public ledger.' },
  { icon: '🔔', title: 'No Manual Reminders', desc: 'Payment links do the work — on-chain and automated.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { publicKey, connect, setShowModal } = useWallet()

  useEffect(() => {
    if (publicKey) navigate('/dashboard')
  }, [publicKey, navigate])

  const handleConnect = () => setShowModal(true)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingOrbs />
      <ParticleBackground />
      <WalletModal />
      <Navbar onConnect={handleConnect} />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-6"
          >
            ⚡
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-white">Micro</span>
            <span className="gradient-text">Split</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-300 mb-2 font-medium"
          >
            Split expenses instantly on Solana.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 mb-10 max-w-md mx-auto"
          >
            Trustless peer-to-peer expense splitting powered by Phantom wallet and Solana Devnet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleConnect}
              className="px-8 py-4 rounded-xl font-bold text-white text-lg relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 0 30px rgba(139,92,246,0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative z-10">🔗 Connect Phantom Wallet</span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              href="#how-it-works"
              className="btn-secondary px-8 py-4 text-lg"
            >
              How It Works ↓
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          className="absolute left-8 top-1/3 hidden lg:block"
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="card text-left w-52 opacity-60 text-sm">
            <div className="text-accent font-bold">✓ Payment Sent</div>
            <div className="text-slate-400 text-xs mt-1">0.5 SOL to 3kDf...9LmP</div>
            <div className="text-slate-500 text-xs">2s ago · Devnet</div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-8 top-1/3 hidden lg:block"
          animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="card text-left w-52 opacity-60 text-sm">
            <div className="text-primary font-bold">Split Created</div>
            <div className="text-slate-400 text-xs mt-1">2 SOL ÷ 4 people</div>
            <div className="text-accent text-xs">= 0.5 SOL each</div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-slate-400">Three simple steps to split expenses on-chain</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="card text-center relative overflow-hidden group cursor-pointer"
              style={{ border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(34,197,94,0.05))' }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="text-4xl mb-4"
              >
                {step.icon}
              </motion.div>
              <div className="text-primary font-bold text-sm mb-2">Step {i + 1}</div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why <span className="gradient-text">Micro-Split?</span></h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="card"
              style={{ border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="text-white font-bold mb-2">{b.title}</h3>
              <p className="text-slate-400 text-sm">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto card"
          style={{ border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}
        >
          <h2 className="text-3xl font-black text-white mb-3">Ready to Split?</h2>
          <p className="text-slate-400 mb-8">Connect your Phantom wallet and start splitting expenses on Solana.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnect}
            className="px-10 py-4 rounded-xl font-bold text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #22c55e)',
              boxShadow: '0 0 30px rgba(139,92,246,0.4)',
            }}
          >
            🚀 Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-slate-800">
        <p>Micro-Split · Built on Solana Devnet · Powered by Phantom</p>
      </footer>
    </div>
  )
}
