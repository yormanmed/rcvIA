import usePaymentMethodController from '../../controllers/usePaymentMethodController';
import './PaymentMethod.css';

const MobileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="5" y="2" width="12" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="11" cy="17" r="1" fill="currentColor" />
    <path d="M8 6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="5" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ICONS = {
  'pago-movil': MobileIcon,
  debito: CardIcon,
};

function PaymentMethod() {
  const { paymentMethods, selectedMethod, handleSelectMethod, handleContinue, handleBack } =
    usePaymentMethodController();

  return (
    <div className="payment-method">
      <div className="payment-method__card">
        <h2 className="payment-method__title">Elige tu forma de pago</h2>
        <p className="payment-method__subtitle">
          Selecciona una opción para continuar con el proceso
        </p>

        <div className="payment-method__list">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod?.id === method.id;
            const Icon = ICONS[method.id] || MobileIcon;
            return (
              <div
                key={method.id}
                className={[
                  'payment-method__item',
                  isSelected && 'payment-method__item--selected',
                  method.disabled && 'payment-method__item--disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelectMethod(method)}
              >
                <div className="payment-method__item-icon">
                  <Icon />
                </div>
                <div className="payment-method__item-info">
                  <span className="payment-method__item-label">{method.label}</span>
                  <span className="payment-method__item-desc">{method.description}</span>
                </div>
                {isSelected && (
                  <div className="payment-method__item-check">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#3d1f8f" />
                      <path
                        d="M6 10L8.5 12.5L14 7"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="payment-method__btn-continue"
          onClick={handleContinue}
          disabled={!selectedMethod}
        >
          Continuar
        </button>

        <button className="payment-method__btn-back" onClick={handleBack}>
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
  );
}

export default PaymentMethod;
