import { apiClient, fileClient } from './api.service';
import CONFIG from './config.service';

const PolicyService = {
  async getPlans() {
    return apiClient.get('/planes/rcv');
  },

  async getPlanById(id) {
    return apiClient.get(`/planes/${id}`);
  },

  async createPolicy(data) {
    return apiClient.post('/polizas', data);
  },

  async getPolicyById(id) {
    return apiClient.get(`/polizas/${id}`);
  },

  async getCotizacion({ cd_clase, cd_uso }) {
    return apiClient.post('/procedure.rcv.cotizacion', {
      procedure:          'RCVCotizacion',
      cd_marca:           1,
      cd_modelo:          1,
      cd_anio:            1,
      cd_version:         1,
      cd_clase,
      cd_uso,
      cd_cobertura:       1,
      cd_plan_pago:       11,
      nu_toneladas_extra: 0,
      entidad:            CONFIG.ENTITY_CLIENT,
      token:              CONFIG.TOKEN,
    });
  },

  async emitirPoliza(solicitud) {
    return apiClient.post('/procedure.rcv.emision.enlinea', {
      cd_producto: 260200,
      entidad:            CONFIG.ENTITY_CLIENT,
      token:              CONFIG.TOKEN,
      solicitud,
    });
  },

  async descargarRcv({ cd_area, nu_poliza }) {
    return fileClient.post(
      '/descargarArchivo.SIP',
      {
        parametrosReporte: {
          CD_AREA:   cd_area,
          NU_POLIZA: nu_poliza,
        },
        parametrosProceso: null,
        codigoProceso:     2,
      },
      { responseType: 'blob' }
    );
  },
  async marcarDescuento(solicitud) {
    return apiClient.post('/descuento/cerrar', {
      entidad:            CONFIG.ENTITY_CLIENT,
      token:              CONFIG.TOKEN,
      solicitud,
    });
  }
};

export default PolicyService;
