import Stepper from '../../components/Stepper/Stepper';
import SplashLoader from '../../components/SplashLoader/SplashLoader';
import usePlanController from '../../controllers/usePlanController';
import './Plan.css';

const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="8.5" fill="#3d1f8f" fillOpacity="0.1" />
    <path
      d="M5.5 8.5L7.5 10.5L11.5 6.5"
      stroke="#3d1f8f"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlanSelectedIcon = () => (
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
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M2 2H3.5L5.5 13H15.5L17.5 6H5.5"
      stroke="#3d1f8f"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="16" r="1.5" fill="#3d1f8f" />
    <circle cx="14" cy="16" r="1.5" fill="#3d1f8f" />
  </svg>
);

function Plan() {
  const { plans, selectedPlan, loading, handleSelectPlan, handleContinue, handleBack } =
    usePlanController();
 
  
  return (
    <div className="plan">
      <div className="plan__card">
        <Stepper steps={3} currentStep={3} />

        <h2 className="plan__title">Elige tu plan</h2>
        <p className="plan__subtitle">Selecciona el plan para continuar con el proceso</p>

        {loading ? (
          <SplashLoader
            title="Cargando planes"
            subtitle="Buscamos los mejores planes para tu vehículo."
            steps={['Consultando coberturas', 'Calculando primas', 'Casi listo']}
          />
        ) : (
          <div className="plan__list">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`plan__item ${isSelected ? 'plan__item--selected' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="plan__item-header">
                    <div className="plan__item-name">
                      <CartIcon />
                      <span>{plan.name}</span>
                    </div>
                    {isSelected && <PlanSelectedIcon />}
                  </div>

                  {isSelected && (
                    <div className="plan__item-body">
                      <p className="plan__price">
                        <span className="plan__price-amount">
                          {plan.currency}{Number(plan.price).toFixed(2)}
                        </span>
                        <span className="plan__price-period">  {plan.period}</span>
                      </p>
                      <ul className="plan__features">
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <CheckIcon /> {feature}
                          </li>
                        ))}
                      </ul>
                      <button className="plan__see-more">Ver más</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          className="plan__btn-pay"
          onClick={handleContinue}
          disabled={!selectedPlan}
        >
          Pagar ahora
        </button>

        <button className="plan__btn-back" onClick={handleBack}>
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

export default Plan;
