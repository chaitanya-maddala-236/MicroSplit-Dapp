import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'

export default function Navbar({ onConnect }) {
  const { publicKey, disconnect } = useWallet()

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(139,92,246,0.1)',
      }}
    >
      <Link to="/" className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-2xl"
        >
          ⚡
        </motion.div>
        <span className="text-xl font-bold gradient-text">Micro-Split</span>
      </Link>

      {publicKey ? (
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-slate-800/80 border border-slate-600/50 px-4 py-2 rounded-xl text-sm"
          >
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-slate-300">{shortAddress}</span>
          </motion.div>
          <button
            onClick={disconnect}
            className="text-slate-400 hover:text-error text-sm transition-colors px-3 py-2 rounded-lg hover:bg-error/10"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConnect}
          className="btn-primary text-sm"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
        >
          Connect Wallet
        </motion.button>
      )}
    </motion.nav>
  )
}
