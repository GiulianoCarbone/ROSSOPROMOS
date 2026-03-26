import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminMetricas from './pages/AdminMetricas'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import WhatsAppButton from './components/WhatsAppButton'
import Newsletter from './components/Newsletter'

function App() {
    return (
        <Router>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<Navigate to="/admin/productos" replace />} />
                    <Route path="/admin/productos" element={
                        <PrivateRoute><Admin /></PrivateRoute>
                    } />
                    <Route path="/admin/metricas" element={
                        <PrivateRoute><AdminMetricas /></PrivateRoute>
                    } />
                </Routes>
            </main>
            <WhatsAppButton />
            <Newsletter />
        </Router>
    )
}

export default App
