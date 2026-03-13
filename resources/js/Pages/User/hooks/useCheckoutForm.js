import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { validateCheckout } from '../utils/validateCheckout';

/**
 * Encapsula toda la lógica de estado y handlers del formulario de checkout.
 */
export function useCheckoutForm({ sorteo, ticketPrice, currentUser, defaultPaymentMethod = '' }) {
  const safeUser = currentUser?.is_admin ? null : currentUser;
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    sorteo_id:             sorteo?.id || '',
    cantidad:              1,
    modo_seleccion:        'random',
    numeros_seleccionados: [],
    buyer_dni:             safeUser?.dni || '',
    buyer_name:            safeUser?.name || '',
    buyer_telefono:        safeUser?.telefono || '',
    buyer_departamento:    safeUser?.departamento || '',
    accept_terms:          false,
    metodo_pago:           defaultPaymentMethod,
    comprobante:           null,
    total:                 ticketPrice,
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      sorteo_id: sorteo?.id || '',
      total: prev.cantidad * ticketPrice,
      numeros_seleccionados: [],
    }));
  }, [sorteo?.id, ticketPrice]);

  useEffect(() => {
    if (!safeUser) return;
    setData((prev) => ({
      ...prev,
      buyer_dni: safeUser?.dni || prev.buyer_dni,
      buyer_name: safeUser?.name || prev.buyer_name,
      buyer_telefono: safeUser?.telefono || prev.buyer_telefono,
      buyer_departamento: safeUser?.departamento || prev.buyer_departamento,
    }));
  }, [safeUser?.dni, safeUser?.name, safeUser?.telefono, safeUser?.departamento]);

  useEffect(() => {
    if (!defaultPaymentMethod) return;

    setData((prev) => ({
      ...prev,
      metodo_pago: prev.metodo_pago || defaultPaymentMethod,
    }));
  }, [defaultPaymentMethod]);

  const handleIncreaseQty = () => {
    if (data.cantidad < 10) {
      const newQty = data.cantidad + 1;
      setData(prev => ({ ...prev, cantidad: newQty, total: newQty * ticketPrice }));
    }
  };

  const handleDecreaseQty = () => {
    if (data.cantidad > 1) {
      const newQty = data.cantidad - 1;
      const nums   = data.numeros_seleccionados.slice(0, newQty);
      setData(prev => ({ ...prev, cantidad: newQty, numeros_seleccionados: nums, total: newQty * ticketPrice }));
    }
  };

  const toggleNumber = (ticketId) => {
    const current = data.numeros_seleccionados;
    if (current.includes(ticketId)) {
      setData('numeros_seleccionados', current.filter(n => n !== ticketId));
    } else {
      if (current.length < data.cantidad) {
        setData('numeros_seleccionados', [...current, ticketId]);
      } else {
        alert(`Ya seleccionaste ${data.cantidad} número${data.cantidad > 1 ? 's' : ''}. Aumenta la cantidad para elegir más.`);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('comprobante', file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const error = validateCheckout(data);
    if (error) { alert(error); return; }
    const buyerDni = String(data.buyer_dni || '').replace(/\D/g, '');

    post('/comprar', {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setPreviewUrl(null);
        if (buyerDni.length === 8) {
          router.get(route('mis_tickets'), { dni: buyerDni }, { replace: true });
        }
      },
    });
  };

  const resetForm = () => {
    reset();
    setPreviewUrl(null);
    setData(prev => ({
      ...prev,
      cantidad: 1,
      numeros_seleccionados: [],
      modo_seleccion: 'random',
      total: ticketPrice,
      accept_terms: false,
    }));
  };

  return {
    data, setData, processing, errors,
    previewUrl,
    handleIncreaseQty,
    handleDecreaseQty,
    toggleNumber,
    handleFileChange,
    handleCheckoutSubmit,
    resetForm,
  };
}
