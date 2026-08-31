import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentService from '../services/payment.service';
import PolicyService from '../services/policy.service';
import PersonalService from '../services/personal.service';

const PHONE_PREFIXES = ['0412', '0414', '0424', '0416', '0426'];
const TIPOS_DOCUMENTO = [
  { value: 'V', label: 'Venezolano' },
  { value: 'E', label: 'Extranjero' },
  { value: 'J', label: 'Jurídico' },
  { value: 'G', label: 'Gubernamental' },
  { value: 'P', label: 'Pasaporte' },
];


const usePaymentFormController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan, vehicleData, personalData, paymentMethod } =
    location.state || {};

  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [disabledAmmount, setDisabledAmmount] = useState(false);
  const [phonePrefixes, setPhonePrefixes] = useState([]);
  const [loadingPhonePrefixes, setLoadingPhonePrefixes] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loadingTiposDoc, setLoadingTiposDoc] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(475.5);
  const [cotizacion, setCotizacion] = useState({ prima: 0, primaPlanBs: 0 });
  const [cotizacionLoading, setCotizacionLoading] = useState(true);
  const [cdCotizacion, setCdCotizacion] = useState(null);
  const [form, setForm] = useState({
    bank: '',
    documentType: '',
    documentNumber: '',
    phonePrefix: '',
    phoneNumber: '',
    date: '',
    amount: '',
    reference: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        //console.error(err);
        setBanks(DEFAULT_BANKS);
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
  }, []);

  useEffect(() => {
    const loadPhonePrefixes = async () => {
      setLoadingPhonePrefixes(true);
      try {
        const res   = await PaymentService.getPrefijosMoviles();
        const items = res?.responseData ?? [];
        setPhonePrefixes(items.map((p) => p.cd_prefijo));
      } catch (err) {
        //console.error(err);
        setPhonePrefixes(PHONE_PREFIXES);
      } finally {
        setLoadingPhonePrefixes(false);
      }
    };
    loadPhonePrefixes();
  }, []);

  useEffect(() => {
    const loadTiposDocumento = async () => {
      setLoadingTiposDoc(true);
      try {
        const res   = await PersonalService.getTiposDocumento();
        const items = res?.responseData ?? [];
        setTiposDocumento(
          items.length
            ? items.map((t) => ({ value: t.tp_documento, label: t.de_tipo_documento }))
            : TIPOS_DOCUMENTO
        );
      } catch (err) {
        setTiposDocumento(TIPOS_DOCUMENTO);
      } finally {
        setLoadingTiposDoc(false);
      }
    };
    loadTiposDocumento();
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
        const res   = await PolicyService.getCotizacion({ cd_clase, cd_uso });
        const items = res?.responseData ?? [];  
        const prima       = items.reduce((acc, it) => acc + (Number(it.prima.replaceAll(',','.')) || 0), 0);
        const primaPlanBs = items.reduce((acc, it) => acc + (Number(it.prima_plan_bs.replaceAll(',','.')) || 0), 0);
        setCotizacion({ prima, primaPlanBs });
        setCdCotizacion(items[0]?.cd_cotizacion ?? null);
        setForm((prev) => ({ ...prev, amount: String(primaPlanBs) }));
      } catch (err) {
        //console.error(err);
      } finally {
        setCotizacionLoading(false);
      }
    };
    loadCotizacion();
  }, []);

  const handleChange = (field, value) => {
    // El campo referencia solo permite números.
    if (field === 'reference') {
      value = String(value).replace(/\D/g, '');
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setDisabledAmmount(true);
    setError(null);
  };

  const validate = () => {
    if (!form.bank) return 'Selecciona un banco';
    if (!form.phonePrefix) return 'Selecciona un prefejo telefonico';
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length < 7)
      return 'Ingresa un número de teléfono válido';
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length < 7)
      return 'Ingresa un número de teléfono válido';
    if (!form.date) return 'Selecciona la fecha de operación';
    if (!form.amount) return 'Ingresa el monto';
    if (!form.reference  ) return 'Ingresa la referencia';
    return null;
  };

  const canSubmit = !validate();

  const handleContinue = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {

    // Formats to US Currency standard ($123,456.79)
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      //console.log(form);
      
      const transaccion = {
        cd_banco:        form.bank,
        fe_transaccion:  form.date.replaceAll('-', ''),
        nu_telefono:     `${form.phonePrefix}${form.phoneNumber}`,
        mt_transaccion:  '5.00',//formatter.format(form.amount).replaceAll(',',''),
        nu_referencia:   form.reference,
        nu_documento:    personalData?.numeroDocumento,
        tp_documento:    personalData?.tipoDocumento,
      };
      const res  = await PaymentService.validarPagoMovil(transaccion);
      const codR = res?.responseData;
      //const respuestaUbiiPagos= JSON.parse(codR);
      const respuestaUbiiPagos= codR.length>0 ? JSON.parse(codR): {codR:400};
      //console.log(respuestaUbiiPagos);
      
      if (respuestaUbiiPagos.codR === '00') {
        const isManual = (localStorage.getItem('quoteVehicleTab') || 'escanear') === 'manual';
        //const userData=JSON.parse(localStorage.getItem('userData')|| {});
        //console.log('2',userData);
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
          cd_color:          isManual ? vehicleData?.color : 1,
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
          in_negocio: 0,
          de_color: isManual ? '' : vehicleData.color
          /*nm_usuario: userData.cd_usuario,
          cd_usuario_cm: userData.cd_usuario,
          tp_documento_cm: userData.tp_documento_agregador ? userData.tp_documento_agregador.split('|')[0] : '',
          nu_documento_cm: userData.nu_documento_agregador*/
        };
        //console.log('Vehicle labels (manual):', vehicleLabels);
        const emisionRes = await PolicyService.emitirPoliza(solicitud);
        if (emisionRes?.responseCode === 400) {
          setError('Error al realizar la cotización');
          //console.log(emisionRes);
          
        } else if (emisionRes?.responseCode === 200) {
          const { cd_area, nu_poliza } = emisionRes.responseData ?? {};
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
          navigate('/success', { state: { selectedPlan, cd_area, nu_poliza } });
        } else {
          setError('Error al emitir la póliza');
        }
      } else {
        setError(res?.responseNotification || 'No se pudo validar el pago. Verifica los datos e intenta de nuevo.');
      }
    } catch (err) {
      //console.log(err);
      
      setError(err.message || 'Error al validar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/payment-method', { state: location.state });

  const bsAmount = selectedPlan
    ? (selectedPlan.price * exchangeRate).toLocaleString('es-VE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '0';

  return {
    form,
    banks,
    loadingBanks,
    phonePrefixes,
    loadingPhonePrefixes,
    tiposDocumento,
    loadingTiposDoc,
    exchangeRate,
    bsAmount,
    selectedPlan,
    loading,
    error,
    cotizacion,
    cotizacionLoading,
    canSubmit,
    handleChange,
    handleContinue,
    handleBack,
    disabledAmmount
  };
};

export default usePaymentFormController;
