import { useState } from 'react';
import Stepper from '../../components/Stepper/Stepper';
import FileUpload from '../../components/FileUpload/FileUpload';
import OtpModal from '../../components/OtpModal/OtpModal';
import usePersonalController from '../../controllers/usePersonalController';
import './Personal.css';

const onlyLetters = (v) => v.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúÜü\s]/g, '');
const onlyNumbers = (v) => v.replace(/\D/g, '');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const maxBirthDate = () => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, '0');
  const day = String(maxDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CheckIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <circle cx="9.5" cy="9.5" r="9.5" fill="#3d1f8f" fillOpacity="0.1" />
    <path d="M6 9.5L8.5 12L13.5 7" stroke="#3d1f8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="#9b7ad4" strokeWidth="1.4" />
    <path d="M1.5 6h13" stroke="#9b7ad4" strokeWidth="1.4" />
    <path d="M5 1v3M11 1v3" stroke="#9b7ad4" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#9b7ad4" strokeWidth="1.4" />
    <path d="M1.5 5.5l6.5 4 6.5-4" stroke="#9b7ad4" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function PersonalInput({ label, value, onChange, onBlur, placeholder, required, type = 'text', maxLength, icon, errorMsg }) {
  return (
    <div className="personal__field">
      <label className="personal__label">
        {label}
        {required && <span className="personal__required"> *</span>}
      </label>
      <div className={icon ? 'personal__input-wrapper' : undefined}>
        {icon && <span className="personal__input-icon">{icon}</span>}
        <input
          type={type}
          className={`personal__input ${icon ? 'personal__input--with-icon' : ''} ${errorMsg ? 'personal__input--error' : ''}`}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {errorMsg && <p className="personal__field-error">{errorMsg}</p>}
    </div>
  );
}

function PersonalSelect({ label, value, onChange, options, placeholder, required, loading, errorMsg }) {
  return (
    <div className="personal__field">
      {label && (
        <label className="personal__label">
          {label}
          {required && <span className="personal__required"> *</span>}
        </label>
      )}
      <div className={`personal__select-wrapper ${loading ? 'personal__select-wrapper--disabled' : ''} ${errorMsg ? 'personal__select-wrapper--error' : ''}`}>
        <select
          className="personal__select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? 'Cargando...' : placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="personal__select-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke={loading ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {errorMsg && <p className="personal__field-error">{errorMsg}</p>}
    </div>
  );
}

function ManualForm({
  form, onChange,
  tiposDocumento, loadingTiposDoc,
  provincias, loadingProvincias,
  estadosCivil, loadingEstadosCivil,
  prefijos, loadingPrefijos,
  fieldErrors = {},
}) {
  const docError   = fieldErrors.tipoDocumento || fieldErrors.numeroDocumento;
  const phoneError = fieldErrors.prefijo       || fieldErrors.telefono;

  const [emailTouched, setEmailTouched] = useState(false);
  const emailLocalError = emailTouched && form.correo && !emailRegex.test(form.correo)
    ? 'Ingresa un correo electrónico válido'
    : '';

  return (
    <div className="personal__manual-form">

      {/* 1. Primer Nombre */}
      <PersonalInput
        label="Primer nombre"
        value={form.primerNombre}
        onChange={(v) => onChange('primerNombre', onlyLetters(v).slice(0, 15))}
        placeholder=""
        required
        maxLength={15}
        errorMsg={fieldErrors.primerNombre}
      />

      {/* 2. Primer Apellido */}
      <PersonalInput
        label="Primer apellido"
        value={form.primerApellido}
        onChange={(v) => onChange('primerApellido', onlyLetters(v).slice(0, 15))}
        placeholder=""
        required
        maxLength={15}
        errorMsg={fieldErrors.primerApellido}
      />

      {/* 3. Fecha de Nacimiento */}
      <div className="personal__field">
        <label className="personal__label">
          Fecha de nacimiento
          <span className="personal__required"> *</span>
        </label>
        <div className="personal__input-wrapper">
          <span className="personal__input-icon"><CalendarIcon /></span>
          <input
            type="date"
            className={`personal__input personal__input--with-icon personal__input--date ${fieldErrors.fechaNacimiento ? 'personal__input--error' : ''}`}
            placeholder="Selecciona tu fecha de nacimiento"
            value={form.fechaNacimiento}
            max={maxBirthDate()}
            onChange={(e) => onChange('fechaNacimiento', e.target.value)}
          />
        </div>
        {fieldErrors.fechaNacimiento && <p className="personal__field-error">{fieldErrors.fechaNacimiento}</p>}
      </div>

      {/* 4. Tipo Documento + Número (unificado) */}
      <div className="personal__field">
        <label className="personal__label">
          Cédula de identidad
          <span className="personal__required"> *</span>
        </label>
        <div className={`personal__phone-combined ${loadingTiposDoc ? 'personal__phone-combined--disabled' : ''} ${docError ? 'personal__phone-combined--error' : ''}`}>
          <div className="personal__phone-combined-prefix personal__phone-combined-prefix--tipo">
            <select
              className="personal__phone-combined-select personal__phone-combined-select--tipo"
              value={form.tipoDocumento}
              onChange={(e) => onChange('tipoDocumento', e.target.value)}
              disabled={loadingTiposDoc}
            >
              <option value="">{loadingTiposDoc ? '...' : ''}</option>
              {tiposDocumento.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.value}</option>
              ))}
            </select>
            <span className="personal__phone-combined-icon">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 5l5 5 5-5" stroke={loadingTiposDoc ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <span className="personal__phone-combined-divider" />
          <input
            type="text"
            inputMode="numeric"
            className="personal__phone-combined-input"
            placeholder=""
            value={form.numeroDocumento}
            maxLength={10}
            onChange={(e) => onChange('numeroDocumento', onlyNumbers(e.target.value).slice(0, 10))}
          />
        </div>
        {docError && <p className="personal__field-error">{docError}</p>}
      </div>

      {/* 5. Sexo */}
      <div className="personal__field">
        <label className="personal__label">
          Sexo
          <span className="personal__required"> *</span>
        </label>
        <div className={`personal__radio-group ${fieldErrors.sexo ? 'personal__radio-group--error' : ''}`}>
          {[{ value: 'F', label: 'Femenino' }, { value: 'M', label: 'Masculino' }].map((opt) => (
            <label
              key={opt.value}
              className={`personal__radio-option ${form.sexo === opt.value ? 'personal__radio-option--active' : ''} ${fieldErrors.sexo ? 'personal__radio-option--error' : ''}`}
            >
              <input
                type="radio"
                name="sexo"
                value={opt.value}
                checked={form.sexo === opt.value}
                onChange={() => onChange('sexo', opt.value)}
              />
              <span className="personal__radio-dot" />
              {opt.label}
            </label>
          ))}
        </div>
        {fieldErrors.sexo && <p className="personal__field-error">{fieldErrors.sexo}</p>}
      </div>
       {/* 7. Estado Civil */}
      <PersonalSelect
        label="Estado civil"
        value={form.estadoCivil}
        onChange={(v) => onChange('estadoCivil', v)}
        options={estadosCivil}
        placeholder="Selecciona tu estado civil"
        required
        loading={loadingEstadosCivil}
        errorMsg={fieldErrors.estadoCivil}
      />
      {/* 6. Estado donde circula */}
      <PersonalSelect
        label="Estado donde circula"
        value={form.provincia}
        onChange={(v) => onChange('provincia', v)}
        options={provincias}
        placeholder="Selecciona tu estado"
        required
        loading={loadingProvincias}
        errorMsg={fieldErrors.provincia}
      />



      {/* 8. Correo Electrónico */}
      <PersonalInput
        label="Correo electrónico"
        value={form.correo}
        onChange={(v) => onChange('correo', v)}
        onBlur={() => setEmailTouched(true)}
        placeholder="Ingresa tu correo electrónico"
        required
        type="email"
        icon={<MailIcon />}
        errorMsg={fieldErrors.correo || emailLocalError}
      />

      {/* 9. Área + Número de teléfono (unificado) */}
      <div className="personal__field">
        <label className="personal__label">
          Número de teléfono
          <span className="personal__required"> *</span>
        </label>
        <div className={`personal__phone-combined ${loadingPrefijos ? 'personal__phone-combined--disabled' : ''} ${phoneError ? 'personal__phone-combined--error' : ''}`}>
          <div className="personal__phone-combined-prefix">
            <select
              className="personal__phone-combined-select"
              value={form.prefijo}
              onChange={(e) => onChange('prefijo', e.target.value)}
              disabled={loadingPrefijos}
            >
              <option value="">{loadingPrefijos ? '...' : ''}</option>
              {prefijos.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="personal__phone-combined-icon">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 5l5 5 5-5" stroke={loadingPrefijos ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <span className="personal__phone-combined-divider" />
          <input
            type="text"
            inputMode="numeric"
            className="personal__phone-combined-input"
            placeholder="000-0000"
            value={form.telefono}
            maxLength={7}
            onChange={(e) => onChange('telefono', onlyNumbers(e.target.value).slice(0, 7))}
          />
        </div>
        {phoneError && <p className="personal__field-error">{phoneError}</p>}
      </div>

      <p className="personal__required-note">
        <span className="personal__required">*</span> Campos obligatorios
      </p>
    </div>
  );
}

function Personal() {
  const {
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
    tiposDocumento, loadingTiposDoc,
    provincias, loadingProvincias,
    estadosCivil, loadingEstadosCivil,
    prefijos, loadingPrefijos,
    handleTabChange,
    handleFileChange,
    handleChangeScanImage,
    handleManualChange,
    handleContinue,
    handleOtpVerify,
    handleOtpResend,
    handleOtpClose,
    handleBack,
  } = usePersonalController();

  const otpPhone = `${manualForm.prefijo}${manualForm.telefono}`;

  return (
    <div className="personal">
      <div className="personal__card">
        <Stepper steps={3} currentStep={2} />

        <h2 className="personal__title">Datos personales</h2>
        <p className="personal__subtitle">
          {activeTab === 'escanear'
            ? 'Sube la cédula de identidad del titular de la póliza para continuar con el proceso de emisión'
            : 'Ingresa manualmente los datos del titular de la póliza'}
        </p>

        <div className="personal__tabs">
          <button
            className={`personal__tab ${activeTab === 'escanear' ? 'personal__tab--active' : ''}`}
            onClick={() => handleTabChange('escanear')}
          >
            Escanear
          </button>
          <button
            className={`personal__tab ${activeTab === 'manual' ? 'personal__tab--active' : ''}`}
            onClick={() => handleTabChange('manual')}
          >
            Manual
          </button>
        </div>

        {activeTab === 'escanear' ? (
          <>
            {/* Upload section: visible mientras no haya escaneo exitoso */}
            {(!scanDone || ocrLoading || ocrError) && (
              <div className="personal__upload-section">
                <h3 className="personal__upload-label">Cédula de identidad</h3>
                <p className="personal__upload-hint">Tomar o cargar foto de tu cédula de identidad</p>
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
              <div className="personal__ocr-loading">
                <span className="personal__ocr-spinner" />
                Analizando documento...
              </div>
            )}

            {/* Tarjeta de éxito */}
            {scanDone && !ocrLoading && !ocrError && (
              <div className="personal__scan-success">
                <div className="personal__scan-success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M9 14.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2.5c1.2-1.2 3-.8 3.8.5l1 1.6c.4.7 1.1 1.1 1.9 1.2l1.9.2c1.7.2 2.7 1.8 2.2 3.4l-.6 1.8c-.2.8 0 1.6.6 2.2l1.3 1.4c1.2 1.2.8 3-.5 3.8l-1.6 1c-.7.4-1.1 1.1-1.2 1.9l-.2 1.9c-.2 1.7-1.8 2.7-3.4 2.2l-1.8-.6c-.8-.2-1.6 0-2.2.6l-1.4 1.3c-1.2 1.2-3 .8-3.8-.5l-1-1.6c-.4-.7-1.1-1.1-1.9-1.2l-1.9-.2c-1.7-.2-2.7-1.8-2.2-3.4l.6-1.8c.2-.8 0-1.6-.6-2.2L2.7 17c-1.2-1.2-.8-3 .5-3.8l1.6-1c.7-.4 1.1-1.1 1.2-1.9l.2-1.9C6.4 6.7 8 5.7 9.6 6.2l1.8.6c.8.2 1.6 0 2.2-.6L14 4.9" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="personal__scan-success-title">Documento cargado con éxito</p>
                <button className="personal__scan-success-link" onClick={handleChangeScanImage}>
                  Clic para cambiar imagen
                </button>
              </div>
            )}

            {/* Error OCR */}
            {scanDone && !ocrLoading && ocrError && (
              <p className="personal__ocr-error">{ocrError}</p>
            )}

            {/* Formulario de datos (pre-cargado con OCR o para llenar manualmente) */}
            {scanDone && !ocrLoading && (
              <div className="personal__scan-form-separator">
                <ManualForm
                  form={manualForm}
                  onChange={handleManualChange}
                  tiposDocumento={tiposDocumento}   loadingTiposDoc={loadingTiposDoc}
                  provincias={provincias}           loadingProvincias={loadingProvincias}
                  estadosCivil={estadosCivil}       loadingEstadosCivil={loadingEstadosCivil}
                  prefijos={prefijos}               loadingPrefijos={loadingPrefijos}
                  fieldErrors={fieldErrors}
                />
              </div>
            )}
          </>
        ) : (
          <ManualForm
            form={manualForm}
            onChange={handleManualChange}
            tiposDocumento={tiposDocumento}   loadingTiposDoc={loadingTiposDoc}
            provincias={provincias}           loadingProvincias={loadingProvincias}
            estadosCivil={estadosCivil}       loadingEstadosCivil={loadingEstadosCivil}
            prefijos={prefijos}               loadingPrefijos={loadingPrefijos}
            fieldErrors={fieldErrors}
          />
        )}

        {error && <p className="personal__error">{error}</p>}

        <button
          className={`personal__btn-continue ${!canContinue ? 'personal__btn-continue--disabled' : ''}`}
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? 'Enviando código...' : 'Continuar'}
        </button>

        <button className="personal__btn-back" onClick={handleBack}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11 7.5H4M4 7.5L7.5 4M4 7.5L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Atrás
        </button>
      </div>

      <OtpModal
        isOpen={otpOpen}
        phone={otpPhone}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        onClose={handleOtpClose}
        verifyLoading={otpVerifyLoading}
        resendLoading={otpLoading}
        externalError={otpError}
      />
    </div>
  );
}

export default Personal;
