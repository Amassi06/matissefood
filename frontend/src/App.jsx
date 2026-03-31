import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Engage from './pages/Engage'
import Spin from './pages/Spin'
import Result from './pages/Result'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCodes from './pages/admin/Codes'
import AdminPrizes from './pages/admin/Prizes'
import AdminRedeem from './pages/admin/Redeem'

function App() {
  return (
    <Routes>
      {/* Client routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/play" element={<Home />} />
      <Route path="/engage" element={<Engage />} />
      <Route path="/spin" element={<Spin />} />
      <Route path="/result" element={<Result />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/codes" element={<AdminCodes />} />
      <Route path="/admin/prizes" element={<AdminPrizes />} />
      <Route path="/admin/redeem" element={<AdminRedeem />} />
    </Routes>
  )
}

export default App
