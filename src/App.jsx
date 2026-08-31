import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Welcome from './views/Welcome/Welcome';
import Vehicle from './views/Vehicle/Vehicle';
import Personal from './views/Personal/Personal';
import Plan from './views/Plan/Plan';
import PaymentMethod from './views/PaymentMethod/PaymentMethod';
import PaymentForm from './views/PaymentForm/PaymentForm';
import DebitForm from './views/DebitForm/DebitForm';
import Success from './views/Success/Success';
import DescargaReporte from './views/DescargaReporte/DescargaReporte';
import Discount from './views/Discount/Discount';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/vehicle" element={<Vehicle />} />
      <Route path="/personal" element={<Personal />} />
      <Route path="/plan" element={<Plan />} />
      <Route path="/payment-method" element={<PaymentMethod />} />
      <Route path="/payment-form" element={<PaymentForm />} />
      <Route path="/debit-form" element={<DebitForm />} />
      <Route path="/success" element={<Success />} />
      <Route path="/discount" element={<Discount />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/descarga-reporte/:cd_area/:nu_poliza" element={<DescargaReporte />} />
      <Route path="*" element={<Layout><AppRoutes /></Layout>} />
    </Routes>
  );
}

export default App;
