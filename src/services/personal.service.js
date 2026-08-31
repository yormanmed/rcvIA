import { apiClient, fileClient } from './api.service';
import CONFIG from './config.service';

const base = (extra = {}) => ({
  entidad: CONFIG.ENTITY_CLIENT,
  token:   CONFIG.TOKEN,
  ...extra,
});

const PersonalService = {
  getTiposDocumento: () =>
    apiClient.post('/data.geo', base({ data: 'GEOTipoDocumentos' })),

  getProvincias: () =>
    apiClient.post('/data.geo', base({ data: 'GEOProvincias' })),

  getEstadosCivil: () =>
    apiClient.post('/data.geo', base({ data: 'GEOEstadoCivil' })),

  getPrefijos: () =>
    apiClient.post('/data.geo', base({ data: 'GEOAPrefijosMoviles' })),

  uploadOcrImage: (imagen) =>
    fileClient.post('/guardarOCR', {
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
      parametrosReporte: { tp_imagen: 'CI', imagen },
    }),

  processOcr: (cdImagen) =>
    apiClient.post('/ocr.extraerDatos', base({ tpSolicitud: 'CI', cdImagen })),

  sendOtp: (nu_telefono, de_correo = '') =>
    apiClient.post('/generacion.otp', base({ nu_telefono, de_correo, in_proceso: 'T' })),

  verifyOtp: (nu_telefono, cd_generacion_otp, de_correo = '') =>
    apiClient.post('/validacion.otp', base({ nu_telefono, de_correo, in_proceso: 'T', cd_generacion_otp })),

  sendMarcaje: (solicitud) =>
    apiClient.post('/dashboard/marcaje', base({ solicitud })),

  actualizarMarcaje: (cd_marcaje) =>
    apiClient.post('/dashboard/marcaje.actualizar', base({ solicitud: { cd_marcaje } })),
};

export default PersonalService;
