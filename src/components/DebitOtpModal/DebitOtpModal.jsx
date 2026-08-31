import { useState, useRef, useEffect } from 'react';
import SplashLoader from '../SplashLoader/SplashLoader';
import '../OtpModal/OtpModal.css';

const OTP_LENGTH = 8;

function DebitOtpModal({ isOpen, phone, onVerify, onResend, onClose, verifyLoading, emitting, resendLoading, externalError }) {
  const [digits, setDigits]       = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer]         = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const intervalRef = useRef(null);
  const otpReqRef = useRef(null);

  const webOtpSupported = typeof window !== 'undefined' && 'OTPCredential' in window;

  // Rellena las casillas con un código (de WebOTP, portapapeles o pegado).
  const fillCode = (raw) => {
    const code = (raw || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!code) return false;
    const newDigits = Array(OTP_LENGTH).fill('');
    code.split('').forEach((c, i) => { newDigits[i] = c; });
    setDigits(newDigits);
    inputRefs.current[Math.min(code.length, OTP_LENGTH - 1)]?.focus();
    return true;
  };

  // Respaldo: leer el código desde el portapapeles (el usuario copia el SMS).
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      fillCode(text);
    } catch {
      /* permiso de portapapeles denegado o no disponible */
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    startTimer();
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
    return () => clearInterval(intervalRef.current);
  }, [isOpen]);

  // WebOTP: una sola petición por apertura (la 2da ejecución la reutiliza para
  // no colgar el diálogo de Chrome). Requiere puerto estándar (443).
  useEffect(() => {
    if (!isOpen || !webOtpSupported) return;
    if (otpReqRef.current) return;

    const ac = new AbortController();
    otpReqRef.current = { ac };

    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then((otp) => { fillCode(otp?.code); })
      .catch(() => { /* prompt cancelado, abortado o no soportado */ })
      .finally(() => {
        if (otpReqRef.current?.ac === ac) otpReqRef.current = null;
      });
  }, [isOpen, webOtpSupported]);

  // Aborta la petición SOLO cuando el modal se cierra de verdad.
  useEffect(() => {
    if (isOpen) return;
    otpReqRef.current?.ac.abort();
    otpReqRef.current = null;
  }, [isOpen]);

  const startTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(60);
    setCanResend(false);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleResend = () => {
    if (!canResend || resendLoading) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    startTimer();
    inputRefs.current[0]?.focus();
    onResend();
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH || verifyLoading) return;
    onVerify(code);
  };

  // El modal bloquea su cierre manual: solo se cierra programáticamente
  // tras recibir respuesta del endpoint /debitoinmediato/confirmacion.

  const isComplete = digits.every((d) => d !== '');
  const verifyDisabled = !isComplete || verifyLoading;

  if (!isOpen) return null;

  const isLoadingStage = verifyLoading || emitting;

  return (
    <div className="otp-modal__backdrop">
      <div className="otp-modal" role="dialog" aria-modal="true">

        {isLoadingStage ? (
          <SplashLoader
            title={emitting ? 'Emitiendo' : 'Verificando'}
            subtitle={
              emitting
                ? 'Estamos emitiendo tu póliza, esto tomará unos segundos.'
                : 'Estamos validando tu código con el banco.'
            }
            steps={
              emitting
                ? ['Generando póliza', 'Asignando número', 'Casi listo']
                : ['Validando código', 'Confirmando con el banco', 'Procesando débito']
            }
          />
        ) : (
          <>
            <button
              type="button"
              className="otp-modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="otp-modal__icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="16" fill="#3d1f8f" fillOpacity="0.1" />
                <path d="M11 13a5 5 0 0 1 10 0v1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h1v-1Z" stroke="#3d1f8f" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="16" cy="18" r="1.5" fill="#3d1f8f" />
              </svg>
            </div>

            <h3 className="otp-modal__title">Verificación de débito inmediato</h3>
            <p className="otp-modal__subtitle">
              Valide su débito inmediato con el código que le llegó a su número
              <br />
              <strong className="otp-modal__phone">{phone}</strong>
            </p>

            <div className="otp-modal__inputs otp-modal__inputs--debit" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-modal__input otp-modal__input--debit ${digit ? 'otp-modal__input--filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {externalError && (
              <p className="otp-modal__error">{externalError}</p>
            )}

            <button
              className={`otp-modal__btn ${verifyDisabled ? 'otp-modal__btn--disabled' : ''}`}
              onClick={handleVerify}
              disabled={verifyDisabled}
            >
              Verificar
            </button>

            <div className="otp-modal__resend">
              {canResend ? (
                <button
                  className="otp-modal__resend-btn"
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {/*{resendLoading ? 'Enviando...' : 'Reenviar código'}*/}
                </button>
              ) : (
                <span className="otp-modal__resend-timer">
                  Reenviar código en <strong>{timer}s</strong>
                </span>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default DebitOtpModal;
