import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiscountService from '../services/discount.service';

const useDiscountController = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleRedeem = async (codigo) => {
    setCargando(true);
    setError(null);
    try {
      const res = await DiscountService.validarCodigo(codigo);
      const responseData = res?.responseData;
      if (res?.responseCode === 200 && Array.isArray(responseData) && responseData.length > 0) {
        const cdOtp = responseData[0]?.cd_otp;
        if (cdOtp !== undefined && cdOtp !== null) {
          localStorage.setItem('discount', String(cdOtp));
        }
        navigate('/');
        return;
      }
      setError('Código inválido. Verifica e inténtalo de nuevo.');
    } catch {
      setError('No se pudo canjear el código. Inténtalo más tarde.');
    } finally {
      setCargando(false);
    }
  };

  return { handleRedeem, cargando, error };
};

export default useDiscountController;
