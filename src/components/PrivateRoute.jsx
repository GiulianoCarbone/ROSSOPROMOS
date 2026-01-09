import React from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function PrivateRoute({ children }) {
    const [loading, setLoading] = React.useState(true)
    const [session, setSession] = React.useState(null)

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="p-5 text-center">Cargando...</div>

    return session ? children : <Navigate to="/login" />
}
