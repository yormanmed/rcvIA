import useDebitFormController from '../../controllers/useDebitFormController';
import SplashLoader from '../../components/SplashLoader/SplashLoader';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';
import DebitOtpModal from '../../components/DebitOtpModal/DebitOtpModal';
import PaymentRejectedModal from '../../components/PaymentRejectedModal/PaymentRejectedModal';
import './DebitForm.css';

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

const ChevronIcon = ({ disabled }) => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M2 5l5 5 5-5" stroke={disabled ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function DebitForm() {
  const {
    form,
    phone,
    banks,
    loadingBanks,
    phonePrefixes,
    loadingPhonePrefixes,
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
  } = useDebitFormController();

  if (cotizacionLoading || loading) {
    const isProcessing = loading && !cotizacionLoading;
    return (
      <div className="debit-form debit-form--splash">
        <SplashLoader
          fullscreen
          title={isProcessing ? 'Procesando débito' : 'Cargando cotización'}
          subtitle={
            isProcessing
              ? 'Estamos enviando tu solicitud de débito inmediato.'
              : 'Estamos preparando tu plan personalizado.'
          }
          steps={
            isProcessing
              ? ['Validando datos', 'Confirmando con el banco', 'Generando código']
              : ['Calculando prima', 'Verificando coberturas', 'Casi listo']
          }
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
    <div className="debit-form">
      <div className="debit-form__card">
        {/* Plan summary banner */}
        <div className="debit-form__banner">
          <div className="debit-form__banner-sparkles">
            <SparkleIcon />
            <SparkleIcon />
          </div>
            { discountCode> 0 ? 
              (
                
                <div className="debit-form__banner-content">
                  <span style={{fontSize:'13px', color:'#fff'}}>Desde </span>
                  <span style={{textDecoration:'line-through',fontSize:'13px', color:'#fff'}}>€ {discountPrice.beforePrima}</span>
                  <span className="debit-form__banner-price" style={{fontSize:'20px', color:'#fff'}}> € {discountPrice.primaDescuento}</span>
                  <span className="debit-form__banner-label">/ Anual</span>
                </div>
              ) 
              :
              (
                <div className="debit-form__banner-content">
                  <span className="debit-form__banner-price">€{primaFmt}</span>
                  <span className="debit-form__banner-label">Anual</span>
                </div>
              ) 
            }
          
          <span className="debit-form__banner-quota">1 cuota</span>
        </div>

        {/* Body */}
        <div className="debit-form__body">
          {/* Amount */}
          <div className="debit-form__amount-row">
            <span className="debit-form__amount-label">Monto a pagar</span>
            <div className="debit-form__amount-value">
              <span>
                Bs. <strong>{primaBsFmt}</strong> /Año
              </span>
              <button className="debit-form__info-btn" title="Información de cambio">
                <InfoIcon />
              </button>
            </div>
          </div>

          <div className="debit-form__divider" />

          {/* Form fields */}
          <div className="debit-form__fields">
            <div className="debit-form__field">
              <label className="debit-form__label">Banco</label>
              <SearchableSelect
                value={form.bank}
                onChange={(v) => handleChange('bank', v)}
                options={banks.map((bank) => ({ value: bank.id, label: bank.name }))}
                placeholder={loadingBanks ? 'Cargando bancos...' : 'Selecciona tu banco'}
                searchPlaceholder="Buscar banco..."
                disabled={loadingBanks}
              />
            </div>

            <div className="debit-form__field">
              <label className="debit-form__label">Teléfono</label>
              <div className={`debit-form__phone-combined ${loadingPhonePrefixes ? 'debit-form__phone-combined--disabled' : ''}`}>
                <div className="debit-form__phone-combined-prefix">
                  <select
                    className="debit-form__phone-combined-select"
                    value={form.phonePrefix}
                    onChange={(e) => handleChange('phonePrefix', e.target.value)}
                    disabled={loadingPhonePrefixes}
                  >
                    
                    <option value=""></option>
                    {phonePrefixes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="debit-form__phone-combined-icon">
                    <ChevronIcon disabled={loadingPhonePrefixes} />
                  </span>
                </div>
                <span className="debit-form__phone-combined-divider" />
                <input
                  type="text"
                  className="debit-form__phone-combined-input"
                  placeholder="000-0000"
                  value={form.phoneNumber}
                  maxLength={7}
                  onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="debit-form__field">
              <label className="debit-form__label">Cédula de identidad</label>
              <div className="debit-form__doc-combined">
                <div className="debit-form__doc-combined-prefix">
                  <select
                    className="debit-form__doc-combined-select"
                    value={form.cedulaType}
                    onChange={(e) => handleChange('cedulaType', e.target.value)}
                  >
                    <option value=""></option>
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                  <span className="debit-form__doc-combined-icon">
                    <ChevronIcon />
                  </span>
                </div>
                <span className="debit-form__doc-combined-divider" />
                <input
                  type="text"
                  className="debit-form__doc-combined-input"
                  placeholder="12345678"
                  value={form.cedula}
                  maxLength={10}
                  onChange={(e) => handleChange('cedula', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          </div>

          {error && <p className="debit-form__error">{error}</p>}

          <button
            className={`debit-form__btn-continue ${!canSubmit ? 'debit-form__btn-continue--disabled' : ''}`}
            onClick={handleContinue}
            disabled={loading || !canSubmit}
          >
            {loading ? 'Procesando...' : 'Continuar'}
          </button>

          <button className="debit-form__btn-back" onClick={handleBack}>
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

      <DebitOtpModal
        isOpen={otpOpen}
        phone={phone}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        onClose={handleOtpClose}
        verifyLoading={otpVerifyLoading}
        emitting={otpEmitting}
        resendLoading={otpResendLoading}
        externalError={otpError}
      />

      <PaymentRejectedModal
        isOpen={rejectedOpen}
        message={rejectedMessage}
        onClose={handleRejectedClose}
      />
    </div>
  );
}

export default DebitForm;
