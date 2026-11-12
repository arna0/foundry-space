import React, { useState, type ComponentProps } from 'react';

export const Surface = ({
  inset = false,
  className = '',
  ...props
}: ComponentProps<'div'> & { inset?: boolean }) => (
  <div
    className={`min-w-0 rounded-card text-foreground ${
      inset ? 'bg-background' : 'bg-surface shadow-surface'
    } ${className}`}
    {...props}
  />
);

const buttonTones = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110',
  quiet: 'border border-border/55 bg-surface text-foreground hover:border-foreground',
  ghost: 'bg-transparent text-foreground hover:bg-foreground/5',
  inverse: 'bg-surface text-foreground hover:brightness-95',
};

export const Button = ({
  tone = 'primary',
  type = 'button',
  className = '',
  ...props
}: ComponentProps<'button'> & { tone?: keyof typeof buttonTones }) => (
  <button
    type={type}
    className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-label font-medium transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${buttonTones[tone]} ${className}`}
    {...props}
  />
);

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ id, label, error, hint, children, className = '' }: FieldProps) => (
  <div className={`min-w-0 flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={id} className="text-label font-medium text-foreground">
      {label}
    </label>
    {children}
    {hint && !error ? <p className="text-caption text-muted">{hint}</p> : null}
    {error ? (
      <p role="alert" className="text-caption font-medium text-danger">
        {error}
      </p>
    ) : null}
  </div>
);

export const Input = ({ className = '', ...props }: ComponentProps<'input'>) => (
  <input
    className={`min-h-11 w-full min-w-0 rounded-control border border-border/60 bg-surface px-3.5 text-body text-foreground placeholder:text-muted/75 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Select = ({ className = '', ...props }: ComponentProps<'select'>) => (
  <select
    className={`min-h-11 w-full min-w-0 rounded-control border border-border/60 bg-surface px-3.5 text-body text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Textarea = ({ className = '', ...props }: ComponentProps<'textarea'>) => (
  <textarea
    className={`min-h-28 w-full min-w-0 rounded-control border border-border/60 bg-surface p-3.5 text-body text-foreground placeholder:text-muted/75 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface ArchivalImageProps {
  src?: string;
  alt: string;
  fallbackTitle: string;
  fallbackMeta?: string;
  aspectClass?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  className?: string;
}

export const ArchivalImage = ({
  src,
  alt,
  fallbackTitle,
  fallbackMeta,
  aspectClass = 'aspect-[3/4]',
  width = 900,
  height = 1200,
  eager = false,
  className = '',
}: ArchivalImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col justify-between bg-background p-6 text-foreground ${aspectClass} ${className}`}
      >
        <span className="text-caption text-muted">{fallbackMeta ?? 'Archival plate'}</span>
        <p className="font-display text-heading text-foreground">{fallbackTitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${aspectClass} ${className}`}
    />
  );
};
