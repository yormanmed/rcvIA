import { apiClient } from './api.service';
import CONFIG from './config.service';

const PaymentService = {
  async getPaymentMethods() {
    return apiClient.get('/metodos-pago');
  },

  async getBanks() {
    return apiClient.post('/data.rcv', {
      data:    'GEOBancosNacionales',
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
    });
  },

  async getPrefijosMoviles() {
    return apiClient.post('/data.rcv', {
      data:    'GEOAPrefijosMoviles',
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
    });
  },

  async validarPagoMovil(transaccion) {
    return apiClient.post('/validacion.pagomovil', {
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
      transaccion,
    });
  },

  async solicitudDebitoInmediato({ banco, monto, telefono, cedula }) {
    return apiClient.post('/debitoinmediato/solicitud', {
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
      banco,
      monto,
      telefono,
      cedula,
    });
  },

  async confirmacionDebitoInmediato({ banco, monto, telefono, cedula, otp }) {
    return apiClient.post('/debitoinmediato/confirmacion', {
      entidad:  CONFIG.ENTITY_CLIENT,
      token:    CONFIG.TOKEN,
      banco,
      monto,
      telefono,
      cedula,
      otp,
      concepto: 'DEB-INM SELAFE',
      nombre:   'Selafe',
    });
  },

  async getExchangeRate() {
    return apiClient.get('/tasa-cambio');
  },

  async processPayment(data) {
    return apiClient.post('/pagos', data);
  },

  async verifyPayment(id) {
    return apiClient.get(`/pagos/${id}/verificar`);
  },
};

export default PaymentService;
