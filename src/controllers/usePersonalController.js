import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonalService from '../services/personal.service';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Converts dd/mm/yyyy or dd-mm-yyyy → yyyy-mm-dd expected by <input type="date">
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  const s = String(dateStr);
  const dmY = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (dmY) return `${dmY[3]}-${dmY[2]}-${dmY[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return '';
};

const INITIAL_FORM = {
  primerNombre:    '',
  primerApellido:  '',
  fechaNacimiento: '',
  tipoDocumento:   '',
  numeroDocumento: '',
  sexo:            '',
  provincia:       '',
  estadoCivil:     '',
  correo:          '',
  prefijo:         '',
  telefono:        '',
};

const REQUIRED_FIELDS = [
  'primerNombre', 'primerApellido', 'fechaNacimiento',
  'tipoDocumento', 'numeroDocumento', 'sexo',
  'provincia', 'estadoCivil', 'correo', 'prefijo', 'telefono',
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getMaxBirthDate = () => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, '0');
  const day = String(maxDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isBirthDateAllowed = (birthDate) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const [year, month, day] = birthDate.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  const isRealDate = parsedDate.getFullYear() === year
    && parsedDate.getMonth() === month - 1
    && parsedDate.getDate() === day;
  return isRealDate && birthDate <= getMaxBirthDate();
};

const FIELD_LABELS = {
  primerNombre:    'Primer nombre',
  primerApellido:  'Primer apellido',
  fechaNacimiento: 'Fecha de nacimiento',
  tipoDocumento:   'Tipo de documento',
  numeroDocumento: 'Número de documento',
  sexo:            'Sexo',
  provincia:       'Estado donde circula',
  estadoCivil:     'Estado civil',
  correo:          'Correo electrónico',
  prefijo:         'Prefijo telefónico',
  telefono:        'Número de teléfono',
};

const toOptions = (arr, valKey, lblKey) =>
  (arr ?? []).map((item) => ({ value: item[valKey], label: item[lblKey] }));

const useApiField = (fetchFn) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res?.responseData ?? []);
    } catch (err) {
      setError('Error al cargar opciones');
      //console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetch };
};

const usePersonalController = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const vehicleData = location.state?.vehicleData;

  const [activeTab, setActiveTab]   = useState(
    () => localStorage.getItem('quotePersonalTab') || 'escanear'
  );
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [scanDone, setScanDone]     = useState(
    () => localStorage.getItem('quotePersonalScanDone') === 'true'
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [manualForm, setManualForm] = useState(() => {
    try {
      const saved = localStorage.getItem('quotePersonal');
      return saved ? { ...INITIAL_FORM, ...JSON.parse(saved) } : INITIAL_FORM;
    } catch {
      return INITIAL_FORM;
    }
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [itemVehicle, setItemVehicle] = useState(null);

  // OTP modal state
  const [otpOpen, setOtpOpen]             = useState(false);
  const [otpLoading, setOtpLoading]       = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpError, setOtpError]           = useState(null);

  const tiposDocApi     = useApiField(() => PersonalService.getTiposDocumento());
  const provinciasApi   = useApiField(() => PersonalService.getProvincias());
  const estadosCivilApi = useApiField(() => PersonalService.getEstadosCivil());
  const prefijosApi     = useApiField(() => PersonalService.getPrefijos());
  const item=null;
  useEffect(() => {
    tiposDocApi.fetch();
    provinciasApi.fetch();
    estadosCivilApi.fetch();
    prefijosApi.fetch();
    //setItemVehicle(localStorage.getItem('quoteVehicle'));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('quotePersonalTab', tab);
    setError(null);
  };

  const handleChangeScanImage = () => {
    setFile(null);
    setPreview(null);
    setScanDone(false);
    setOcrError(null);
    setManualForm(INITIAL_FORM);
    setFieldErrors({});
    setError(null);
    localStorage.removeItem('quotePersonalScanDone');
    localStorage.removeItem('quotePersonal');
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
    setOcrError(null);
    setOcrLoading(true);
    setScanDone(true);
    localStorage.setItem('quotePersonalScanDone', 'true');

    try {
      const base64     = await fileToBase64(selectedFile);
      const uploadRes  = await PersonalService.uploadOcrImage(base64);
      const rutaImagen = uploadRes?.responseData?.rutaImagen;
      if (!rutaImagen) throw new Error('Sin ruta de imagen');
      //console.log(rutaImagen);
      
      const ocrRes = await PersonalService.processOcr(rutaImagen);
      const data   = ocrRes?.responseData?.data;

      if (data) {
        const estadoCivilMatch = estadosCivilApi.data.find(
          (item) => item.de_estado_civil?.toLowerCase() === data.cd_estado_civil?.toLowerCase()
        );

        setManualForm((prev) => {
          const next = {
            ...prev,
            primerNombre:    data.nm_persona1  ?? prev.primerNombre,
            primerApellido:  data.ap_persona1  ?? prev.primerApellido,
            tipoDocumento:   data.tp_documento ?? prev.tipoDocumento,
            numeroDocumento: data.nu_documento
              ? String(data.nu_documento).replace(/\./g, '')
              : prev.numeroDocumento,
            fechaNacimiento: toInputDate(data.fe_nacimiento) || prev.fechaNacimiento,
            estadoCivil:     estadoCivilMatch?.cd_estado_civil ?? prev.estadoCivil,
          };
          localStorage.setItem('quotePersonal', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      setOcrError('No se pudo leer el documento. Puedes completar los datos manualmente.');
      //console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleManualChange = (field, value) => {
    setManualForm((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem('quotePersonal', JSON.stringify(next));
      return next;
    });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setError(null);
  };

  const isManualComplete = () =>
    REQUIRED_FIELDS.every((f) => manualForm[f].toString().trim() !== '') &&
    EMAIL_REGEX.test(manualForm.correo) &&
    manualForm.telefono.length === 7;

  const canContinue =
    (activeTab === 'escanear' && scanDone && !ocrLoading && isManualComplete()) ||
    (activeTab === 'manual'   && isManualComplete());

  const sendOtp = async () => {
    const nu_telefono = `${manualForm.prefijo}${manualForm.telefono}`;
    setOtpLoading(true);
    setOtpError(null);
    try {
      await PersonalService.sendOtp(nu_telefono, manualForm.correo);
    } catch (err) {
      setOtpError('No se pudo enviar el código. Intenta de nuevo.');
      //.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleContinue = async () => {
    /*console.log('[Personal] handleContinue clicked', {
      activeTab,
      manualForm,
      canContinue,
    });*/
    const errors = {};
    REQUIRED_FIELDS.forEach((f) => {
      if (!String(manualForm[f] ?? '').trim()) {
        errors[f] = `${FIELD_LABELS[f]} es obligatorio`;
      }
    });

    if (!errors.fechaNacimiento && !isBirthDateAllowed(manualForm.fechaNacimiento)) {
      errors.fechaNacimiento = 'Debes tener al menos 18 años';
    }

    if (!errors.correo && !EMAIL_REGEX.test(manualForm.correo)) {
      errors.correo = 'Ingresa un correo electrónico válido';
    }
    if (!errors.telefono && manualForm.telefono.length !== 7) {
      errors.telefono = 'El número de teléfono debe tener 7 dígitos';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Completa todos los campos obligatorios');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setError(null);

    let vehiculoAlmacenado = {};
    try {
      const stored = localStorage.getItem('quoteVehicle');
      if (stored) vehiculoAlmacenado = JSON.parse(stored) || {};
    } catch {
      vehiculoAlmacenado = {};
    }

    const marcajeSolicitud = {
      tp_documento: manualForm.tipoDocumento,
      nu_documento: manualForm.numeroDocumento,
      nm_persona:   `${manualForm.primerNombre} ${manualForm.primerApellido}`.trim(),
      nu_telefono:  `${manualForm.prefijo}${manualForm.telefono}`,
      de_correo:    manualForm.correo,
      de_marca:     vehiculoAlmacenado.marca  ?? '',
      de_modelo:    vehiculoAlmacenado.modelo ?? '',
      de_anio:      vehiculoAlmacenado.ano    ?? '',
      de_version:   vehiculoAlmacenado.version ?? '',
      cd_clase:     vehiculoAlmacenado.clase  ?? '',
      cd_uso:       vehiculoAlmacenado.uso    ?? '',
      nu_placa:     vehiculoAlmacenado.placa  ?? '',
    };

    try {
      const resMarcaje = await PersonalService.sendMarcaje(marcajeSolicitud);
      if (resMarcaje?.responseCode === 200) {
        const cd_marcaje = resMarcaje?.responseData?.cd_marcaje;
        const marcajesGuardados = JSON.parse(localStorage.getItem('quoteMarcajes') || '[]');
        marcajesGuardados.push(cd_marcaje);
        localStorage.setItem('quoteMarcajes', JSON.stringify(marcajesGuardados));
      }
    } catch (err) {
      //console.warn('[Personal] sendMarcaje failed, continuando con OTP', err);
    }

    const nu_telefono = `${manualForm.prefijo}${manualForm.telefono}`;
    localStorage.setItem('quotePersonal', JSON.stringify(manualForm));
    setOtpOpen(true);
    try {
      await PersonalService.sendOtp(nu_telefono, manualForm.correo);
    } catch (err) {
      //console.error('[Personal] sendOtp failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (code) => {
    const nu_telefono = `${manualForm.prefijo}${manualForm.telefono}`;
    setOtpVerifyLoading(true);
    setOtpError(null);
    try {
      const res = await PersonalService.verifyOtp(nu_telefono, code, manualForm.correo);
      if (res?.responseCode === 200) {
        const personalData = { ...manualForm, otpCode: code };
        navigate('/plan', { state: { vehicleData, personalData } });
      } else {
        setOtpError(res?.responseNotification || 'Código inválido. Intenta de nuevo.');
      }
    } catch (err) {
      setOtpError('Error al verificar el código. Intenta de nuevo.');
      //console.error(err);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleOtpResend = async () => {
    setOtpError(null);
    await sendOtp();
  };

  const handleOtpClose = () => {
    setOtpOpen(false);
    setOtpError(null);
  };

  const handleBack = () => navigate('/vehicle');

  return {
    activeTab,
    file,
    preview,
    scanDone,
    ocrLoading,
    ocrError,
    loading,
    error,
    manualForm,
    fieldErrors,
    canContinue,

    otpOpen,
    otpLoading,
    otpVerifyLoading,
    otpError,

    tiposDocumento:      toOptions(tiposDocApi.data,      'tp_documento',    'de_tipo_documento'),
    loadingTiposDoc:     tiposDocApi.loading,

    provincias:          toOptions(provinciasApi.data,    'cd_provincia',    'de_provincia'),
    loadingProvincias:   provinciasApi.loading,

    estadosCivil:        toOptions(estadosCivilApi.data,  'cd_estado_civil', 'de_estado_civil'),
    loadingEstadosCivil: estadosCivilApi.loading,

    prefijos:            toOptions(prefijosApi.data,      'cd_prefijo',      'cd_prefijo'),
    loadingPrefijos:     prefijosApi.loading,

    handleTabChange,
    handleFileChange,
    handleChangeScanImage,
    handleManualChange,
    handleContinue,
    handleOtpVerify,
    handleOtpResend,
    handleOtpClose,
    handleBack,
  };
};

export default usePersonalController;
