import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import CreateSplitPage from './pages/CreateSplitPage'
import PaymentGeneratedPage from './pages/PaymentGeneratedPage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-split" element={<CreateSplitPage />} />
          <Route path="/payment-generated" element={<PaymentGeneratedPage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}
