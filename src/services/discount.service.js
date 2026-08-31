import { apiClient } from './api.service';
import CONFIG from './config.service';

const DiscountService = {
  async validarCodigo(cd_otp) {
    return apiClient.post('/data.app', {
      data:    'CODValidaOtp',
      cd_otp:  String(cd_otp),
      entidad: CONFIG.ENTITY_CLIENT,
      token:   CONFIG.TOKEN,
    });
  },
};

export default DiscountService;
