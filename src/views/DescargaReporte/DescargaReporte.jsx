import fondoSvg from '../../assets/fondo.svg';
import useDescargaReporteController from '../../controllers/useDescargaReporteController';
import './DescargaReporte.css';

function DescargaReporte() {
  const { descargando, error, descargaIniciada, parametrosValidos, descargarReporte } =
    useDescargaReporteController();

  return (
    <div className="descarga-reporte">
      <img className="descarga-reporte__bg" src={fondoSvg} alt="" aria-hidden="true" />
      <div className="descarga-reporte__card">
        <div className="descarga-reporte__icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="#f3eefb" />
            <path
              d="M28 16v18m0 0l-6-6m6 6l6-6M18 40h20"
              stroke="#3d1f8f"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="descarga-reporte__title">¡Bienvenido!</h2>
        <p className="descarga-reporte__subtitle">
          Puedes descargar su RCV con tan solo un clic.
        </p>

        {!parametrosValidos && (
          <p className="descarga-reporte__error" role="alert">
            Los parámetros del reporte son inválidos.
          </p>
        )}

        {error && (
          <p className="descarga-reporte__error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="descarga-reporte__btn"
          onClick={descargarReporte}
          disabled={!parametrosValidos || descargando}
        >
          {descargando ? 'Descargando...' : 'Descargar RCV'}
        </button>

        {descargaIniciada && !error && !descargando && (
          <p className="descarga-reporte__success">
            La descarga se inició. Revisa tu carpeta de descargas.
          </p>
        )}
      </div>
    </div>
  );
}

export default DescargaReporte;