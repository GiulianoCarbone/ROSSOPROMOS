import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import WhatsAppButton from './components/WhatsAppButton'
import Newsletter from './components/Newsletter'

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container" style={{ minHeight: '80vh' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                        <PrivateRoute>
                            <Admin />
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
            <WhatsAppButton />
            <Newsletter />
        </Router>
    )
}

export default App
