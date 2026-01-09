import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar() {
    const [session, setSession] = React.useState(null)

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
                    <li className="nav-item">
                        <Link className="nav-link" to="/">
                            <i className="bi bi-fire me-1"></i> Promos
                        </Link>
                    </li>
                    {session && (
                        <li className="nav-item">
                            <button className="btn btn-link nav-link" onClick={handleLogout}>Salir</button>
                        </li>
                    )}
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

                </ul>
            </div>
        </nav>
    )
}
