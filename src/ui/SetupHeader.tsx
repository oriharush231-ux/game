import { he } from '../i18n/he';
import { SETUP_FLOW, type ScreenId } from '../store/gameStore';
import { Button } from './Button';
import { Wordmark } from './Brand';
import { Icon } from './Icon';
import './SetupHeader.css';

/** Header for the new-game flow: brand, back button and progress stepper. */
export function SetupHeader({ current, onBack }: { current: ScreenId; onBack: () => void }) {
  const index = SETUP_FLOW.indexOf(current);
  return (
    <header className="setup-header">
      <Button variant="ghost" size="sm" icon="arrow-back" onClick={onBack}>
        חזרה
      </Button>
      <ol className="stepper" aria-label="שלבי יצירת משחק">
        {SETUP_FLOW.map((s, i) => (
          <li key={s} className={`stepper__step ${i < index ? 'is-done' : ''} ${i === index ? 'is-current' : ''}`} aria-current={i === index ? 'step' : undefined}>
            <span className="stepper__dot">{i < index ? <Icon name="check" size={12} strokeWidth={2.4} /> : i + 1}</span>
            <span className="stepper__label">{he.steps[s as keyof typeof he.steps]}</span>
          </li>
        ))}
      </ol>
      <div className="setup-header__brand">
        <Wordmark compact />
      </div>
    </header>
  );
}
