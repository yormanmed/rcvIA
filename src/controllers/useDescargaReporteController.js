import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import PolicyService from '../services/policy.service';

function useDescargaReporteController() {
  const { cd_area, nu_poliza } = useParams();
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);
  const [descargaIniciada, setDescargaIniciada] = useState(false);

  const parametrosValidos = Boolean(cd_area && nu_poliza);

  const descargarReporte = useCallback(async () => {
    if (!parametrosValidos || descargando) return;

    const nombreArchivo = `reporte_${cd_area}_${nu_poliza}.pdf`;

    setDescargando(true);
    setError(null);
    setDescargaIniciada(true);
    try {
      const archivo = await PolicyService.descargarRcv({ cd_area, nu_poliza });
      const reportePdf = archivo instanceof Blob
        ? archivo
        : new Blob([archivo], { type: 'application/pdf' });
      const urlReporte = URL.createObjectURL(reportePdf);

      const enlaceDescarga = document.createElement('a');
      enlaceDescarga.href = urlReporte;
      enlaceDescarga.download = nombreArchivo;
      enlaceDescarga.rel = 'noopener';
      enlaceDescarga.style.display = 'none';
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      enlaceDescarga.remove();

      setTimeout(() => URL.revokeObjectURL(urlReporte), 60000);
    } catch (errorDescarga) {
      setError(errorDescarga.message || 'No se pudo descargar el reporte.');
    } finally {
      setDescargando(false);
    }
  }, [cd_area, nu_poliza, parametrosValidos, descargando]);

  return { descargando, error, descargaIniciada, parametrosValidos, descargarReporte };
}

export default useDescargaReporteController;
