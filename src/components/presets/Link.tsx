import React from 'react';
import 'src/css/preset/Links.css';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  disabled?: boolean;
}

const Link: React.FC<LinkProps> = ({
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  const classes = [
    'link',
    disabled ? 'disabled' : '',
    className
  ].filter(Boolean).join(' ');

  if (disabled) {
    return <span className={classes} aria-disabled="true">{label}</span>;
  }

  return (
    <a className={classes} {...props}>
      {label}
    </a>
  );
};

export default Link;
