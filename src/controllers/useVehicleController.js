import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleService from '../services/vehicle.service';

const INITIAL_FORM = {
  marca:     '',
  modelo:    '',
  ano:       '',
  version:   '',
  clase:     '',
  uso:       '',
  placa:     '',
  serialNiv: '',
  color:     '',
};

const SCAN_INITIAL_FORM = {
  marca:     '',
  modelo:    '',
  ano:       '',
  version:   '',
  clase:     '',
  uso:       '',
  placa:     '',
  serialNiv: '',
  color:     '',
};

const CONTINUE_REQUIRED_FIELDS = ['marca', 'modelo', 'ano', 'version', 'clase', 'uso','color','placa','serialNiv'];

const toOptions = (arr, valKey, lblKey) =>
  (arr ?? []).map((item) => ({ value: item[valKey], label: item[lblKey] }));

const useApiField = (fetchFn, deps) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(...args);
      setData(res?.responseData ?? []);
    } catch (err) {
      setError('Error al cargar opciones');
      //console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setData([]); setError(null); };

  return { data, loading, error, fetch, reset };
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const useVehicleController = () => {
  const navigate        = useNavigate();
  const placaTimer      = useRef(null);
  const scanPlacaTimer  = useRef(null);

  const [activeTab, setActiveTab]   = useState(
    () => localStorage.getItem('quoteVehicleTab') || 'escanear'
  );
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [scanDone, setScanDone]     = useState(
    () => localStorage.getItem('quoteScanDone') === 'true'
  );
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [manualForm, setManualForm] = useState(() => {
    try {
      const saved = localStorage.getItem('quoteVehicle');
      return saved ? { ...INITIAL_FORM, ...JSON.parse(saved) } : INITIAL_FORM;
    } catch {
      return INITIAL_FORM;
    }
  });
  const [placaError, setPlacaError] = useState(null);
  const [validatingPlaca, setValidatingPlaca] = useState(false);

  const [scanForm, setScanForm] = useState(() => {
    try {
      const saved = localStorage.getItem('quoteScanVehicle');
      return saved ? { ...SCAN_INITIAL_FORM, ...JSON.parse(saved) } : SCAN_INITIAL_FORM;
    } catch {
      return SCAN_INITIAL_FORM;
    }
  });
  const [scanPlacaError, setScanPlacaError]           = useState(null);
  const [scanValidatingPlaca, setScanValidatingPlaca] = useState(false);
  const [ocrLoading, setOcrLoading]                   = useState(false);
  const [ocrError, setOcrError]                       = useState(null);

  const [manualFieldErrors, setManualFieldErrors] = useState({});
  const [scanFieldErrors, setScanFieldErrors]     = useState({});

  // ── Campos con API ──────────────────────────────────────
  const marcasApi   = useApiField((v)             => VehicleService.getMarcas());
  const modelosApi  = useApiField((v)             => VehicleService.getModelos(v));
  const anosApi     = useApiField((a, b)          => VehicleService.getAnios(a, b));
  const versionesApi= useApiField((a, b, c)       => VehicleService.getVersiones(a, b, c));
  const clasesApi   = useApiField((a, b, c, d)    => VehicleService.getClases(a, b, c, d));
  const usosApi     = useApiField((a, b, c, d, e) => VehicleService.getUsos(a, b, c, d, e));
  const coloresApi  = useApiField(()              => VehicleService.getColores());

  // Campos con API (tab Escanear): clases y usos independientes del flujo manual
  const scanClasesApi = useApiField(()       => VehicleService.getClasesScan());
  const scanUsosApi   = useApiField((cd)     => VehicleService.getUsosScan(cd));

  // On mount: marcas + colores + clases del scan
  useEffect(() => {
    marcasApi.fetch();
    coloresApi.fetch();
    scanClasesApi.fetch();
  }, []);

  // scanForm.clase → scanForm.usos
  useEffect(() => {
    scanUsosApi.reset();
    if (scanForm.clase) scanUsosApi.fetch(scanForm.clase);
  }, [scanForm.clase]);

  // Marca → modelos
  useEffect(() => {
    modelosApi.reset();
    anosApi.reset();
    versionesApi.reset();
    clasesApi.reset();
    usosApi.reset();
    if (manualForm.marca) modelosApi.fetch(manualForm.marca);
  }, [manualForm.marca]);

  // Modelo → años
  useEffect(() => {
    anosApi.reset();
    versionesApi.reset();
    clasesApi.reset();
    usosApi.reset();
    if (manualForm.marca && manualForm.modelo)
      anosApi.fetch(manualForm.marca, manualForm.modelo);
  }, [manualForm.modelo]);

  // Año → versiones
  useEffect(() => {
    versionesApi.reset();
    clasesApi.reset();
    usosApi.reset();
    if (manualForm.marca && manualForm.modelo && manualForm.ano)
      versionesApi.fetch(manualForm.marca, manualForm.modelo, manualForm.ano);
  }, [manualForm.ano]);

  // Versión → clases
  useEffect(() => {
    clasesApi.reset();
    usosApi.reset();
    if (manualForm.marca && manualForm.modelo && manualForm.ano && manualForm.version)
      clasesApi.fetch(manualForm.marca, manualForm.modelo, manualForm.ano, manualForm.version);
  }, [manualForm.version]);

  // Clase → usos
  useEffect(() => {
    usosApi.reset();
    if (manualForm.marca && manualForm.modelo && manualForm.ano && manualForm.version && manualForm.clase)
      usosApi.fetch(manualForm.marca, manualForm.modelo, manualForm.ano, manualForm.version, manualForm.clase);
  }, [manualForm.clase]);

  // ── Handlers ────────────────────────────────────────────
  const handleChangeScanImage = () => {
    setFile(null);
    setPreview(null);
    setScanDone(false);
    setScanForm(SCAN_INITIAL_FORM);
    setOcrError(null);
    localStorage.removeItem('quoteScanDone');
    localStorage.removeItem('quoteScanVehicle');
    localStorage.removeItem('quoteVehicleLabels');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('quoteVehicleTab', tab);
    setError(null);
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
    setOcrError(null);
    setOcrLoading(true);

    // Marcar que se realizó un escaneo
    setScanDone(true);
    localStorage.setItem('quoteScanDone', 'true');

    // Limpiar formulario manual al cargar nueva imagen
    setManualForm(INITIAL_FORM);
    setPlacaError(null);
    localStorage.removeItem('quoteVehicle');
    localStorage.removeItem('quoteVehicleLabels');

    try {
      const base64     = await fileToBase64(selectedFile);
      const uploadRes  = await VehicleService.uploadOcrImage(base64);
      const rutaImagen = uploadRes?.responseData?.rutaImagen;
      if (!rutaImagen) throw new Error('Sin ruta de imagen');

      const ocrRes = await VehicleService.processOcr(rutaImagen);
      const data   = ocrRes?.responseData?.data;

      if (data) {
        setScanForm((prev) => {
          const next = {
            ...prev,
            marca:     data.cd_marca    ?? prev.marca,
            modelo:    data.cd_modelo   ?? prev.modelo,
            ano:       data.cd_anio     ?? prev.ano,
            version:   data.cd_version  ?? prev.version,
            clase:     data.cd_clase.includes('|') ? data.cd_clase.split('|')[0] :  '',
            uso:       data.cd_uso.includes('|')  ? data.cd_uso.split('|')[0] : '',
            placa:     data.cd_placa    ?? prev.placa,
            serialNiv: data.cd_niv      ?? prev.serialNiv,
            color:     data.de_color.includes('|')    ? data.de_color.split('|')[1].toUpperCase() : data.de_color.toUpperCase(),
          };
          console.log(next);
          
          localStorage.setItem('quoteScanVehicle', JSON.stringify(next));
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
      // Cascada: limpiar selects dependientes
      if (field === 'marca')   { next.modelo = ''; next.ano = ''; next.version = ''; next.clase = ''; next.uso = ''; }
      if (field === 'modelo')  { next.ano = ''; next.version = ''; next.clase = ''; next.uso = ''; }
      if (field === 'ano')     { next.version = ''; next.clase = ''; next.uso = ''; }
      if (field === 'version') { next.clase = ''; next.uso = ''; }
      if (field === 'clase')   { next.uso = ''; }
      localStorage.setItem('quoteVehicle', JSON.stringify(next));
      //console.log(next);
      return next;
    });
    
    

    if (manualFieldErrors[field]) {
      setManualFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (['marca', 'modelo', 'ano', 'version'].includes(field)) {
      let labels = {};
      try {
        labels = JSON.parse(localStorage.getItem('quoteVehicleLabels')) || {};
      } catch {
        labels = {};
      }
      if (field === 'marca') {
        const found = marcasApi.data.find((it) => String(it.cd_marca) === String(value));
        labels = { marca: found?.de_marca ?? '', modelo: '', ano: '', version: '' };
      } else if (field === 'modelo') {
        const found = modelosApi.data.find((it) => String(it.cd_modelo) === String(value));
        labels = { ...labels, modelo: found?.de_modelo ?? '', ano: '', version: '' };
      } else if (field === 'ano') {
        labels = { ...labels, ano: String(value), version: '' };
      } else if (field === 'version') {
        const found = versionesApi.data.find((it) => String(it.cd_version) === String(value));
        labels = { ...labels, version: found?.de_version ?? '' };
      }
      localStorage.setItem('quoteVehicleLabels', JSON.stringify(labels));
    }

    if (field === 'placa') {
      setPlacaError(null);
      clearTimeout(placaTimer.current);
      const clean = value.trim().toUpperCase();
      if (clean.length >= 6) {
        placaTimer.current = setTimeout(() => validatePlaca(clean), 700);
      }
    }

    setError(null);
  };

  const validatePlaca = async (placa) => {
    setValidatingPlaca(true);
    try {
      const res = await VehicleService.validarPlaca(placa);
      const data = res?.responseData[0];
      if (data?.existe_placa === 1 || data?.existe_placa === '1') {
        setPlacaError('La placa está en uso');
        return false;
      }
      setPlacaError(null);
      return true;
    } catch {
      // Si falla la validación no bloqueamos al usuario
      return true;
    } finally {
      setValidatingPlaca(false);
    }
  };

  const validateScanPlaca = async (placa) => {
    setScanValidatingPlaca(true);
    try {
      const res = await VehicleService.validarPlaca(placa);
      const data = res?.responseData[0];
      if (data?.existe_placa === 1 || data?.existe_placa === '1') {
        setScanPlacaError('La placa está en uso');
        return false;
      }
      setScanPlacaError(null);
      return true;
    } catch {
      // Si falla la validación no bloqueamos al usuario
      return true;
    } finally {
      setScanValidatingPlaca(false);
    }
  };

  const handleScanChange = (field, value) => {
    // Tab Escanear: en marca, modelo y versión solo se permiten
    // letras, números y los caracteres "/" y "-".
    if (['marca', 'modelo', 'version'].includes(field)) {
      value = String(value).replace(/[^A-Za-z0-9ÑñÁÉÍÓÚáéíóúÜü/-]/g, '');
    }

    setScanForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'clase') next.uso = '';
      localStorage.setItem('quoteScanVehicle', JSON.stringify(next));
      return next;
    });

    if (scanFieldErrors[field]) {
      setScanFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === 'placa') {
      setScanPlacaError(null);
      clearTimeout(scanPlacaTimer.current);
      const clean = value.trim().toUpperCase();
      if (clean.length >= 6) {
        scanPlacaTimer.current = setTimeout(() => validateScanPlaca(clean), 700);
      }
    }
  };

  const canContinue =
    activeTab === 'manual' || (activeTab === 'escanear' && scanDone);

  const handleContinue = async () => {
    const isManual = activeTab === 'manual';
    const form = isManual ? manualForm : scanForm;
    const setFieldErrors = isManual ? setManualFieldErrors : setScanFieldErrors;
    
    const errors = {};
    
    if (typeof form.clase !== 'number' && isNaN(form.clase)) {
        form['clase']='';
    }
    if (typeof form.uso !== 'number' && isNaN(form.uso)) {
        form['uso']='';
    }
    /*const validColorCodes = coloresApi.data.map((c) => String(c.cd_color));
    if (!validColorCodes.includes(String(form.color))) {
        form['color'] = '';
    } */ 
    
    CONTINUE_REQUIRED_FIELDS.forEach((f) => {
      if (!String(form[f] ?? '').trim()) {

        errors[f] = 'Este campo es obligatorio';
      }
    });

    const placaLen = String(form.placa ?? '').trim().length;
    if (!errors.placa && (placaLen < 2 || placaLen > 8)) {
      errors.placa = 'La placa debe tener entre 2 y 7 caracteres';
    }
    const nivLen = String(form.serialNiv ?? '').trim().length;
    if (!errors.serialNiv && (nivLen < 7 || nivLen > 18)) {
      errors.serialNiv = 'El serial NIV debe tener entre 6 y 17 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Completa todos los campos obligatorios');
      return;
    }

    setFieldErrors({});

    const placa = String(form.placa ?? '').trim().toUpperCase();
    if (!placa) {
      setError('Ingresa la placa');
      return;
    }
    setError(null);
    const placaValida = isManual
      ? await validatePlaca(placa)
      : await validateScanPlaca(placa);
    if (!placaValida) return;

    const vehicleData = { ...form };
    localStorage.setItem('quoteVehicle', JSON.stringify(vehicleData));
    
    navigate('/personal', { state: { vehicleData } });
  };

  const handleBack = () => navigate('/');

  return {
    activeTab,
    file,
    preview,
    loading,
    error,
    manualForm,
    placaError,
    validatingPlaca,
    canContinue,

    marcas:       toOptions(marcasApi.data,    'cd_marca',    'de_marca'),
    loadingMarcas: marcasApi.loading,
    errorMarcas:   marcasApi.error,

    modelos:      toOptions(modelosApi.data,   'cd_modelo',   'de_modelo'),
    loadingModelos: modelosApi.loading,

    anos:         toOptions(anosApi.data,      'cd_anio',     'cd_anio'),
    loadingAnos:  anosApi.loading,

    versiones:    toOptions(versionesApi.data, 'cd_version',  'de_version'),
    loadingVersiones: versionesApi.loading,

    clases:       toOptions(clasesApi.data,    'cd_clase',    'de_clase'),
    loadingClases: clasesApi.loading,

    usos:         toOptions(usosApi.data,      'cd_uso',      'de_uso'),
    loadingUsos:  usosApi.loading,

    colores:      toOptions(coloresApi.data,   'cd_color',    'de_color'),
    loadingColores: coloresApi.loading,

    scanClases:        toOptions(scanClasesApi.data, 'cd_clase', 'de_clase'),
    loadingScanClases: scanClasesApi.loading,
    errorScanClases:   scanClasesApi.error,

    scanUsos:        toOptions(scanUsosApi.data, 'cd_uso', 'de_uso'),
    loadingScanUsos: scanUsosApi.loading,

    scanDone,
    scanForm,
    scanPlacaError,
    scanValidatingPlaca,
    ocrLoading,
    ocrError,

    manualFieldErrors,
    scanFieldErrors,

    handleTabChange,
    handleFileChange,
    handleChangeScanImage,
    handleManualChange,
    handleScanChange,
    handleContinue,
    handleBack,
  };
};

export default useVehicleController;
