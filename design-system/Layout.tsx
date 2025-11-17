import React from 'react';

/**
 * Stack Component
 * Verwaltet vertikales Spacing zwischen Kindelementen
 */

type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface StackProps {
  spacing?: StackSpacing;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

const stackSpacingStyles: Record<StackSpacing, string> = {
  'none': 'space-y-0',
  'xs': 'space-y-2',    // 8px
  'sm': 'space-y-4',    // 16px
  'md': 'space-y-6',    // 24px
  'lg': 'space-y-8',    // 32px
  'xl': 'space-y-12',   // 48px
  '2xl': 'space-y-16',  // 64px
};

export const Stack: React.FC<StackProps> = ({ 
  spacing = 'md', 
  children, 
  className = '',
  as = 'div'
}) => {
  const Tag = as;
  const spacingStyles = stackSpacingStyles[spacing];
  
  return (
    <Tag className={`${spacingStyles} ${className}`}>
      {children}
    </Tag>
  );
};

/**
 * Card Component
 * Basis-Container mit Schatten und Padding
 */

type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const cardVariantStyles: Record<CardVariant, string> = {
  'default': 'bg-white shadow-sm',
  'elevated': 'bg-white shadow-lg',
  'outlined': 'bg-white border border-neutral-200',
  'ghost': 'bg-neutral-50',
};

const cardPaddingStyles: Record<CardPadding, string> = {
  'none': 'p-0',
  'sm': 'p-4',
  'md': 'p-6',
  'lg': 'p-8',
};

export const Card: React.FC<CardProps> = ({ 
  variant = 'default',
  padding = 'md',
  children, 
  className = '',
  onClick
}) => {
  const variantStyles = cardVariantStyles[variant];
  const paddingStyles = cardPaddingStyles[padding];
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '';
  
  return (
    <div 
      className={`rounded-lg ${variantStyles} ${paddingStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * Section Component
 * Container für große Content-Bereiche mit konsistentem Padding
 */

type SectionSpacing = 'sm' | 'md' | 'lg';

interface SectionProps {
  spacing?: SectionSpacing;
  children: React.ReactNode;
  className?: string;
}

const sectionSpacingStyles: Record<SectionSpacing, string> = {
  'sm': 'py-8',     // 32px
  'md': 'py-12',    // 48px
  'lg': 'py-16',    // 64px
};

export const Section: React.FC<SectionProps> = ({ 
  spacing = 'md',
  children, 
  className = '' 
}) => {
  const spacingStyles = sectionSpacingStyles[spacing];
  
  return (
    <section className={`${spacingStyles} ${className}`}>
      {children}
    </section>
  );
};

/**
 * Container Component
 * Zentrierter Container mit max-width
 */

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  size?: ContainerSize;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const containerSizeStyles: Record<ContainerSize, string> = {
  'sm': 'max-w-2xl',      // 672px
  'md': 'max-w-4xl',      // 896px
  'lg': 'max-w-6xl',      // 1152px
  'xl': 'max-w-7xl',      // 1280px
  'full': 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({ 
  size = 'md',
  children, 
  className = '',
  padding = true
}) => {
  const sizeStyles = containerSizeStyles[size];
  const paddingStyles = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  
  return (
    <div className={`mx-auto w-full ${sizeStyles} ${paddingStyles} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid Component
 * Responsive Grid Layout
 */

type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GridProps {
  cols?: GridColumns;
  gap?: GridGap;
  children: React.ReactNode;
  className?: string;
}

const gridColsStyles: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
};

const gridGapStyles: Record<GridGap, string> = {
  'none': 'gap-0',
  'xs': 'gap-2',
  'sm': 'gap-4',
  'md': 'gap-6',
  'lg': 'gap-8',
  'xl': 'gap-12',
};

export const Grid: React.FC<GridProps> = ({ 
  cols = 3,
  gap = 'md',
  children, 
  className = '' 
}) => {
  const colsStyles = gridColsStyles[cols];
  const gapStyles = gridGapStyles[gap];
  
  return (
    <div className={`grid ${colsStyles} ${gapStyles} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Divider Component
 * Horizontale Trennlinie mit Spacing
 */

interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dividerSpacingStyles = {
  'sm': 'my-4',
  'md': 'my-6',
  'lg': 'my-8',
};

export const Divider: React.FC<DividerProps> = ({ 
  spacing = 'md',
  className = '' 
}) => {
  const spacingStyles = dividerSpacingStyles[spacing];
  
  return (
    <hr className={`border-neutral-200 ${spacingStyles} ${className}`} />
  );
};

/**
 * Box Component
 * Generischer Box-Container mit Padding
 */

type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BoxProps {
  padding?: BoxPadding;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

const boxPaddingStyles: Record<BoxPadding, string> = {
  'none': 'p-0',
  'xs': 'p-2',
  'sm': 'p-4',
  'md': 'p-6',
  'lg': 'p-8',
  'xl': 'p-12',
};

export const Box: React.FC<BoxProps> = ({ 
  padding = 'md',
  children, 
  className = '',
  as = 'div'
}) => {
  const Tag = as;
  const paddingStyles = boxPaddingStyles[padding];
  
  return (
    <Tag className={`${paddingStyles} ${className}`}>
      {children}
    </Tag>
  );
};
