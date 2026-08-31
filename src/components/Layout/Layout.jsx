import { useNavigate } from 'react-router-dom';
import logoSvg from '../../assets/logo.svg';
import fondoSvg from '../../assets/fondo.svg';
import './Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (window.confirm('¿Estás seguro de que deseas salir?')) {
      navigate('/');
    }
  };

  return (
    <div className="layout">
      <img className="layout__bg" src={fondoSvg} alt="" aria-hidden="true" />

      <header className="layout__header">
        <button className="layout__logo" onClick={() => navigate('/')}>
          <img src={logoSvg} alt="La Fe Seguros" height="40" />
        </button>

        <button className="layout__exit-btn" onClick={handleExit}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M12 1L1 12M1 1L12 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Salir
        </button>
      </header>

      <main className="layout__main">{children}</main>

      <button className="layout__help-btn" title="Ayuda">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 7C7 5.895 7.895 5 9 5C10.105 5 11 5.895 11 7C11 8 10.333 8.667 9.667 9C9.333 9.167 9 9.5 9 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="9" cy="13" r="0.8" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default Layout;
