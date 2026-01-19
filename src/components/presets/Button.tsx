import React from 'react';
import 'src/css/components/Button.css';

type ButtonSize = 'normal' | 'medium' | 'small';
type FontSize = 'body' | 'subheading' | 'headline-1' | 'headline-2' | 'headline-3';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: ButtonSize;
  fontSize?: FontSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  size = 'normal',
  fontSize = 'body',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classNames = [
    'btn',
    size,
    fontSize,
    isDisabled ? 'disabled' : '',
    loading ? 'loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={isDisabled} {...props}>
      {iconLeft && <span className="icon-left">{iconLeft}</span>}
      <span>{label}</span>
      {iconRight && <span className="icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;
