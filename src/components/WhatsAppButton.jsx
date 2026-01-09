import React from 'react'

export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/5493814146917"
            className="whatsapp-flotante"
            target="_blank"
            rel="noopener noreferrer"
        >
            <i className="bi bi-whatsapp fs-4"></i>
            <span>¡Hola! <span className="emoji-wave">👋</span></span>
        </a>
    )
}
