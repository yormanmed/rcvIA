import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PolicyService from '../services/policy.service';
import PersonalService from '../services/personal.service';

const useSuccessController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan, cd_area: stateCdArea, nu_poliza: stateNuPoliza } = location.state || {};

  const cd_area  = stateCdArea  ?? localStorage.getItem('cdArea')   ?? '';
  const nu_poliza = stateNuPoliza ?? localStorage.getItem('nuPoliza') ?? '';

  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);
  const [descargaIniciada, setDescargaIniciada] = useState(false);

  const parametrosValidos = Boolean(cd_area && nu_poliza);

  useEffect(() => {
    const actualizarMarcajes = async () => {
      let marcajes = [];
      try {
        marcajes = JSON.parse(localStorage.getItem('quoteMarcajes') || '[]');
      } catch {
        return;
      }
      if (!Array.isArray(marcajes) || marcajes.length === 0) return;

      let todosExitosos = true;
      for (const cd_marcaje of marcajes) {
        if (cd_marcaje == null) continue;
        try {
          const res = await PersonalService.actualizarMarcaje(cd_marcaje);
          if (res?.httpStatus !== 200 && res?.responseCode !== 200) todosExitosos = false;
        } catch {
          todosExitosos = false;
        }
      }

      if (todosExitosos) localStorage.removeItem('quoteMarcajes');
    };
    actualizarMarcajes();
  }, []);

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

  const handleGoHome = () => {
    navigate('/');
  };

  return {
    selectedPlan,
    cd_area,
    nu_poliza,
    descargando,
    error,
    descargaIniciada,
    parametrosValidos,
    descargarReporte,
    handleGoHome,
  };
};

export default useSuccessController;