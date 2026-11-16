import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import './Button.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconEnd?: IconName;
  block?: boolean;
  children?: ReactNode;
}

export function Button({ variant = 'gold', size = 'md', icon, iconEnd, block, className = '', children, ...rest }: Props) {
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 15 : 18;
  return (
    <button className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children && <span className="btn__label">{children}</span>}
      {iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </button>
  );
}
