import { apiClient, fileClient } from './api.service';
import CONFIG from './config.service';

const base = (extra = {}) => ({
  entidad: CONFIG.ENTITY_CLIENT,
  token:   CONFIG.TOKEN,
  ...extra,
});

const VehicleService = {
  getMarcas: () =>
    apiClient.post('/data.rcv', base({ data: 'RCVMarcas' })),

  getModelos: (cd_marca) =>
    apiClient.post('/data.rcv', base({ data: 'RCVModelos', cd_marca })),

  getAnios: (cd_marca, cd_modelo) =>
    apiClient.post('/data.rcv', base({ data: 'RCVAnios', cd_marca, cd_modelo })),

  getVersiones: (cd_marca, cd_modelo, cd_anio) =>
    apiClient.post('/data.rcv', base({ data: 'RCVVersion', cd_marca, cd_modelo, cd_anio })),

  getClases: (cd_marca, cd_modelo, cd_anio, cd_version) =>
    apiClient.post('/data.rcv', base({ data: 'RCVClase', cd_marca, cd_modelo, cd_anio, cd_version })),

  getUsos: (cd_marca, cd_modelo, cd_anio, cd_version, cd_clase) =>
    apiClient.post('/data.rcv', base({ data: 'RCVUso', cd_marca, cd_modelo, cd_anio, cd_version, cd_clase })),

  getColores: () =>
    apiClient.post('/data.rcv', base({ data: 'RCVColores' })),

  getClasesScan: () =>
    apiClient.post('/data.rcv', base({ data: 'RCVClases' })),

  getUsosScan: (cd_clase) =>
    apiClient.post('/data.rcv', base({ data: 'RCVUsos', cd_clase })),

  validarPlaca: (cd_placa) =>
    apiClient.post('/data.rcv', base({ data: 'GENValidarExistenciaPlaca', cd_placa })),

  uploadOcrImage: (imagen) =>
    fileClient.post('/guardarOCR', {
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
      parametrosReporte: { tp_imagen: 'CC', imagen },
    }),

  processOcr: (cdImagen) =>
    apiClient.post('/ocr.extraerDatos', base({ tpSolicitud: 'CC', cdImagen })),
};

export default VehicleService;
