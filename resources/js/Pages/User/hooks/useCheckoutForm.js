import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { validateCheckout } from '../utils/validateCheckout';

/**
 * Encapsula toda la lógica de estado y handlers del formulario de checkout.
 */
export function useCheckoutForm({ sorteo, ticketPrice }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    sorteo_id:             sorteo?.id || '',
    cantidad:              1,
    modo_seleccion:        'random',
    numeros_seleccionados: [],
    metodo_pago:           '',
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

  const handleCheckoutSubmit = (e, onSuccess) => {
    e.preventDefault();
    const error = validateCheckout(data);
    if (error) { alert(error); return; }

    post('/comprar', {
      onSuccess: () => {
        reset();
        setPreviewUrl(null);
        onSuccess?.();
      },
    });
  };

  const resetForm = () => {
    reset();
    setPreviewUrl(null);
    setData(prev => ({ ...prev, cantidad: 1, numeros_seleccionados: [], modo_seleccion: 'random', total: ticketPrice }));
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
