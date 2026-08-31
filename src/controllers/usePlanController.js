import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PolicyService from '../services/policy.service';

const DEFAULT_PLANS = [
  {
    id: 1,
    name: 'RCV Anual',
    price: 33.0,
    currency: '€',
    period: 'Anual',
    features: ['Protección por daño a terceros', 'Protección por daño a cosas'],
  },
];

const usePlanController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state || {};
  const { vehicleData, personalData } = previousState;

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await PolicyService.getCotizacion({
          cd_clase: vehicleData?.clase,
          cd_uso:   vehicleData?.uso,
        });
        const items = res?.responseData ?? [];  
        const prima       = items.reduce((acc, it) => acc + (Number(it.prima.replaceAll(',','.')) || 0), 0);
        const primaPlanBs = items.reduce((acc, it) => acc + (Number(it.prima_plan_bs.replaceAll(',','.')) || 0), 0);
        /*if(data){
          data.forEach(element => {
              console.log(element);
              
          });
        }*/
        //const primaBs = Number(data?.prima_bs ?? DEFAULT_PLANS[0].price);
        const plansWithPrice = DEFAULT_PLANS.map((p) => ({ ...p, price: prima }));
        setPlans(plansWithPrice);
        setSelectedPlan(plansWithPrice[0]);
      } catch (err) {
        console.error('[Plan] getCotizacion failed', err);
        setPlans(DEFAULT_PLANS);
        setSelectedPlan(DEFAULT_PLANS[0]);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    navigate('/payment-method', { state: { ...previousState, selectedPlan } });
  };

  const handleBack = () => navigate('/personal');

  return {
    plans,
    selectedPlan,
    loading,
    handleSelectPlan,
    handleContinue,
    handleBack,
  };
};

export default usePlanController;
