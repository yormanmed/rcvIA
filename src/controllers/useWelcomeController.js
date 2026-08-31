import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useWelcomeController = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.removeItem('quoteVehicle');
    localStorage.removeItem('quoteScanVehicle');
    localStorage.removeItem('quoteVehicleTab');
    localStorage.removeItem('quoteScanDone');
    localStorage.removeItem('quoteVehicleLabels');
    localStorage.removeItem('quotePersonal');
    localStorage.removeItem('quotePersonalTab');
    localStorage.removeItem('quotePersonalScanDone');
    navigate('/vehicle');
  };


  return { handleContinue };
};

export default useWelcomeController;
