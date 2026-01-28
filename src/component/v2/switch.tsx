'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const transition = {
  type: "spring" as const,
  stiffness: 700,
  damping: 30
};

const SwitchComponent: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, description, disabled }) => (
  <div className={clsx("flex items-center justify-between", disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
    {label && (
      <div className="flex flex-col mr-4">
        <span className="font-medium">{label}</span>
        {description && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</small>}
      </div>
    )}
    <SwitchPrimitive.Root
        className={clsx(
            "w-[42px] h-[25px] bg-[var(--bs-secondary-bg)] rounded-full relative shadow-[inset_0_0.125rem_0.25rem_rgba(0,0,0,0.075)] flex items-center p-[2px] border border-sidebar-border cursor-pointer transition-colors duration-150 ease-in-out data-[state=checked]:bg-primary data-[state=checked]:justify-end disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm will-change-transform"
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
      className={clsx(
          "flex items-center cursor-pointer px-6 py-5 rounded-[12px] bg-tertiary-bg border border-sidebar-border transition-all duration-200 mb-2 hover:bg-sidebar-hover hover:border-sidebar-active hover:-translate-y-[2px] justify-between",
          className,
          disabled && "opacity-60 pointer-events-none grayscale-[0.5]"
        )}
      onClick={() => !disabled && onCheckedChange(!checked)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onCheckedChange(!checked); }}
    >
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</small>}
      </div>
      <SwitchPrimitive.Root
        className={clsx(
            "w-[42px] h-[25px] bg-[var(--bs-secondary-bg)] rounded-full relative shadow-[inset_0_0.125rem_0.25rem_rgba(0,0,0,0.075)] flex items-center p-[2px] border border-sidebar-border cursor-pointer transition-colors duration-150 ease-in-out data-[state=checked]:bg-primary data-[state=checked]:justify-end disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm will-change-transform"
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
    <div className={clsx("flex items-center gap-2 cursor-pointer", className)}>
      <SwitchPrimitive.Root
        id={switchId}
        className={clsx(
            "w-[42px] h-[25px] bg-[var(--bs-secondary-bg)] rounded-full relative shadow-[inset_0_0.125rem_0.25rem_rgba(0,0,0,0.075)] flex items-center p-[2px] border border-sidebar-border cursor-pointer transition-colors duration-150 ease-in-out data-[state=checked]:bg-primary data-[state=checked]:justify-end disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm will-change-transform"
            layout
            transition={transition}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>

      {label && (
        <label className="text-base text-body-color leading-[1.5] cursor-pointer select-none" htmlFor={switchId}>
          {label}
        </label>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

export { Switch };
