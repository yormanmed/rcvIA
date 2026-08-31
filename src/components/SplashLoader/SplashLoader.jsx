import { useEffect, useState } from 'react';
import logoSvg from '../../assets/logo.svg';
import './SplashLoader.css';

const DEFAULT_STEPS = ['Verificando datos', 'Asegurando conexión', 'Casi listo'];

function SplashLoader({
  title = 'Cargando',
  subtitle = 'Esto solo tomará unos segundos.',
  steps = DEFAULT_STEPS,
  fullscreen = false,
}) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % steps.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [steps]);

  return (
    <div
      className={`splash-loader ${fullscreen ? 'splash-loader--fullscreen' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="splash-loader__halo" aria-hidden="true" />
      <span className="splash-loader__grain" aria-hidden="true" />

      <div className="splash-loader__orbit">
        <svg
          className="splash-loader__ring splash-loader__ring--outer"
          viewBox="0 0 160 160"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sl-ring-outer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3D1F8F" stopOpacity="0" />
              <stop offset="45%" stopColor="#9B7AD4" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3D1F8F" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r="74"
            stroke="url(#sl-ring-outer)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="5 13"
          />
        </svg>

        <svg
          className="splash-loader__ring splash-loader__ring--mid"
          viewBox="0 0 130 130"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sl-ring-mid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9B7AD4" stopOpacity="0" />
              <stop offset="100%" stopColor="#3D1F8F" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="65"
            cy="65"
            r="60"
            stroke="url(#sl-ring-mid)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="115 380"
          />
        </svg>

        <svg
          className="splash-loader__ring splash-loader__ring--inner"
          viewBox="0 0 110 110"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="55"
            cy="55"
            r="50"
            stroke="rgba(155, 122, 212, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="2 4"
          />
        </svg>

        <div className="splash-loader__crest">
          <div className="splash-loader__crest-inner">
            <img src={logoSvg} alt="" />
          </div>
        </div>

        <span className="splash-loader__sparkle splash-loader__sparkle--1" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 0L8 6L14 7L8 8L7 14L6 8L0 7L6 6L7 0Z"
              fill="#9B7AD4"
            />
          </svg>
        </span>
        <span className="splash-loader__sparkle splash-loader__sparkle--2" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 0L5.7 4.3L10 5L5.7 5.7L5 10L4.3 5.7L0 5L4.3 4.3L5 0Z"
              fill="#3D1F8F"
            />
          </svg>
        </span>
        <span className="splash-loader__sparkle splash-loader__sparkle--3" aria-hidden="true">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M4 0L4.6 3.4L8 4L4.6 4.6L4 8L3.4 4.6L0 4L3.4 3.4L4 0Z"
              fill="#6B4EAA"
            />
          </svg>
        </span>
        <span className="splash-loader__sparkle splash-loader__sparkle--4" aria-hidden="true">
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            <path
              d="M3.5 0L4 3L7 3.5L4 4L3.5 7L3 4L0 3.5L3 3L3.5 0Z"
              fill="#8B73E1"
            />
          </svg>
        </span>
      </div>

      <div className="splash-loader__copy">
        <h2 className="splash-loader__title">
          {title}
          <span className="splash-loader__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </h2>
        <p className="splash-loader__subtitle">{subtitle}</p>
      </div>

      <div className="splash-loader__progress" aria-hidden="true">
        <span className="splash-loader__progress-bar" />
      </div>

      {steps && steps.length > 0 && (
        <p className="splash-loader__step" key={stepIdx}>
          <span className="splash-loader__step-dot" />
          <span>{steps[stepIdx]}</span>
        </p>
      )}
    </div>
  );
}

export default SplashLoader;
