import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDiscountController from '../../controllers/useDiscountController';
import './Discount.css';

const CODE_LENGTH = 6;

function Discount() {
  const navigate = useNavigate();
  const { handleRedeem, cargando, error } = useDiscountController();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    const clean = value.replace(/\D/g, '');

    if (!clean) {
      if (value === '') {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      return;
    }

    if (clean.length > 1) {
      const newDigits = [...digits];
      let cursor = index;
      for (const ch of clean) {
        if (cursor > CODE_LENGTH - 1) break;
        newDigits[cursor] = ch;
        cursor += 1;
      }
      setDigits(newDigits);
      inputRefs.current[Math.min(cursor, CODE_LENGTH - 1)]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    if (index < CODE_LENGTH - 1) {
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
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleSubmit = async () => {
    if (cargando) return;
    const code = digits.join('');
    if (code.length < CODE_LENGTH) return;
    await handleRedeem(code);
  };

  const isComplete = digits.every((d) => d !== '');
  const submitDisabled = !isComplete || cargando;

  return (
    <div className="discount">
      <div className="discount__card" role="dialog" aria-modal="true" aria-labelledby="discount-title">

        <div className="discount__icon-wrap">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#3d1f8f" fillOpacity="0.1" />
            <path
              d="M12 14h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4v-3a1 1 0 0 1 1-1Z"
              stroke="#3d1f8f"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="20" r="1.8" fill="#3d1f8f" />
          </svg>
        </div>

        <h3 id="discount-title" className="discount__title">
          Canjea tu código de descuento para RCV
        </h3>
        <p className="discount__subtitle">
          Ingresa el código de {CODE_LENGTH} dígitos que recibiste
          <br />
          para obtener tu descuento en la póliza.
        </p>

        <div className="discount__inputs" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              className={`discount__input ${digit ? 'discount__input--filled' : ''}`}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete="off"
            />
          ))}
        </div>

        {error && <p className="discount__error">{error}</p>}

        <button
          className={`discount__btn ${submitDisabled ? 'discount__btn--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          {cargando ? 'Canjeando...' : 'Canjear código'}
        </button>

        <button
          type="button"
          className="discount__back"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>

      </div>
    </div>
  );
}

export default Discount;
