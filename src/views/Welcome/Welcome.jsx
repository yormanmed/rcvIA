import useWelcomeController from '../../controllers/useWelcomeController';
import './Welcome.css';

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

const IdCardIcon = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <rect x="1" y="1" width="36" height="36" rx="9" fill="#fff" stroke="#e5dcf7" strokeWidth="1.5" />
    <rect x="9" y="13" width="20" height="12" rx="2" stroke="#3d1f8f" strokeWidth="1.5" />
    <rect x="11.5" y="15.5" width="5" height="7" rx="1" stroke="#3d1f8f" strokeWidth="1.3" />
    <path d="M19 15.5h7M19 18.5h7M19 21.5h4" stroke="#3d1f8f" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CarIcon = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <rect x="1" y="1" width="36" height="36" rx="9" fill="#fff" stroke="#e5dcf7" strokeWidth="1.5" />
    <path
      d="M10 25V21.5L12 16.5C12.3 15.8 13 15.2 13.8 15.2H24.2C25 15.2 25.7 15.8 26 16.5L28 21.5V25"
      stroke="#3d1f8f"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M10 25H28" stroke="#3d1f8f" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 19.5H25" stroke="#3d1f8f" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="14" cy="25" r="1.5" stroke="#3d1f8f" strokeWidth="1.3" fill="#fff" />
    <circle cx="24" cy="25" r="1.5" stroke="#3d1f8f" strokeWidth="1.3" fill="#fff" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3.5 9H14.5M14.5 9L10 4.5M14.5 9L10 13.5"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Welcome() {
  const { handleContinue, discountCode } = useWelcomeController();

  return (
    <div className="welcome">
      <div className="welcome__card">
        <h1 className="welcome__title">Póliza de RCV</h1>
        <p className="welcome__subtitle">
          Activa tu póliza de Responsabilidad Civil Vehicular{' '}
          <strong className="welcome__subtitle-strong">en 3 minutos</strong> con nuestra{' '}
          <strong className="welcome__subtitle-strong">herramienta de I.A.</strong>
        </p>

        <p className="welcome__docs-label">Procura tener estos documentos a la mano  {discountCode} </p>

        <div className="welcome__docs">
          <div className="welcome__doc">
            <div className="welcome__doc-icon">
              <CarIcon />
            </div>
            <div className="welcome__doc-text">
              <span className="welcome__doc-title">Carnet de circulación</span>
              <span className="welcome__doc-desc">Del vehículo a asegurar</span>
            </div>
          </div>
          <div className="welcome__doc">
            <div className="welcome__doc-icon">
              <IdCardIcon />
            </div>
            <div className="welcome__doc-text">
              <span className="welcome__doc-title">Cédula de identidad</span>
              <span className="welcome__doc-desc">Del titular de la póliza</span>
            </div>
          </div>
          
        </div>

        <div className="welcome__benefits">
          <div className="welcome__benefit">
            <CheckIcon /> <span>100% digital</span>
          </div>
          <div className="welcome__benefit">
            <CheckIcon /> <span>Pago fraccionado</span>
          </div>
          <div className="welcome__benefit">
            <CheckIcon /> <span>Póliza emitida al instante</span>
          </div>
          <div className="welcome__benefit">
            <CheckIcon /> <span>RCV legal avalado por SUDEASEG</span>
          </div>
        </div>

        <button className="welcome__btn" onClick={handleContinue}>
          Cargar documentos <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

export default Welcome;
