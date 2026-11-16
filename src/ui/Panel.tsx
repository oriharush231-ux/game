import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import './Panel.css';

export function Panel({
  title,
  icon,
  action,
  children,
  className = '',
  style,
  padded = true,
}: {
  title?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padded?: boolean;
}) {
  return (
    <section className={`panel ${padded ? 'panel--padded' : ''} ${className}`} style={style}>
      {(title || action) && (
        <header className="panel__head">
          <h3 className="panel__title">
            {icon && <Icon name={icon} size={16} className="panel__icon" />}
            {title}
          </h3>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Horizontal meter 0–100 with label and value. */
export function Meter({ label, value, tone = 'gold', suffix = '', delta }: { label: string; value: number; tone?: 'gold' | 'blue' | 'green' | 'red'; suffix?: string; delta?: number }) {
  return (
    <div className="meter">
      <div className="meter__row">
        <span className="meter__label">{label}</span>
        <span className="meter__value num">
          {delta !== undefined && delta !== 0 && <span className={`delta ${delta > 0 ? 'delta--up' : 'delta--down'}`}>{delta > 0 ? '▲' : '▼'}</span>}
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div className="meter__track">
        <div className={`meter__fill meter__fill--${tone}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

/** Tiny line chart. Values are normalised to their own range. */
export function Sparkline({ values, width = 120, height = 34, tone = 'gold' }: { values: number[]; width?: number; height?: number; tone?: 'gold' | 'green' | 'red' | 'blue' }) {
  if (values.length < 2) values = [values[0] ?? 0, values[0] ?? 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 3 - ((v - min) / span) * (height - 6)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const area = `${line}L${width} ${height}L0 ${height}Z`;
  const last = pts[pts.length - 1];
  return (
    <svg className={`sparkline sparkline--${tone}`} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path className="sparkline__area" d={area} />
      <path className="sparkline__line" d={line} vectorEffect="non-scaling-stroke" />
      <circle className="sparkline__dot" cx={last[0]} cy={last[1]} r="2.2" />
    </svg>
  );
}

export function Chip({ children, tone = 'default', icon }: { children: ReactNode; tone?: 'default' | 'gold' | 'success' | 'danger' | 'info'; icon?: IconName }) {
  return (
    <span className={`chip chip--${tone}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
