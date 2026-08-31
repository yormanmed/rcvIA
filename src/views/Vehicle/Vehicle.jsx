import { useState, useRef, useEffect, useMemo } from 'react';
import Stepper from '../../components/Stepper/Stepper';
import FileUpload from '../../components/FileUpload/FileUpload';
import useVehicleController from '../../controllers/useVehicleController';
import './Vehicle.css';

const alphanumericUpper = (v) => v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

const CheckIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <circle cx="9.5" cy="9.5" r="9.5" fill="#3d1f8f" fillOpacity="0.1" />
    <path d="M6 9.5L8.5 12L13.5 7" stroke="#3d1f8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function VehicleSelect(props) {
  if (props.searchable) return <SearchableSelect {...props} />;
  const { label, value, onChange, options, placeholder, required, loading, errorMsg } = props;
  return (
    <div className="vehicle__field">
      <label className="vehicle__label">
        {label}
        {required && <span className="vehicle__required"> *</span>}
      </label>
      <div className={`vehicle__select-wrapper ${loading ? 'vehicle__select-wrapper--disabled' : ''} ${errorMsg ? 'vehicle__select-wrapper--error' : ''}`}>
        <select
          className="vehicle__select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? 'Cargando...' : placeholder}</option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <span className="vehicle__select-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke={loading ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {errorMsg && <p className="vehicle__field-error">{errorMsg}</p>}
    </div>
  );
}

function SearchableSelect({ label, value, onChange, options, placeholder, required, loading, errorMsg }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const normalized = useMemo(
    () => (options || []).map((opt) => (typeof opt === 'object' ? opt : { value: opt, label: opt })),
    [options]
  );

  const selectedLabel = normalized.find((o) => String(o.value) === String(value))?.label ?? '';

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return normalized;
    return normalized.filter((o) => String(o.label).toLowerCase().includes(term));
  }, [normalized, search]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlight(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [search]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) handleSelect(opt.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const isPlaceholder = !selectedLabel;
  const displayText = loading ? 'Cargando...' : (selectedLabel || placeholder);

  return (
    <div className="vehicle__field">
      <label className="vehicle__label">
        {label}
        {required && <span className="vehicle__required"> *</span>}
      </label>
      <div
        ref={wrapperRef}
        className={`vehicle__select-wrapper vehicle__select-wrapper--searchable ${loading ? 'vehicle__select-wrapper--disabled' : ''} ${open ? 'vehicle__select-wrapper--open' : ''} ${errorMsg ? 'vehicle__select-wrapper--error' : ''}`}
      >
        <button
          type="button"
          className={`vehicle__select vehicle__select--trigger ${isPlaceholder ? 'vehicle__select--placeholder' : ''}`}
          onClick={() => !loading && setOpen((o) => !o)}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {displayText}
        </button>
        <span className="vehicle__select-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke={loading ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {open && (
          <div className="vehicle__dropdown" role="dialog">
            <div className="vehicle__dropdown-search">
              <svg className="vehicle__dropdown-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.25" stroke="#9b7ad4" strokeWidth="1.5" />
                <path d="M9.5 9.5L12 12" stroke="#9b7ad4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="vehicle__dropdown-input"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <ul ref={listRef} className="vehicle__dropdown-list" role="listbox">
              {filtered.length === 0 ? (
                <li className="vehicle__dropdown-empty">Sin resultados</li>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = i === highlight;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`vehicle__dropdown-item ${isSelected ? 'vehicle__dropdown-item--selected' : ''} ${isHighlighted ? 'vehicle__dropdown-item--highlighted' : ''}`}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(opt.value)}
                    >
                      {opt.label}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {errorMsg && <p className="vehicle__field-error">{errorMsg}</p>}
    </div>
  );
}

function VehicleInput({ label, value, onChange, placeholder, required, minLength, maxLength, transform, errorMsg, hint }) {
  return (
    <div className="vehicle__field">
      <label className="vehicle__label">
        {label}
        {required && <span className="vehicle__required"> *</span>}
      </label>
      <input
        type="text"
        className={`vehicle__input ${errorMsg ? 'vehicle__input--error' : ''}`}
        placeholder={placeholder}
        value={value}
        minLength={minLength}
        maxLength={maxLength}
        onChange={(e) => onChange(transform ? transform(e.target.value) : e.target.value)}
      />
      {hint    && !errorMsg && <p className="vehicle__field-hint">{hint}</p>}
      {errorMsg && <p className="vehicle__field-error">{errorMsg}</p>}
    </div>
  );
}

function ManualForm({
  form, onChange,
  marcas, loadingMarcas, errorMarcas,
  modelos, loadingModelos,
  anos, loadingAnos,
  versiones, loadingVersiones,
  clases, loadingClases,
  usos, loadingUsos,
  colores, loadingColores,
  placaError, validatingPlaca,
  fieldErrors = {},
}) {
  return (
    <div className="vehicle__manual-form">

      {/* 1. Marca */}
      <VehicleSelect
        label="Marca"
        value={form.marca}
        onChange={(v) => onChange('marca', v)}
        options={marcas}
        placeholder="Selecciona la marca"
        required
        loading={loadingMarcas}
        errorMsg={errorMarcas || fieldErrors.marca}
        searchable
      />

      {/* 2. Modelo */}
      <VehicleSelect
        label="Modelo"
        value={form.modelo}
        onChange={(v) => onChange('modelo', v)}
        options={modelos}
        placeholder={form.marca ? 'Selecciona el modelo' : 'Primero selecciona la marca'}
        required
        loading={loadingModelos}
        errorMsg={fieldErrors.modelo}
        searchable
      />

      {/* 3. Año vehículo */}
      <VehicleSelect
        label="Año del vehículo"
        value={form.ano}
        onChange={(v) => onChange('ano', v)}
        options={anos}
        placeholder={form.modelo ? 'Selecciona el año' : 'Primero selecciona el modelo'}
        required
        loading={loadingAnos}
        errorMsg={fieldErrors.ano}
        searchable
      />

      {/* 4. Versión */}
      <VehicleSelect
        label="Versión"
        value={form.version}
        onChange={(v) => onChange('version', v)}
        options={versiones}
        placeholder={form.ano ? 'Selecciona la versión' : 'Primero selecciona el año'}
        required
        loading={loadingVersiones}
        errorMsg={fieldErrors.version}
        searchable
      />

      {/* 5. Clase */}
      <VehicleSelect
        label="Clase"
        value={form.clase}
        onChange={(v) => onChange('clase', v)}
        options={clases}
        placeholder={form.version ? 'Selecciona la clase' : 'Primero selecciona la versión'}
        required
        loading={loadingClases}
        errorMsg={fieldErrors.clase}
        searchable
      />

      {/* 6. Uso */}
      <VehicleSelect
        label="Uso"
        value={form.uso}
        onChange={(v) => onChange('uso', v)}
        options={usos}
        placeholder={form.clase ? 'Selecciona el uso' : 'Primero selecciona la clase'}
        required
        loading={loadingUsos}
        errorMsg={fieldErrors.uso}
        searchable
      />

      {/* 7. Placa */}
      <VehicleInput
        label="Placa"
        value={form.placa}
        onChange={(v) => onChange('placa', v)}
        placeholder="Ej. AB123CD"
        required
        minLength={5}
        maxLength={9}
        transform={alphanumericUpper}
        errorMsg={placaError || fieldErrors.placa}
        hint={validatingPlaca ? 'Verificando placa...' : null}
      />

      {/* 8. Serial NIV */}
      <VehicleInput
        label="Serial NIV"
        value={form.serialNiv}
        onChange={(v) => onChange('serialNiv', v)}
        placeholder="Ej. 1HGBH41JXMN109186"
        required
        minLength={6}
        maxLength={18}
        transform={alphanumericUpper}
        errorMsg={fieldErrors.serialNiv}
      />

      {/* 9. Color del vehículo */}
      <VehicleSelect
        label="Color del vehículo"
        value={form.color}
        onChange={(v) => onChange('color', v)}
        options={colores}
        placeholder="Selecciona el color"
        required
        loading={loadingColores}
        errorMsg={fieldErrors.color}
        searchable
      />

      <p className="vehicle__required-note">
        <span className="vehicle__required">*</span> Campos obligatorios
      </p>
    </div>
  );
}

function ScanForm({
  form, onChange,
  colores, loadingColores,
  scanClases, loadingScanClases, errorScanClases,
  scanUsos, loadingScanUsos,
  placaError, validatingPlaca,
  fieldErrors = {},
}) {
  return (
    <div className="vehicle__manual-form vehicle__scan-form">
      <VehicleInput
        label="Marca"
        value={form.marca}
        onChange={(v) => onChange('marca', v)}
        placeholder="Ej. Toyota"
        required
        errorMsg={fieldErrors.marca}
      />
      <VehicleInput
        label="Modelo"
        value={form.modelo}
        onChange={(v) => onChange('modelo', v)}
        placeholder="Ej. Corolla"
        required
        errorMsg={fieldErrors.modelo}
      />
      <VehicleInput
        label="Año del vehículo"
        value={form.ano}
        onChange={(v) => onChange('ano', v)}
        placeholder="Ej. 2023"
        required
        maxLength={4}
        errorMsg={fieldErrors.ano}
      />
      <VehicleInput
        label="Versión"
        value={form.version}
        onChange={(v) => onChange('version', v)}
        placeholder="Ej. XLE"
        required
        errorMsg={fieldErrors.version}
      />
      <VehicleSelect
        label="Clase"
        value={form.clase}
        onChange={(v) => onChange('clase', v)}
        options={scanClases}
        placeholder="Selecciona la clase"
        required
        loading={loadingScanClases}
        errorMsg={errorScanClases || fieldErrors.clase}
      />
      <VehicleSelect
        label="Uso"
        value={form.uso}
        onChange={(v) => onChange('uso', v)}
        options={scanUsos}
        placeholder={form.clase ? 'Selecciona el uso' : 'Primero selecciona la clase'}
        required
        loading={loadingScanUsos}
        errorMsg={fieldErrors.uso}
      />
      <VehicleInput
        label="Placa"
        value={form.placa}
        onChange={(v) => onChange('placa', v)}
        placeholder="Ej. AB123CD"
        required
        minLength={5}
        maxLength={9}
        transform={alphanumericUpper}
        errorMsg={placaError || fieldErrors.placa}
        hint={validatingPlaca ? 'Verificando placa...' : null}
      />
      <VehicleInput
        label="Serial NIV"
        value={form.serialNiv}
        onChange={(v) => onChange('serialNiv', v)}
        placeholder="Ej. 1HGBH41JXMN109186"
        required
        minLength={6}
        maxLength={18}
        transform={alphanumericUpper}
        errorMsg={fieldErrors.serialNiv}
      />
      <VehicleInput
        label="Color"
        value={form.color}
        onChange={(v) => onChange('color', v)}
        placeholder="Azul"
        required
        errorMsg={fieldErrors.color}
      />
      {/*
      <VehicleSelect
        label="Color del vehículo"
        value={form.color}
        onChange={(v) => onChange('color', v)}
        options={colores}
        placeholder="Selecciona el color"
        required
        loading={loadingColores}
        errorMsg={fieldErrors.color}
      />
      */}
    </div>
  );
}

function Vehicle() {
  const {
    activeTab,
    file,
    preview,
    loading,
    error,
    manualForm,
    placaError,
    validatingPlaca,
    canContinue,
    scanDone,
    scanForm,
    scanPlacaError,
    scanValidatingPlaca,
    ocrLoading,
    ocrError,
    marcas, loadingMarcas, errorMarcas,
    modelos, loadingModelos,
    anos, loadingAnos,
    versiones, loadingVersiones,
    clases, loadingClases,
    usos, loadingUsos,
    colores, loadingColores,
    scanClases, loadingScanClases, errorScanClases,
    scanUsos, loadingScanUsos,
    manualFieldErrors,
    scanFieldErrors,
    handleTabChange,
    handleFileChange,
    handleChangeScanImage,
    handleManualChange,
    handleScanChange,
    handleContinue,
    handleBack,
  } = useVehicleController();

  return (
    <div className="vehicle">
      <div className="vehicle__card">
        <Stepper steps={3} currentStep={1} />

        <h2 className="vehicle__title">Datos del vehículo</h2>
        <p className="vehicle__subtitle">
          {activeTab === 'escanear'
            ? 'Sube el carnet de circulación del vehículo a asegurar'
            : 'Ingresa manualmente los datos del carnet de circulación'}
        </p>

        <div className="vehicle__tabs">
          <button
            className={`vehicle__tab ${activeTab === 'escanear' ? 'vehicle__tab--active' : ''}`}
            onClick={() => handleTabChange('escanear')}
          >
            Escanear
          </button>
          <button
            className={`vehicle__tab ${activeTab === 'manual' ? 'vehicle__tab--active' : ''}`}
            onClick={() => handleTabChange('manual')}
          >
            Manual
          </button>
        </div>

        {activeTab === 'escanear' ? (
          <>
            {/* Upload section: visible mientras no haya escaneo exitoso */}
            {(!scanDone || ocrLoading || ocrError) && (
              <div className="vehicle__upload-section">
                <h3 className="vehicle__upload-label">Tomar o cargar foto de tu carnet de circulación</h3>
                <p className="vehicle__upload-hint">
                  Necesitamos este carnet para identificar tu vehículo
                </p>
                <FileUpload onFileChange={handleFileChange} preview={preview} />
              </div>
            )}

            {/* Recomendaciones: solo cuando no hay imagen */}
             {!scanDone && (
              <div className="vehicle__recommendations">
                <h4 className="vehicle__rec-title">Para una mejor lectura</h4>
                <ul className="vehicle__rec-list">
                  <li><CheckIcon /> Que la imagen sea clara y legible</li>
                  <li><CheckIcon /> Toma la foto en sentido horizontal</li>
                  <li><CheckIcon /> Evita reflejos y sombras sobre el carnet</li>
                </ul>
              </div>
            )}

            {/* Procesando OCR */}
            {scanDone && ocrLoading && (
              <div className="vehicle__ocr-loading">
                <span className="vehicle__ocr-spinner" />
                Analizando documento...
              </div>
            )}

            {/* Tarjeta de éxito */}
            {scanDone && !ocrLoading && !ocrError && (
              <div className="vehicle__scan-success">
                <div className="vehicle__scan-success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M9 14.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2.5c1.2-1.2 3-.8 3.8.5l1 1.6c.4.7 1.1 1.1 1.9 1.2l1.9.2c1.7.2 2.7 1.8 2.2 3.4l-.6 1.8c-.2.8 0 1.6.6 2.2l1.3 1.4c1.2 1.2.8 3-.5 3.8l-1.6 1c-.7.4-1.1 1.1-1.2 1.9l-.2 1.9c-.2 1.7-1.8 2.7-3.4 2.2l-1.8-.6c-.8-.2-1.6 0-2.2.6l-1.4 1.3c-1.2 1.2-3 .8-3.8-.5l-1-1.6c-.4-.7-1.1-1.1-1.9-1.2l-1.9-.2c-1.7-.2-2.7-1.8-2.2-3.4l.6-1.8c.2-.8 0-1.6-.6-2.2L2.7 17c-1.2-1.2-.8-3 .5-3.8l1.6-1c.7-.4 1.1-1.1 1.2-1.9l.2-1.9C6.4 6.7 8 5.7 9.6 6.2l1.8.6c.8.2 1.6 0 2.2-.6L14 4.9" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="vehicle__scan-success-title">Documento cargado con éxito</p>
                <button className="vehicle__scan-success-link" onClick={handleChangeScanImage}>
                  Clic para cambiar imagen
                </button>
              </div>
            )}

            {/* Error OCR + formulario para llenar manualmente */}
            {scanDone && !ocrLoading && ocrError && (
              <p className="vehicle__ocr-error">{ocrError}</p>
            )}

            {/* Formulario de datos */}
            {scanDone && !ocrLoading && (
              <ScanForm
                form={scanForm}
                onChange={handleScanChange}
                //colores={colores}
                //loadingColores={loadingColores}
                scanClases={scanClases}
                loadingScanClases={loadingScanClases}
                errorScanClases={errorScanClases}
                scanUsos={scanUsos}
                loadingScanUsos={loadingScanUsos}
                placaError={scanPlacaError}
                validatingPlaca={scanValidatingPlaca}
                fieldErrors={scanFieldErrors}
              />
            )}
          </>
        ) : (
          <ManualForm
            form={manualForm}
            onChange={handleManualChange}
            marcas={marcas}         loadingMarcas={loadingMarcas}     errorMarcas={errorMarcas}
            modelos={modelos}       loadingModelos={loadingModelos}
            anos={anos}             loadingAnos={loadingAnos}
            versiones={versiones}   loadingVersiones={loadingVersiones}
            clases={clases}         loadingClases={loadingClases}
            usos={usos}             loadingUsos={loadingUsos}
            colores={colores}       loadingColores={loadingColores}
            placaError={placaError}
            validatingPlaca={validatingPlaca}
            fieldErrors={manualFieldErrors}
          />
        )}

        {error && <p className="vehicle__error">{error}</p>}

        <button
          className={`vehicle__btn-continue ${!canContinue ? 'vehicle__btn-continue--disabled' : ''}`}
          onClick={handleContinue}
          disabled={loading || !canContinue}
        >
          {loading ? 'Procesando...' : 'Continuar'}
        </button>

        <button className="vehicle__btn-back" onClick={handleBack}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11 7.5H4M4 7.5L7.5 4M4 7.5L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Atrás
        </button>
      </div>
    </div>
  );
}

export default Vehicle;
