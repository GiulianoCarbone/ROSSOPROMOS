import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar() {
    const [session, setSession] = React.useState(null)
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <nav className="navbar position-fixed top-0 start-0 w-auto p-2 z-3">
            <button className="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <div className="collapse navbar-collapse rounded mt-2" id="navbarNav">
                <ul className="navbar-nav">
                    {isAdmin && session ? (
                        <>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/admin/productos' ? 'fw-bold' : ''}`} to="/admin/productos">
                                    <i className="bi bi-box-seam me-1"></i> Productos
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/admin/metricas' ? 'fw-bold' : ''}`} to="/admin/metricas">
                                    <i className="bi bi-bar-chart-line me-1"></i> Métricas
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    <i className="bi bi-fire me-1"></i> Ver Catálogo
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-link nav-link text-danger" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-1"></i> Salir
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    <i className="bi bi-fire me-1"></i> Promos
                                </Link>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="https://rossomateriales.site/sucursales" target="_blank">
                                    <i className="bi bi-geo-alt me-1"></i> Visitanos
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="https://wa.me/5493814146917" target="_blank">
                                    <i className="bi bi-whatsapp me-1"></i> Pedí tu presupuesto!
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="https://rossomateriales.site/" target="_blank">
                                    <i className="bi bi-globe me-1"></i> Conoce nuestra Web
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    )
}
