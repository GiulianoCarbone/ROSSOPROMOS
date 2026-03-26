import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const todayStr = () => new Date().toISOString().split('T')[0]
const daysAgoStr = (n) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
}

export default function AdminMetricas() {
    const [metrics, setMetrics] = useState({ totalVisits: 0, totalContacts: 0, activeNow: 0, dailyData: [] })
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)
    const [dateFrom, setDateFrom] = useState(daysAgoStr(30))
    const [dateTo, setDateTo] = useState(todayStr())

    const fetchMetrics = useCallback(async (isAuto = false) => {
        if (!isAuto) setLoading(true)
        setErrorMsg(null)

        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

            // Fechas de inicio y fin del día ajustadas a ISO
            const fromDate = new Date(dateFrom + 'T00:00:00')
            const toDate = new Date(dateTo + 'T23:59:59')

            const { data, error } = await supabase
                .from('page_views')
                .select('visited_at, event_type')
                .gte('visited_at', fromDate.toISOString())
                .lte('visited_at', toDate.toISOString())

            if (error) throw error

            const totalVisits = data.filter(r => r.event_type === 'visit').length
            const totalContacts = data.filter(r => r.event_type === 'contact').length
            const activeNow = data.filter(r =>
                r.event_type === 'visit' && new Date(r.visited_at) >= fiveMinutesAgo
            ).length

            const dailyMap = {}
            data.forEach(row => {
                const day = row.visited_at.split('T')[0]
                if (!dailyMap[day]) dailyMap[day] = { date: day, Visitas: 0, Contactos: 0 }
                if (row.event_type === 'visit') dailyMap[day].Visitas++
                else dailyMap[day].Contactos++
            })

            const dailyDataResult = []
            const cursor = new Date(dateFrom + 'T00:00:00')
            const end = new Date(dateTo + 'T00:00:00')
            while (cursor <= end) {
                const key = cursor.toISOString().split('T')[0]
                const label = cursor.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                dailyDataResult.push(dailyMap[key]
                    ? { ...dailyMap[key], date: label }
                    : { date: label, Visitas: 0, Contactos: 0 }
                )
                cursor.setDate(cursor.getDate() + 1)
            }

            setMetrics({ totalVisits, totalContacts, activeNow, dailyData: dailyDataResult })
        } catch (err) {
            console.error('Error fetching metrics:', err.message)
            setErrorMsg('Error al cargar datos de Supabase. Verifica la conexión y permisos.')
        } finally {
            if (!isAuto) setLoading(false)
        }
    }, [dateFrom, dateTo])

    useEffect(() => {
        fetchMetrics()

        // Auto-refresh cada 30 segundos solo para mantener "Visitantes ahora" actualizado
        const interval = setInterval(() => {
            fetchMetrics(true)
        }, 30000)

        return () => clearInterval(interval)
    }, [fetchMetrics])

    const diffDays = Math.round((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)) + 1
    const xAxisInterval = diffDays <= 14 ? 0 : diffDays <= 31 ? 3 : diffDays <= 90 ? 6 : 13

    return (
        <div className="container pt-5 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Métricas de Actividad</h4>
                {loading && <div className="spinner-border spinner-border-sm text-primary" role="status"></div>}
            </div>

            {errorMsg && (
                <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errorMsg}
                </div>
            )}

            {/* Selector de fechas */}
            <div className="card border-0 shadow-sm p-3 mb-4">
                <div className="row g-2 align-items-end">
                    <div className="col-auto">
                        <label className="form-label small text-muted mb-1">Desde</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateFrom}
                            max={dateTo}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="col-auto">
                        <label className="form-label small text-muted mb-1">Hasta</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateTo}
                            min={dateFrom}
                            max={todayStr()}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary btn-sm" onClick={() => fetchMetrics()} disabled={loading}>
                            <i className="bi bi-search me-1"></i>Aplicar
                        </button>
                    </div>
                    <div className="col-auto d-flex gap-2 flex-wrap ms-md-auto">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDateFrom(daysAgoStr(6)); setDateTo(todayStr()) }}>7 días</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDateFrom(daysAgoStr(29)); setDateTo(todayStr()) }}>30 días</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDateFrom(daysAgoStr(89)); setDateTo(todayStr()) }}>90 días</button>
                    </div>
                </div>
            </div>

            {loading && metrics.dailyData.length === 0 ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <>
                    {/* Tarjetas resumen */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm text-center p-3 h-100">
                                <div className="fs-1 fw-bold text-primary">{metrics.totalVisits.toLocaleString()}</div>
                                <div className="text-muted small text-uppercase fw-bold">Visitas Totales</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm text-center p-3 h-100">
                                <div className="fs-1 fw-bold text-success">{metrics.totalContacts.toLocaleString()}</div>
                                <div className="text-muted small text-uppercase fw-bold">Consultas WhatsApp</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm text-center p-3 h-100 bg-light">
                                <div className="fs-1 fw-bold text-warning">{metrics.activeNow}</div>
                                <div className="text-muted small text-uppercase fw-bold">Visitantes Ahora</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Últimos 5 min</div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico */}
                    <div className="card border-0 shadow-sm p-4">
                        <h6 className="text-muted text-uppercase fw-bold mb-4" style={{ letterSpacing: '0.05em' }}>
                            Actividad diaria — {dateFrom} al {dateTo}
                        </h6>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={metrics.dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} interval={xAxisInterval} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#999' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="Visitas" stroke="#0d6efd" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Contactos" stroke="#198754" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
