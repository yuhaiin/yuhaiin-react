'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import * as React from 'react';
import { ui } from './styles';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const switchTrackClass = clsx(ui.switchTrack, ui.focusRing);

const SwitchComponent: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, description, disabled }) => {
  const isChecked = Boolean(checked);

  return (
    <div className={clsx("flex items-center justify-between", disabled && "opacity-60 pointer-events-none")}>
      {label && (
        <div className="mr-4">
          <div className="font-medium leading-tight">{label}</div>
          {description && <div className="text-ui-muted text-xs mt-0.5">{description}</div>}
        </div>
      )}
      <SwitchPrimitive.Root
        className={switchTrackClass}
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      >
        <SwitchPrimitive.Thumb className={ui.switchThumb} />
      </SwitchPrimitive.Root>
    </div>
  );
};

export default SwitchComponent;

export const SwitchCard: React.FC<SwitchProps & { className?: string }> = ({ label, description, checked, onCheckedChange, className, disabled }) => {
  const isChecked = Boolean(checked);

  return (
    <div
      className={clsx(
        "flex items-center cursor-pointer px-3 py-3 rounded-ui-md bg-ui-surface-muted border border-ui-border transition-all duration-200 mb-2 hover:bg-ui-hover hover:border-ui-primary/40 hover:-translate-y-[2px]",
        "justify-between",
        className,
        disabled && "opacity-60 pointer-events-none"
      )}
      onClick={() => !disabled && onCheckedChange(!isChecked)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onCheckedChange(!isChecked); }}
    >
      <div className="mr-4">
        <div className="font-medium leading-tight">{label}</div>
        {description && <div className="text-ui-muted text-xs mt-0.5">{description}</div>}
      </div>
      <SwitchPrimitive.Root
        className={switchTrackClass}
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      >
        <SwitchPrimitive.Thumb className={ui.switchThumb} />
      </SwitchPrimitive.Root>
    </div>
  );
};


const Switch = ({ className, label, id, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { label?: string }) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const switchProps = {
    ...props,
    ...("checked" in props ? { checked: Boolean(props.checked) } : {}),
  };

  return (
    <div className={clsx("flex items-center gap-2 cursor-pointer", className)}>
      <SwitchPrimitive.Root
        id={switchId}
        className={switchTrackClass}
        {...switchProps}
      >
        <SwitchPrimitive.Thumb className={ui.switchThumb} />
      </SwitchPrimitive.Root>

      {label && (
        <label className="text-base text-ui-fg leading-[1.5] cursor-pointer select-none" htmlFor={switchId}>
          {label}
        </label>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

export { Switch };
