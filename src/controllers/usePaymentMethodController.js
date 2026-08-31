import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PAYMENT_METHODS = [
  /*{
    id: 'pago-movil',
    label: 'Pago móvil',
    description: 'Bancamiga',
    disabled: false,
  },*/
  {
    id: 'debito',
    label: 'Débito inmediato',
    description: 'R4 Banco Microfinanciero',
    disabled: false,
  },
];

const usePaymentMethodController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);

  const handleSelectMethod = (method) => {
    if (method.disabled) return;
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    const route = selectedMethod?.id === 'debito' ? '/debit-form' : '/payment-form';
    navigate(route, {
      state: { ...previousState, paymentMethod: selectedMethod },
    });
  };

  const handleBack = () => navigate('/plan', { state: previousState });

  return {
    paymentMethods: PAYMENT_METHODS,
    selectedMethod,
    handleSelectMethod,
    handleContinue,
    handleBack,
  };
};

export default usePaymentMethodController;
