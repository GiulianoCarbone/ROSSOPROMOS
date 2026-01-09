import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { CATEGORY_OPTIONS } from '../constants'

export default function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('todos')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('position', { ascending: true })

            if (error) throw error
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error.message)
        } finally {
            setLoading(false)
        }
    }

    // Get unique categories
    const categories = ['todos', ...new Set(products.map(p => p.category))]

    const getCategoryLabel = (catValue) => {
        if (catValue === 'todos') return 'Todos';
        const found = CATEGORY_OPTIONS.find(opt => opt.value === catValue);
        return found ? found.label : catValue.charAt(0).toUpperCase() + catValue.slice(1);
    }

    // Filter Logic
    const filteredProducts = products.filter(p => {
        return filter === 'todos' || p.category === filter
    })

    return (
        <div style={{ paddingTop: '60px' }}>
            {/* Filters */}
            <div className="container mb-3">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`btn btn-sm ${filter === cat ? 'btn-brand-active' : 'btn-brand-outline'} rounded-pill px-3 shadow-sm`}
                                    onClick={() => setFilter(cat)}
                                    style={{ transition: 'all 0.2s', fontWeight: 'bold' }}
                                >
                                    {getCategoryLabel(cat)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="container text-center py-5">
                    <h3>😕 No encontramos productos</h3>
                    <p>Intenta cambiar los filtros.</p>
                </div>
            ) : (
                <>
                    {/* === MOBILE CAROUSEL (Visible only on Mobile) === */}
                    <div className="d-block d-md-none mb-4 px-3">
                        <div id="mobileCarousel" className="carousel slide shadow-sm rounded overflow-hidden" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                {filteredProducts.map((product, index) => (
                                    <div key={product.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <img src={product.image_url} className="d-block w-100" style={{ height: 'auto', objectFit: 'contain', backgroundColor: '#fff' }} alt={product.title} />
                                        <div className="bg-white p-3 text-center border-top">
                                            <a
                                                href={`https://api.whatsapp.com/send?phone=5493814146917&text=Hola! Estoy interesado en este producto: ${product.image_url}`}
                                                target="_blank"
                                                className="btn btn-success w-100 rounded-pill"
                                            >
                                                <i className="bi bi-whatsapp me-2"></i>Consultar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#mobileCarousel" data-bs-slide="prev">
                                <div className="carousel-custom-nav">
                                    <i className="bi bi-chevron-left"></i>
                                </div>
                                <span className="visually-hidden">Anterior</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#mobileCarousel" data-bs-slide="next">
                                <div className="carousel-custom-nav">
                                    <i className="bi bi-chevron-right"></i>
                                </div>
                                <span className="visually-hidden">Siguiente</span>
                            </button>
                        </div>
                    </div>

                    {/* === DESKTOP GRID (Visible only on Desktop) === */}
                    <div className="container d-none d-md-block">
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {filteredProducts.map(product => (
                                <div className="col" key={product.id}>
                                    <div className="card h-100 card-product position-relative">
                                        <div className="position-relative">
                                            <img src={product.image_url} className="card-img-top product-img" alt={product.title} />
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title text-truncate">{product.title}</h5>
                                            <a
                                                href={`https://api.whatsapp.com/send?phone=5493814146917&text=Hola! Estoy interesado en este producto: ${product.image_url}`}
                                                target="_blank"
                                                className="btn btn-outline-success w-100"
                                            >
                                                <i className="bi bi-whatsapp me-2"></i>Consultar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
