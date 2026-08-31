import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentService from '../services/payment.service';
import PolicyService from '../services/policy.service';

// Extrae el campo "code" de la respuesta sin importar si viene como número,
// string, o anidado dentro de data / responseData.
const extractCode = (res) => {
  const raw =
    res?.code ??
    res?.data?.code ??
    res?.responseData?.code ??
    res?.responseCode;
  return Number(raw);
};

const useDebitFormController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan, vehicleData } = location.state || {};
  //console.log(vehicleData);
  
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [phonePrefixes, setPhonePrefixes] = useState([]);
  const [loadingPhonePrefixes, setLoadingPhonePrefixes] = useState(false);
  const [cotizacion, setCotizacion] = useState({ prima: 0, primaPlanBs: 0 });
  const [discountPrice, setDiscountPrice] = useState({primaDiscount:0,primaPlanBsDiscount:0, prima:0, primaBs:0});
  const [discountCode, setDiscountCode]= useState(0);
  const [cotizacionLoading, setCotizacionLoading] = useState(true);
  const [cdCotizacion, setCdCotizacion] = useState(null);
  const [form, setForm] = useState({
    bank: '',
    phonePrefix: '',
    phoneNumber: '',
    cedulaType: '',
    cedula: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OTP modal state
  const [otpOpen, setOtpOpen]                 = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpEmitting, setOtpEmitting]         = useState(false);
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const [otpError, setOtpError]               = useState(null);

  // Modal de pago rechazado
  const [rejectedOpen, setRejectedOpen]       = useState(false);
  const [rejectedMessage, setRejectedMessage] = useState('');

  const phone = `${form.phonePrefix}${form.phoneNumber}`;
  // Monto compartido entre solicitud y confirmación (debe coincidir)
  const debitoMonto = //'5.00'; // 
      cotizacion.primaPlanBs.toString();

  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const res   = await PaymentService.getBanks();
        const items = res?.responseData ?? [];
        setBanks(
          items.map((b) => ({
            id:   b.cd_verificador,
            name: b.nm_banco,
          }))
        );
      } catch (err) {
        console.error(err);
        setBanks(DEFAULT_BANKS);
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
    const code= localStorage.getItem('discount');
    setDiscountCode(code);
    
  }, []);

  useEffect(() => {
    const loadPhonePrefixes = async () => {
      setLoadingPhonePrefixes(true);
      try {
        const res   = await PaymentService.getPrefijosMoviles();
        const items = res?.responseData ?? [];
        setPhonePrefixes(items.map((p) => p.cd_prefijo));
      } catch (err) {
        console.error(err);
        setPhonePrefixes(PHONE_PREFIXES);
      } finally {
        setLoadingPhonePrefixes(false);
      }
    };
    loadPhonePrefixes();
  }, []);

  useEffect(() => {
    const loadCotizacion = async () => {
      const cd_clase = vehicleData?.clase;
      const cd_uso   = vehicleData?.uso;
      if (!cd_clase || !cd_uso) {
        setCotizacionLoading(false);
        return;
      }
      try {
        const discount= localStorage.getItem('discount');
       
        
        const res   = await PolicyService.getCotizacion({ cd_clase, cd_uso });
        //console.log(res.responseData);
        const items = res?.responseData ?? [];
        const prima       = discount? items.reduce((acc, it) => acc + (Number(it.prima_descuento.replaceAll(',', '.')) || 0), 0): items.reduce((acc, it) => acc + (Number(it.prima.replaceAll(',', '.')) || 0), 0);
        const primaPlanBs = discount ? items.reduce((acc, it) => acc + (Number(it.prima_plan_bs_descuento.replaceAll(',', '.')) || 0), 0) :items.reduce((acc, it) => acc + (Number(it.prima_plan_bs.replaceAll(',', '.')) || 0), 0);
        const primaDescuento       = items.reduce((acc, it) => acc + (Number(it.prima_descuento.replaceAll(',', '.')) || 0), 0);
        const primaPlanBsDescuento = items.reduce((acc, it) => acc + (Number(it.prima_plan_bs_descuento.replaceAll(',', '.')) || 0), 0);
        const beforePrima       =  items.reduce((acc, it) => acc + (Number(it.prima.replaceAll(',', '.')) || 0), 0);
        const beforePrimaBs       =  items.reduce((acc, it) => acc + (Number(it.prima_plan_bs.replaceAll(',', '.')) || 0), 0);
        setCotizacion({ prima, primaPlanBs });
        setDiscountPrice({ primaDescuento, primaPlanBsDescuento, beforePrima,beforePrimaBs });
        setCdCotizacion(items[0]?.cd_cotizacion ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setCotizacionLoading(false);
      }
    };
    loadCotizacion();
  }, []);

  const handleChange = (field, value) => {
    //console.log(field,value);
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = () => {
    //console.log(form);
    
    if (!form.bank) return 'Selecciona un banco';
    if (!form.phonePrefix) return 'El prefijo telefoóico no ha sido selccionado';
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length < 7)
      return 'Ingresa un número de teléfono válido';
    if (!form.cedula || form.cedula.trim().length < 6)
      return 'Ingresa una cédula de identidad válida';
    return null;
  };

  const canSubmit = !validate();
  // Envía la solicitud de débito inmediato al endpoint /debitoinmediato/solicitud
  const requestDebito = async () => {
    //console.log(form);
    
    //console.log( `${form.cedulaType}${form.cedula}`);
    return PaymentService.solicitudDebitoInmediato({
      banco:    form.bank,
      monto:    '5.00',
              //debitoMonto,
      telefono: `0${form.phonePrefix}${form.phoneNumber}`,
      cedula:   `${form.cedulaType}${form.cedula}`,
    });
  };
  
  

  // Confirma el débito inmediato enviando el OTP al endpoint /debitoinmediato/confirmacion
  const confirmDebito = (otp) => {
    return PaymentService.confirmacionDebitoInmediato({
      banco:    form.bank,
      monto:    '5.00',
      //debitoMonto,
      telefono: `0${form.phonePrefix}${form.phoneNumber}`,
      cedula:   `${form.cedulaType}${form.cedula}`,
      otp,
    });
  };

  const handleContinue = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await requestDebito();
      //const res= {responseCode:202}
      //console.log('[DebitForm] Respuesta /debitoinmediato/solicitud:', res);
      if (extractCode(res) === 202) {
        setOtpError(null);
        setOtpOpen(true);
      } else {
        setError(
          'No se pudo procesar la solicitud de débito inmediato.'
        );
      }
    } catch (err) {
      setError('Error al procesar el débito inmediato');
    } finally {
      setLoading(false);
    }
  };


  // Emite la póliza una vez validado el OTP del débito inmediato
  const emitirPoliza = async () => {
    const isManual = (localStorage.getItem('quoteVehicleTab') || 'escanear') === 'manual';

    let savedPersonal = {};
    try {
      savedPersonal = JSON.parse(localStorage.getItem('quotePersonal')) || {};
    } catch {
      savedPersonal = {};
    }

    const fe = savedPersonal.fechaNacimiento;
    let fe_nacimiento = '';
    if (fe) {
      const [yyyy, mm, dd] = fe.split('-');
      if (yyyy && mm && dd) fe_nacimiento = `${dd}/${mm}/${yyyy}`;
    }
    const vehicleLabels = JSON.parse(localStorage.getItem('quoteVehicleLabels')) || {};
    const solicitud = {
      cd_cotizacion:     cdCotizacion,
      nm_persona1:       savedPersonal.primerNombre,
      nm_persona2:       '',
      ap_persona1:       savedPersonal.primerApellido,
      ap_persona2:       '',
      tp_documento:      savedPersonal.tipoDocumento,
      nu_documento:      savedPersonal.numeroDocumento,
      fe_nacimiento,
      cd_estado_civil:   savedPersonal.estadoCivil,
      cd_sexo:           savedPersonal.sexo,
      cd_provincia:      savedPersonal.provincia,
      cd_municipio:      9999,
      cd_zona:           9999,
      de_direccion:      '.',
      nu_telefono:       `${savedPersonal.prefijo ?? ''}${savedPersonal.telefono ?? ''}`,
      nu_telefono_local: '',
      de_correo:         savedPersonal.correo,
      cd_parentesco:     1,
      cd_asesor:         7,
      cd_producto:       260200,
      cd_plan_pago:      11,
      nu_pagos:          '1',
      cd_banco:          '',
      tp_cuenta:         '',
      nu_cuenta:         '',
      cd_cobertura:      2,
      tp_forma_pago:     999,
      in_cobro:          1,
      cd_placa:          vehicleData?.placa,
      cd_color: isManual ? vehicleData?.color : 1,
      cd_marca:          isManual ? vehicleData?.marca   : 1,
      cd_modelo:         isManual ? vehicleData?.modelo  : 1,
      cd_anio:           isManual ? vehicleData?.ano     : 1,
      cd_version:        isManual ? vehicleData?.version : 1,
      cd_clase:          vehicleData?.clase,
      cd_uso:            vehicleData?.uso,
      de_marca:          isManual ? vehicleLabels?.marca : (vehicleData?.marca   ?? ''),
      de_modelo:         isManual ? vehicleLabels?.modelo : (vehicleData?.modelo  ?? ''),
      de_anio:           isManual ? vehicleLabels?.ano : (vehicleData?.ano     ?? ''),
      de_version:        isManual ? vehicleLabels?.version : (vehicleData?.version ?? ''),
      nu_toneladas_extra: 0,
      cd_niv:            vehicleData?.serialNiv,
      ruta_imagen_cc:    '',
      ruta_imagen_di:    '',
      in_negocio:2,
      de_color: isManual ? '' : vehicleData.color,
      po_descuento: discountCode ? 15 : 0 
    };
    //console.log(solicitud,isManual);
    
  return PolicyService.emitirPoliza(solicitud);
  };

  const handleOtpVerify = async (code) => {
    setOtpVerifyLoading(true);
    setOtpError(null);
    try {
      const confirmRes = await confirmDebito(code);
      //console.log('[DebitForm] Respuesta /debitoinmediato/confirmacion:', confirmRes);
      //const confirmRes= {responseCode:200, responseData:{code:'ACCP'}}
      //let confirmRes={responseCode:200, responseData:{code:'ACCP'}}
      if (confirmRes?.responseCode === 200 && confirmRes?.responseData?.code === 'ACCP') {
        setOtpVerifyLoading(false);
        setOtpEmitting(true);
        try {
          const emisionRes = await emitirPoliza(code);
          console.log(discountCode);
          if (emisionRes?.responseCode === 200) {
            const { cd_area, nu_poliza } = emisionRes.responseData ?? {}; 
            //const emisionRes = await emitirPoliza(code);
            const savedPersonal = JSON.parse(localStorage.getItem('quotePersonal'));
            const discountCode = localStorage.getItem('discount');
            localStorage.setItem('cdArea',   cd_area  ?? '');
            localStorage.setItem('nuPoliza', nu_poliza ?? '');
            localStorage.removeItem('quoteVehicle');
            localStorage.removeItem('quoteScanVehicle');
            localStorage.removeItem('quoteVehicleTab');
            localStorage.removeItem('quoteScanDone');
            localStorage.removeItem('quoteVehicleLabels');
            localStorage.removeItem('quotePersonal');
            localStorage.removeItem('quotePersonalTab');
            localStorage.removeItem('quotePersonalScanDone');
            localStorage.removeItem('discount');
            setOtpOpen(false);
            try {
              const payloadDescuento={
              cd_otp:discountCode,
              cd_area:cd_area,
              nu_poliza:nu_poliza,
              nu_telefono:`${savedPersonal.prefijo ?? ''}${savedPersonal.telefono ?? ''}`
            };
              const deb= await PolicyService.marcarDescuento(payloadDescuento);
            } catch (error) {
              console.log(error);
              
            }
            navigate('/success', { state: { selectedPlan, cd_area, nu_poliza } });
            
          } else if (emisionRes?.responseCode === 400) {
            setOtpError('Error al realizar la cotización');
          } else {
            setOtpError('Error al emitir la póliza');
          }
        } finally {
          setOtpEmitting(false);
        }
      } else if (confirmRes?.responseCode === 400) {
        setOtpOpen(false);
        setRejectedMessage(
          confirmRes?.responseData?.message || 'El pago fue rechazado por el banco.'
        );
        setOtpVerifyLoading(false);
        setRejectedOpen(true);
      } else {
        setOtpError(
          confirmRes?.responseData?.message ||
          confirmRes?.message ||
          'No se pudo confirmar el débito inmediato.'
        );
        setOtpVerifyLoading(false);
      }
    } catch (err) {
      console.log(err);
      setOtpError(err.message || 'Error al verificar el código. Intenta de nuevo.');
      setOtpVerifyLoading(false);
      setOtpEmitting(false);
    }
  };

  const handleRejectedClose = () => {
    setRejectedOpen(false);
    setRejectedMessage('');
  };

  const handleOtpResend = async () => {
    setOtpResendLoading(true);
    setOtpError(null);
    try {
      const res = await requestDebito();
      //console.log('[DebitForm] Respuesta reenvío /debitoinmediato/solicitud:', res);
      if (extractCode(res) !== 202) {
        setOtpError(
          res?.message ||
          res?.data?.message ||
          res?.responseNotification ||
          'No se pudo reenviar el código.'
        );
      }
    } catch (err) {
      setOtpError(err.message || 'No se pudo reenviar el código.');
    } finally {
      setOtpResendLoading(false);
    }
  };

  const handleOtpClose = () => {
    setOtpOpen(false);
    setOtpError(null);
  };

  const handleBack = () => navigate('/payment-method', { state: location.state });

  return {
    form,
    phone,
    banks,
    loadingBanks,
    phonePrefixes,
    loadingPhonePrefixes,
    selectedPlan,
    loading,
    error,
    cotizacion,
    cotizacionLoading,
    canSubmit,
    otpOpen,
    otpVerifyLoading,
    otpEmitting,
    otpResendLoading,
    otpError,
    rejectedOpen,
    rejectedMessage,
    handleChange,
    handleContinue,
    handleOtpVerify,
    handleOtpResend,
    handleOtpClose,
    handleRejectedClose,
    handleBack,
    discountPrice,
    discountCode
  };
};

export default useDebitFormController;
