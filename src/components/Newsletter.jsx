import React from 'react'

export default function Newsletter() {
    return (
        <>
            <section className="newsletter-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-3 mb-md-0 text-center text-md-start">
                            <h3 className="newsletter-title m-0">
                                Suscribite y no te pierdas nuestras mejores ofertas y novedades
                                <span className="ms-2 fs-4 d-inline-block animate-bounce">📩</span>
                                <span className="ms-2 fs-4 d-inline-block animate-pulse">🔥</span>
                            </h3>
                        </div>
                        <div className="col-md-6">
                            <form className="newsletter-form d-flex" action="https://rossomateriales1.ipzmarketing.com/f/OdA2AtykkcQ" method="post">
                                <input
                                    type="email"
                                    name="subscriber[email]"
                                    className="form-control"
                                    placeholder="Ingresá tu email"
                                    required
                                />
                                <button type="submit">ENVIAR</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="main-footer">
                <div className="container">
                    <p className="mb-0">
                        <a href="https://www.rossomateriales.site" className="text-decoration-none text-muted">
                            &copy; 2025 Rosso Materiales. Todos los derechos reservados.
                        </a>
                    </p>
                </div>
            </footer>
        </>
    )
}
