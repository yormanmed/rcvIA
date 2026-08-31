import useSuccessController from '../../controllers/useSuccessController';
import './Success.css';

function Success() {
  const {
    handleGoHome,
    descargarReporte,
    descargando,
    error,
    descargaIniciada,
    parametrosValidos,
  } = useSuccessController();

  return (
    <div className="success">
      <div className="success__card">
        <div className="success__icon-wrapper">
          <div className="success__sparkle success__sparkle--top-left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8L7 0Z"
                fill="#3d1f8f"
                fillOpacity="0.7"
              />
            </svg>
          </div>
          <div className="success__sparkle success__sparkle--top-right">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 0L11.8 8.2L20 10L11.8 11.8L10 20L8.2 11.8L0 10L8.2 8.2L10 0Z"
                fill="#3d1f8f"
                fillOpacity="0.5"
              />
            </svg>
          </div>
          <div className="success__sparkle success__sparkle--bottom-left">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0L5.9 4.1L10 5L5.9 5.9L5 10L4.1 5.9L0 5L4.1 4.1L5 0Z"
                fill="#3d1f8f"
                fillOpacity="0.4"
              />
            </svg>
          </div>

          <div className="success__circle">
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              className="success__check-svg"
            >
              <circle cx="36" cy="36" r="34" stroke="#22c55e" strokeWidth="2.5" />
              <path
                d="M22 36L32 46L50 28"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="success__title">¡Gracias por tu confianza!</h2>
        <p className="success__subtitle">
          En breve recibirás un correo electrónico con el detalle de tu solicitud.
        </p>

        <button
          className="success__btn-download"
          onClick={descargarReporte}
          disabled={!parametrosValidos || descargando}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2v9m0 0l-3.5-3.5M9 11l3.5-3.5M3 14h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {descargando ? 'Descargando...' : 'Descarga RCV'}
        </button>

        {error && <p className="success__error">{error}</p>}

        {descargaIniciada && !error && !descargando && (
          <p className="success__success">
            La descarga se inició. Revisa tu carpeta de descargas.
          </p>
        )}

        <button className="success__btn" onClick={handleGoHome}>
          Volver al inicio
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.5 9H14.5M14.5 9L10 4.5M14.5 9L10 13.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Success;
