import { Routes, Route } from 'react-router-dom';
import Verify from './pages/Verify';
import Register from './pages/Register';

export default function Router() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Verify />} />
      </Routes>
    </>
  )
}