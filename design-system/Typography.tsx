import React from 'react';

/**
 * Heading Component
 * Automatische Typografie-Hierarchie mit konsistentem Spacing
 */

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const headingStyles: Record<HeadingLevel, string> = {
  1: 'text-5xl font-bold leading-tight tracking-tight text-neutral-900 mb-6',
  2: 'text-4xl font-bold leading-tight tracking-tight text-neutral-900 mb-5',
  3: 'text-3xl font-semibold leading-snug text-neutral-800 mb-4',
  4: 'text-2xl font-semibold leading-snug text-neutral-800 mb-3',
  5: 'text-xl font-semibold leading-normal text-neutral-800 mb-3',
  6: 'text-lg font-semibold leading-normal text-neutral-700 mb-2',
};

export const Heading: React.FC<HeadingProps> = ({ 
  level = 2, 
  children, 
  className = '',
  as 
}) => {
  const Tag = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  const styles = headingStyles[level];
  
  return (
    <Tag className={`${styles} ${className}`}>
      {children}
    </Tag>
  );
};

/**
 * Text Component
 * Flexible Text-Komponente mit Varianten
 */

type TextVariant = 'body' | 'body-large' | 'small' | 'label' | 'meta';
type TextColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'label';
}

const textVariantStyles: Record<TextVariant, string> = {
  'body': 'text-base font-normal leading-relaxed',
  'body-large': 'text-lg font-normal leading-relaxed',
  'small': 'text-sm font-normal leading-normal tracking-wide',
  'label': 'text-sm font-medium leading-normal tracking-wide',
  'meta': 'text-xs font-medium leading-normal tracking-wider uppercase',
};

const textColorStyles: Record<TextColor, string> = {
  'primary': 'text-neutral-900',
  'secondary': 'text-neutral-700',
  'muted': 'text-neutral-500',
  'success': 'text-success-600',
  'warning': 'text-warning-600',
  'error': 'text-error-600',
};

export const Text: React.FC<TextProps> = ({ 
  variant = 'body',
  color = 'primary',
  children, 
  className = '',
  as = 'p'
}) => {
  const Tag = as;
  const variantStyles = textVariantStyles[variant];
  const colorStyles = textColorStyles[color];
  
  return (
    <Tag className={`${variantStyles} ${colorStyles} ${className}`}>
      {children}
    </Tag>
  );
};

/**
 * Display Text Component
 * Für große, aufmerksamkeitsstarke Überschriften
 */

interface DisplayProps {
  children: React.ReactNode;
  className?: string;
}

export const Display: React.FC<DisplayProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-6xl font-bold leading-none tracking-tighter text-neutral-900 mb-6 ${className}`}>
      {children}
    </h1>
  );
};

/**
 * Lead Text Component
 * Für einleitende, hervorgehobene Absätze
 */

export const Lead: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-xl font-normal leading-relaxed text-neutral-600 mb-6 ${className}`}>
      {children}
    </p>
  );
};

/**
 * Caption Component
 * Für Bildunterschriften und Nebentexte
 */

export const Caption: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm font-normal leading-normal text-neutral-500 ${className}`}>
      {children}
    </p>
  );
};
