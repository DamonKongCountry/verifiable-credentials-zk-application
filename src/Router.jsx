import { Routes, Route } from 'react-router-dom';
import Verify from './pages/Verify';
import Login from './pages/Login';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Verify />} />
    </Routes>
  )
}