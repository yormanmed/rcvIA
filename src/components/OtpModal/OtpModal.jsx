import { useState, useRef, useEffect } from 'react';
import './OtpModal.css';

const OTP_LENGTH = 6;

function OtpModal({ isOpen, phone, onVerify, onResend, onClose, verifyLoading, resendLoading, externalError }) {
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
  // Útil cuando el autocompletado del SMS no se dispara (p. ej. puerto no estándar).
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

  // WebOTP: crea UNA sola petición por apertura. Si el efecto corre dos veces
  // (StrictMode / re-montaje), la segunda reutiliza la activa en vez de crear
  // otra — dos peticiones simultáneas cuelgan el diálogo de Chrome.
  // Nota: WebOTP requiere puerto estándar (443); en puertos no estándar el
  // diálogo aparece pero la promesa no resuelve (usar "Pegar código").
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
    // Sin abort en el cleanup: el doble montaje de StrictMode mataría la única
    // petición válida. La cancelación se hace al cerrar el modal (efecto de abajo).
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
    const clean = value.replace(/\D/g, '');

    // Borrado de la casilla.
    if (!clean) {
      if (value === '') {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      return;
    }

    // Autorrelleno del SMS (Android/iOS) o pegado: varios dígitos llegan a un
    // solo input. Se reparten entre las casillas a partir de la actual.
    if (clean.length > 1) {
      const newDigits = [...digits];
      let cursor = index;
      for (const ch of clean) {
        if (cursor > OTP_LENGTH - 1) break;
        newDigits[cursor] = ch;
        cursor += 1;
      }
      setDigits(newDigits);
      inputRefs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    if (index < OTP_LENGTH - 1) {
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isComplete = digits.every((d) => d !== '');
  const verifyDisabled = !isComplete || verifyLoading;

  if (!isOpen) return null;

  return (
    <div className="otp-modal__backdrop" onClick={handleBackdropClick}>
      <div className="otp-modal" role="dialog" aria-modal="true">

        <button className="otp-modal__close" onClick={onClose} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M12 1L1 12M1 1L12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="otp-modal__icon-wrap">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="16" fill="#3d1f8f" fillOpacity="0.1" />
            <path d="M11 13a5 5 0 0 1 10 0v1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h1v-1Z" stroke="#3d1f8f" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="16" cy="18" r="1.5" fill="#3d1f8f" />
          </svg>
        </div>

        <h3 className="otp-modal__title">Verificación de identidad</h3>
        <p className="otp-modal__subtitle">
          Ingresa el código de {OTP_LENGTH} dígitos que enviamos al número
          <br />
          <strong className="otp-modal__phone">{phone}</strong>
        </p>

        <div className="otp-modal__inputs" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              className={`otp-modal__input ${digit ? 'otp-modal__input--filled' : ''}`}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete={!webOtpSupported && i === 0 ? 'one-time-code' : 'off'}
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
          {verifyLoading ? 'Verificando...' : 'Verificar'}
        </button>

        <div className="otp-modal__resend">
          {canResend ? (
            <button
              className="otp-modal__resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Enviando...' : 'Reenviar código'}
            </button>
          ) : (
            <span className="otp-modal__resend-timer">
              Reenviar código en <strong>{timer}s</strong>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

export default OtpModal;
