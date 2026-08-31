import '../OtpModal/OtpModal.css';
import './PaymentRejectedModal.css';

function PaymentRejectedModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="otp-modal__backdrop" onClick={handleBackdropClick}>
      <div className="otp-modal" role="dialog" aria-modal="true">

        <button className="otp-modal__close" onClick={onClose} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M12 1L1 12M1 1L12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="payment-rejected__icon-wrap">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="16" fill="#ef4444" fillOpacity="0.12" />
            <path
              d="M11 11l10 10M21 11L11 21"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h3 className="otp-modal__title">Pago rechazado</h3>
        <p className="payment-rejected__message">
          {message || 'El pago fue rechazado por el banco.'}
        </p>

        <button className="otp-modal__btn" onClick={onClose}>
          Entendido
        </button>

      </div>
    </div>
  );
}

export default PaymentRejectedModal;
