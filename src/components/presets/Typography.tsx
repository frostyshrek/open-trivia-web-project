import React from 'react';
import 'src/css/components/Typography.css';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

/** Headline 1 */
export const Headline1: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={`headline-1 ${className || ''}`.trim()}>{children}</div>
);

/** Headline 2 */
export const Headline2: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={`headline-2 ${className || ''}`.trim()}>{children}</div>
);

/** Headline 3 */
export const Headline3: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={`headline-3 ${className || ''}`.trim()}>{children}</div>
);

/** Subheading */
export const Subheading: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={`subheading ${className || ''}`.trim()}>{children}</div>
);

/** Body 1 */
export const Body1: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={`body-1 ${className || ''}`.trim()}>{children}</div>
);
