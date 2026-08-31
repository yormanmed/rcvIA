import { Fragment } from 'react';
import './Stepper.css';

function Stepper({ steps = 3, currentStep = 1 }) {
  return (
    <div className="stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemax={steps}>
      {Array.from({ length: steps }, (_, i) => i + 1).map((step, idx) => {
        const isActive    = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <Fragment key={step}>
            {idx > 0 && <div className="stepper__line" />}
            <div className={[
              'stepper__step',
              isActive    && 'stepper__step--active',
              isCompleted && 'stepper__step--completed',
            ].filter(Boolean).join(' ')}>
              <div className="stepper__halo">
                <div className="stepper__circle">
                  <div className="stepper__inner" />
                </div>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
