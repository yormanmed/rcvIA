import usePaymentFormController from '../../controllers/usePaymentFormController';
import SplashLoader from '../../components/SplashLoader/SplashLoader';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';
import '../../components/OtpModal/OtpModal.css';
import './PaymentForm.css';

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M3 10H2a1 1 0 01-1-1V2a1 1 0 011-1h7a1 1 0 011 1v1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7.5 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="7.5" cy="4.5" r="0.6" fill="currentColor" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1L9.2 6.8L15 8L9.2 9.2L8 15L6.8 9.2L1 8L6.8 6.8L8 1Z"
      fill="white"
      fillOpacity="0.6"
    />
  </svg>
);

const BancamigaIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#3d1f8f" fillOpacity="0.1" />
    <path
      d="M8 26V12C8 11 8.8 10 10 10H18C22.4 10 26 13.6 26 18C26 22.4 22.4 26 18 26H8Z"
      stroke="#3d1f8f"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M8 18H22" stroke="#3d1f8f" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).catch(() => {});
};

function PaymentForm() {
  const {
    form,
    banks,
    loadingBanks,
    phonePrefixes,
    loadingPhonePrefixes,
    tiposDocumento,
    loadingTiposDoc,
    selectedPlan,
    loading,
    error,
    cotizacion,
    cotizacionLoading,
    canSubmit,
    handleChange,
    handleContinue,
    handleBack,
    disabledAmount
  } = usePaymentFormController();

  if (cotizacionLoading) {
    return (
      <div className="payment-form payment-form--splash">
        <SplashLoader
          fullscreen
          title="Cargando cotización"
          subtitle="Estamos preparando tu plan personalizado."
          steps={['Calculando prima', 'Verificando coberturas', 'Casi listo']}
        />
      </div>
    );
  }

  const primaFmt = cotizacion.prima.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const primaBsFmt = cotizacion.primaPlanBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="payment-form">
      <div className="payment-form__card">
        {/* Plan summary banner */}
        <div className="payment-form__banner">
          <div className="payment-form__banner-sparkles">
            <SparkleIcon />
            <SparkleIcon />
          </div>
          <div className="payment-form__banner-content">
            <span className="payment-form__banner-price">€{primaFmt}</span>
            <span className="payment-form__banner-label">Anual</span>
          </div>
          <span className="payment-form__banner-quota">1 cuota</span>
        </div>

        {/* Body */}
        <div className="payment-form__body">
          <div className="payment-form__header-row">
            <div className="payment-form__bank-info">
              <BancamigaIcon />
              <div>
                <p className="payment-form__method-title">Datos del pago móvil</p>
              </div>
            </div>
            <span className="payment-form__badge">+ Cuota Pendiente</span>
          </div>

          {/* Amount */}
          <div className="payment-form__amount-row">
            <span className="payment-form__amount-label">Monto a pagar</span>
            <div className="payment-form__amount-value">
              <span>
                Bs. <strong>{primaBsFmt}</strong> /Año
              </span>
              <button className="payment-form__info-btn" title="Información de cambio">
                <InfoIcon />
              </button>
            </div>
          </div>

          {/* Pre-filled info */}
          <div className="payment-form__info-grid">
            <div className="payment-form__info-item">
              <label className="payment-form__info-label">Teléfono</label>
              <div className="payment-form__info-value">
                <span>04143393987</span>
                <button onClick={() => handleCopy('04143393987')} className="payment-form__copy-btn">
                  <CopyIcon />
                </button>
              </div>
            </div>
            <div className="payment-form__info-item">
              <label className="payment-form__info-label">Documento</label>
              <div className="payment-form__info-value">
                <span>J-000467382</span>
                <button onClick={() => handleCopy('J-000467382')} className="payment-form__copy-btn">
                  <CopyIcon />
                </button>
              </div>
            </div>
            <div className="payment-form__info-item">
              <label className="payment-form__info-label">Banco</label>
              <div className="payment-form__info-value">
                <span>Venezolano de Crédito</span>
              </div>
            </div>
          </div>

          <div className="payment-form__divider" />

          {/* Form fields */}
          <div className="payment-form__fields">
            <div className="payment-form__field">
              <label className="payment-form__label">Banco</label>
              <SearchableSelect
                value={form.bank}
                onChange={(v) => handleChange('bank', v)}
                options={banks.map((bank) => ({ value: bank.id, label: bank.name }))}
                placeholder={loadingBanks ? 'Cargando bancos...' : 'Selecciona tu banco'}
                searchPlaceholder="Buscar banco..."
                disabled={loadingBanks}
              />
            </div>

            <div className="payment-form__field">
              <label className="payment-form__label">Documento</label>
              <div className={`payment-form__phone-combined ${loadingTiposDoc ? 'payment-form__phone-combined--disabled' : ''}`}>
                <div className="payment-form__phone-combined-prefix payment-form__phone-combined-prefix--doc">
                  <select
                    className="payment-form__phone-combined-select payment-form__phone-combined-select--doc"
                    value={form.documentType}
                    onChange={(e) => handleChange('documentType', e.target.value)}
                    disabled={loadingTiposDoc}
                  >
                    <option value="">{'...' }</option>
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.value}
                      </option>
                    ))}
                  </select>
                  <span className="payment-form__phone-combined-icon">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 5l5 5 5-5" stroke={loadingTiposDoc ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <span className="payment-form__phone-combined-divider" />
                <input
                  type="text"
                  inputMode="numeric"
                  className="payment-form__phone-combined-input"
                  placeholder="Número de documento"
                  value={form.documentNumber}
                  maxLength={10}
                  onChange={(e) => handleChange('documentNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="payment-form__field">
              <label className="payment-form__label">Número de teléfono</label>
              <div className={`payment-form__phone-combined ${loadingPhonePrefixes ? 'payment-form__phone-combined--disabled' : ''}`}>
                <div className="payment-form__phone-combined-prefix">
                  <select
                    className="payment-form__phone-combined-select"
                    value={form.phonePrefix}
                    onChange={(e) => handleChange('phonePrefix', e.target.value)}
                    disabled={loadingPhonePrefixes}
                  >
                    {loadingPhonePrefixes && <option value="">...</option>}
                    <option value="">...</option>
                    {phonePrefixes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="payment-form__phone-combined-icon">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 5l5 5 5-5" stroke={loadingPhonePrefixes ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <span className="payment-form__phone-combined-divider" />
                <input
                  type="text"
                  className="payment-form__phone-combined-input"
                  placeholder="000-0000"
                  value={form.phoneNumber}
                  maxLength={7}
                  onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="payment-form__field">
              <label className="payment-form__label">Fecha de operación</label>
              <input
                type="date"
                className="payment-form__input"
                value={form.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            <div className="payment-form__field">
              <label className="payment-form__label">Monto</label>
              <input 
                type="number"
                className="payment-form__input"
                placeholder="0.00"
                disabled={true}
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>

            <div className="payment-form__field">
              <label className="payment-form__label">Referencia</label>
              <input
                type="text"
                className="payment-form__input"
                placeholder="Número de referencia"
                value={form.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
              />
            </div>
          </div>

          {error && <p className="payment-form__error">{error}</p>}

          <button
            className={`payment-form__btn-continue ${!canSubmit ? 'payment-form__btn-continue--disabled' : ''}`}
            onClick={handleContinue}
            disabled={loading || !canSubmit}
          >
            {loading ? 'Procesando...' : 'Continuar'}
          </button>

          <button className="payment-form__btn-back" onClick={handleBack}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M11 7.5H4M4 7.5L7.5 4M4 7.5L7.5 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Atrás
          </button>
        </div>
      </div>

      {loading && (
        <div className="otp-modal__backdrop">
          <div className="otp-modal" role="dialog" aria-modal="true">
            <SplashLoader
              title="Procesando pago"
              subtitle="Estamos validando tu pago y emitiendo la póliza."
              steps={['Validando datos', 'Confirmando con el banco', 'Emitiendo póliza']}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentForm;
