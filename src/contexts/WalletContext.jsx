import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [balance, setBalance] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const connection = useMemo(() => new Connection(clusterApiUrl('devnet'), 'confirmed'), [])

  const isPhantomInstalled = () => {
    return typeof window !== 'undefined' && window.solana && window.solana.isPhantom
  }

  const fetchBalance = useCallback(async (pubKey) => {
    try {
      const bal = await connection.getBalance(new PublicKey(pubKey))
      setBalance(bal / LAMPORTS_PER_SOL)
    } catch {
      setBalance(0)
    }
  }, [connection])

  const connect = useCallback(async () => {
    if (!isPhantomInstalled()) {
      setShowModal(true)
      return
    }
    setConnecting(true)
    try {
      const resp = await window.solana.connect()
      setPublicKey(resp.publicKey.toString())
      setWallet(window.solana)
      await fetchBalance(resp.publicKey.toString())
    } catch (err) {
      console.error('Connection failed:', err)
    } finally {
      setConnecting(false)
    }
  }, [fetchBalance])

  const disconnect = useCallback(async () => {
    if (wallet) {
      await wallet.disconnect()
    }
    setWallet(null)
    setPublicKey(null)
    setBalance(null)
  }, [wallet])

  const sendTransaction = useCallback(async (toAddress, amountSol) => {
    if (!wallet || !publicKey) throw new Error('Wallet not connected')
    const toPubKey = new PublicKey(toAddress)
    const fromPubKey = new PublicKey(publicKey)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubKey,
        toPubkey: toPubKey,
        lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
      })
    )
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubKey
    const signed = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(signature, 'confirmed')
    await fetchBalance(publicKey)
    return signature
  }, [wallet, publicKey, connection, fetchBalance])

  useEffect(() => {
    if (isPhantomInstalled() && window.solana.isConnected) {
      window.solana.connect({ onlyIfTrusted: true })
        .then(resp => {
          setPublicKey(resp.publicKey.toString())
          setWallet(window.solana)
          fetchBalance(resp.publicKey.toString())
        })
        .catch(() => {})
    }
  }, [fetchBalance])

  return (
    <WalletContext.Provider value={{
      wallet, publicKey, balance, connecting, showModal,
      setShowModal, connect, disconnect, sendTransaction, fetchBalance,
      isPhantomInstalled
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
