/**
 * Valida el formulario de checkout antes de enviarlo.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validateCheckout(data) {
  if (!data.buyer_dni || String(data.buyer_dni).replace(/\D/g, '').length !== 8) {
    return 'Por favor ingresa un DNI válido (8 dígitos).';
  }
  if (!data.buyer_name) {
    return 'Por favor ingresa tus nombres y apellidos.';
  }
  if (!data.buyer_telefono) {
    return 'Por favor ingresa tu celular.';
  }
  if (!data.buyer_departamento) {
    return 'Por favor selecciona tu departamento.';
  }
  if (data.modo_seleccion === 'manual' && data.numeros_seleccionados.length !== data.cantidad) {
    return `Por favor selecciona exactamente ${data.cantidad} número${data.cantidad > 1 ? 's' : ''} o cambia a selección al azar.`;
  }
  if (!data.metodo_pago) {
    return 'Por favor selecciona un método de pago.';
  }
  if (!data.comprobante) {
    return 'Por favor sube la captura de tu comprobante de pago.';
  }
  if (!data.accept_terms) {
    return 'Debes aceptar los Términos y Condiciones para continuar.';
  }
  return null;
}
