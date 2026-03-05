/**
 * Valida el formulario de checkout antes de enviarlo.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validateCheckout(data) {
  if (data.modo_seleccion === 'manual' && data.numeros_seleccionados.length !== data.cantidad) {
    return `Por favor selecciona exactamente ${data.cantidad} número${data.cantidad > 1 ? 's' : ''} o cambia a selección al azar.`;
  }
  if (!data.metodo_pago) {
    return 'Por favor selecciona un método de pago.';
  }
  if (!data.comprobante) {
    return 'Por favor sube la captura de tu comprobante de pago.';
  }
  return null;
}
