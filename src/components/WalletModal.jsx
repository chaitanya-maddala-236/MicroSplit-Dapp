import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'

export default function WalletModal() {
  const { showModal, setShowModal, connect, connecting, isPhantomInstalled } = useWallet()

  const handleConnect = async () => {
    await connect()
    if (isPhantomInstalled()) {
      setShowModal(false)
    }
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                👻
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
              <p className="text-slate-400 text-sm">Connect your Phantom wallet to use Micro-Split</p>
            </div>

            {!isPhantomInstalled() ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                  <p className="text-amber-400 text-sm font-medium">⚠️ Phantom not detected</p>
                  <p className="text-slate-400 text-xs mt-1">Install Phantom to continue</p>
                </div>
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2 text-center block"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                >
                  🔗 Install Phantom
                </a>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                  opacity: connecting ? 0.7 : 1
                }}
              >
                {connecting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="text-xl">👻</span>
                    Connect Phantom
                  </>
                )}
              </motion.button>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
