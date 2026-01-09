import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { CATEGORY_OPTIONS } from '../constants'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- ROW COMPONENT ---
function SortableRow({ product, onEdit, onDelete, onUpdateStatus, onUpdateCategory, setPreviewImage }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        position: 'relative',
        backgroundColor: isDragging ? '#e9ecef' : undefined, // Visual cue
    };

    return (
        <tr ref={setNodeRef} style={style} className={!product.active ? 'table-warning' : ''}>
            {/* DRAG HANDLE */}
            <td className="text-center align-middle" style={{ cursor: 'grab', width: '50px' }} {...attributes} {...listeners}>
                <i className="bi bi-grip-vertical fs-5 text-muted"></i>
            </td>

            {/* REST OF CELLS */}
            <td>
                <img
                    src={product.image_url}
                    alt=""
                    width="50"
                    height="50"
                    className="rounded object-fit-cover"
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal"
                    data-bs-target="#imageModal"
                    onClick={() => setPreviewImage(product.image_url)}
                />
            </td>
            <td>
                <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>{product.title}</div>
            </td>

            <td>
                <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '140px', fontSize: '0.85rem' }}
                    value={product.category}
                    onChange={(e) => onUpdateCategory(product.id, e.target.value)}
                >
                    <option value="sin-clasificar">Sin Clasif.</option>
                    {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    className={`form-select form-select-sm ${product.active ? 'text-success fw-bold' : 'text-secondary'}`}
                    style={{ maxWidth: '120px', fontSize: '0.85rem' }}
                    value={product.active ? 'true' : 'false'}
                    onChange={(e) => onUpdateStatus(product.id, e.target.value)}
                >
                    <option value="true" className="text-success">Activo</option>
                    <option value="false" className="text-secondary">Borrador</option>
                </select>
            </td>
            <td className="text-end">
                <button
                    onClick={() => onEdit(product)}
                    className="btn btn-sm btn-outline-primary me-2"
                    title="Editar"
                >
                    <i className="bi bi-pencil"></i>
                </button>
                <button
                    onClick={() => onDelete(product.id)}
                    className="btn btn-sm btn-outline-danger"
                    title="Borrar"
                >
                    <i className="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    );
}

// --- MAIN COMPONENT ---
export default function Admin() {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [idToEdit, setIdToEdit] = useState(null)
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [imageFiles, setImageFiles] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('position', { ascending: true })
            if (!error) setProducts(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // --- DRAG END HANDLER ---
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setProducts((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Persist new order
                persistOrder(newOrder);

                return newOrder;
            });
        }
    };

    const persistOrder = async (newOrder) => {
        try {
            const updates = newOrder.map((item, index) => ({
                id: item.id,
                position: (index + 1) * 1000
            }));

            const promises = updates.map(u =>
                supabase.from('products').update({ position: u.position }).eq('id', u.id)
            );

            await Promise.all(promises);

        } catch (err) {
            console.error("Error saving order:", err);
        }
    };

    const handleValuesChange = (e) => {
        if (e.target.files) setImageFiles(e.target.files)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setUploading(true)

        try {
            // === MODO EDICIÓN ===
            if (idToEdit) {
                if (!title || !category) throw new Error('Título y Categoría requeridos')

                const updates = { title, category: category.toLowerCase() }

                if (imageFiles && imageFiles[0]) {
                    const file = imageFiles[0]
                    const fileExt = file.name.split('.').pop()
                    const filePath = `${Date.now()}.${fileExt}`
                    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
                    if (uploadError) throw uploadError
                    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
                    updates.image_url = publicUrl
                }

                const { error } = await supabase.from('products').update(updates).eq('id', idToEdit)
                if (error) throw error

                alert('Producto Actualizado')
                resetForm()
            }
            // === MODO CARGA MASIVA ===
            else if (imageFiles && imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i]
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}_${i}.${fileExt}`

                    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file)
                    if (uploadError) continue

                    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)

                    const position = Date.now() * 1000 + i

                    const draftTitle = title ? `${title} (${i + 1})` : file.name
                    const draftCat = category ? category.toLowerCase() : 'sin-clasificar'

                    await supabase.from('products').insert([{
                        title: draftTitle,
                        category: draftCat,
                        image_url: publicUrl,
                        active: false,
                        position: position
                    }])
                }

                alert(`¡${imageFiles.length} Imágenes subidas! Estan como 'Ocultas'.`)
                resetForm()
            } else {
                alert('Selecciona al menos una imagen.')
            }

            fetchProducts()
        } catch (error) {
            alert('Error: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const startEdit = (product) => {
        setIdToEdit(product.id)
        setTitle(product.title)
        setCategory(product.category)
        setImageFiles(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const resetForm = () => {
        setIdToEdit(null)
        setTitle('')
        setCategory('')
        setImageFiles(null)
        const fileInput = document.getElementById('fileInput')
        if (fileInput) fileInput.value = ""
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de borrar este producto?')) return
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (!error) fetchProducts()
        else alert(error.message)
    }

    const updateStatus = async (id, newStatus) => {
        const isActive = newStatus === 'true'
        const { error } = await supabase
            .from('products')
            .update({ active: isActive })
            .eq('id', id)
        if (!error) fetchProducts()
    }

    const updateCategory = async (id, newCategory) => {
        const { error } = await supabase
            .from('products')
            .update({ category: newCategory })
            .eq('id', id)

        if (!error) {
            fetchProducts()
        } else {
            console.error(error)
            alert('Error al actualizar categoría')
        }
    }

    return (
        <div className="container pt-5 mt-5">
            <div className="row">
                {/* Upload/Edit Column */}
                <div className="col-md-4 mb-4">
                    <div className={`card shadow-sm sticky-top border-${idToEdit ? 'warning' : 'primary'}`} style={{ top: '100px' }}>
                        <div className={`card-header text-white ${idToEdit ? 'bg-warning' : 'bg-primary'}`}>
                            <h5 className="mb-0 text-white">
                                {idToEdit ? '✏️ Editando Producto' : '📤 Carga Masiva'}
                            </h5>
                        </div>
                        <div className="card-body">
                            {!idToEdit && (
                                <div className="alert alert-info small p-2 mb-3">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Tip: Puedes seleccionar <strong>muchas fotos</strong> a la vez.
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {idToEdit && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Título *</label>
                                            <input
                                                className="form-control"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder="Nombre del producto"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Categoría *</label>
                                            <select
                                                className="form-select"
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {CATEGORY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">
                                        {idToEdit ? 'Cambiar Imagen (Opcional)' : 'Seleccionar Imágenes'}
                                    </label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        multiple={!idToEdit}
                                        onChange={handleValuesChange}
                                        required={!idToEdit}
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button disabled={uploading} className={`btn ${idToEdit ? 'btn-warning text-white' : 'btn-primary'}`}>
                                        {uploading ? 'Procesando...' : (idToEdit ? 'Guardar Cambios' : 'Subir Todas')}
                                    </button>

                                    {idToEdit && (
                                        <button type="button" onClick={resetForm} className="btn btn-outline-secondary">
                                            Cancelar Edición
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List Column */}
                <div className="col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">Inventario (Arrastrar para ordenar)</h4>
                    </div>

                    <div className="table-responsive bg-white rounded shadow-sm">
                        {/* DnD Context */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th width="50"></th> {/* Handle */}
                                        <th width="80">Img</th>
                                        <th>Título</th>
                                        <th>Categoría</th>
                                        <th>Estado</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SortableContext
                                        items={products}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {products.map(p => (
                                            <SortableRow
                                                key={p.id}
                                                product={p}
                                                onEdit={startEdit}
                                                onDelete={handleDelete}
                                                onUpdateStatus={updateStatus}
                                                onUpdateCategory={updateCategory}
                                                setPreviewImage={setPreviewImage}
                                            />
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </DndContext>

                        {products.length === 0 && <div className="p-4 text-center text-muted">Aún no hay productos cargados.</div>}
                    </div>
                </div>

                {/* Image Preview Modal */}
                <div className="modal fade" id="imageModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Vista Previa</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body text-center">
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="img-fluid" style={{ maxHeight: '70vh' }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
