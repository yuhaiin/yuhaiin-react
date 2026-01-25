'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import * as React from 'react';
import styles from './switch.module.css';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const transition = {
  type: "spring" as const, // Fix: Cast to const so it's "spring" not string
  stiffness: 700,
  damping: 30
};

const SwitchComponent: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, description, disabled }) => (
  <div className={clsx(styles.container, disabled && styles.disabled)}>
    {label && (
      <div className={styles.labelContainer}>
        <span className="fw-medium">{label}</span>
        {description && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</small>}
      </div>
    )}
    <SwitchPrimitive.Root className={styles.root} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}>
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          className={styles.thumb}
          layout
          transition={transition}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  </div>
);

export default SwitchComponent;

export const SwitchCard: React.FC<SwitchProps & { className?: string }> = ({ label, description, checked, onCheckedChange, className, disabled }) => {
  return (
    <div
      className={clsx(styles.listItem, "justify-content-between", className, disabled && styles.disabled)}
      onClick={() => !disabled && onCheckedChange(!checked)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onCheckedChange(!checked); }}
    >
      <div className="d-flex flex-column">
        <span className="fw-medium">{label}</span>
        {description && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</small>}
      </div>
      <SwitchPrimitive.Root className={styles.root} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}>
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            className={styles.thumb}
            layout
            transition={transition}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    </div>
  );
};


interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

const Switch = ({ className, label, id, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { label?: string }) => {
  // Generate a unique ID to associate the Label (if id is not passed from outside)
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <div className={clsx(styles.wrapper, className)}>
      <SwitchPrimitive.Root
        id={switchId}
        className={styles.root}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            className={styles.thumb}
            layout
            transition={transition}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>

      {label && (
        <label className={styles.label} htmlFor={switchId}>
          {label}
        </label>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

export { Switch };
