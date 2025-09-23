// ====== CÓDIGO PARA NEWSLETTER CON AJAX (NUEVO) ======
document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.getElementById('newsletter-form-ajax');
  
  if (newsletterForm) {
    const messageContainer = document.getElementById('newsletter-message');
    const formButton = document.getElementById('newsletter-button');
    const originalButtonText = formButton.innerHTML;

    newsletterForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevenimos que la página se recargue

      // Mostramos un estado de "cargando"
      formButton.innerHTML = 'ENVIANDO...';
      formButton.disabled = true;

      const formData = new FormData(newsletterForm);
      const url = newsletterForm.action;

      // Enviamos los datos en segundo plano
      fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Importante para evitar problemas de seguridad del navegador
      })
      .then(response => {
        // Mailrelay no nos da una respuesta clara, pero si no hay error, asumimos que funcionó.
        newsletterForm.style.display = 'none'; // Ocultamos el formulario
        messageContainer.innerHTML = '¡Gracias por suscribirte! Por favor, revisá tu email para activar tu cuenta. Si no lo encontrás, ¡no te olvides de revisar la carpeta de spam!.';
        messageContainer.className = 'newsletter-message success'; // Aplicamos el estilo verde
        messageContainer.style.display = 'block'; // Mostramos el mensaje
      })
      .catch(error => {
        // En caso de un error de red
        messageContainer.innerHTML = 'Hubo un error al procesar tu solicitud. Por favor, intentá de nuevo.';
        messageContainer.className = 'newsletter-message error'; // (Podrías crear un estilo .error en rojo)
        messageContainer.style.display = 'block';
        
        // Restauramos el botón
        formButton.innerHTML = originalButtonText;
        formButton.disabled = false;
      });
    });
  }
});