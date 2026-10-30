
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import * as React from 'react';
import { ui } from './styles';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  description?: string;
  disabled?: boolean;
}

const switchTargetClass = clsx("group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-ui-md border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed", ui.focusRing);

const SwitchComponent: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, description, disabled, ariaLabel }) => {
  const isChecked = Boolean(checked);
  const id = React.useId();

  return (
    <div className={clsx("flex items-center justify-between", disabled && "text-ui-disabled-fg")}>
      {label && (
        <div className="mr-4">
          <label htmlFor={id} className="text-sm font-medium leading-tight cursor-pointer">{label}</label>
          {description && <div className="text-ui-muted text-xs mt-0.5">{description}</div>}
        </div>
      )}
      <SwitchPrimitive.Root
        id={id}
        aria-label={ariaLabel}
        className={switchTargetClass}
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      >
        <span data-switch-track aria-hidden="true" data-state={isChecked ? 'checked' : 'unchecked'} className={ui.switchTrack}>
          <SwitchPrimitive.Thumb className={ui.switchThumb} />
        </span>
      </SwitchPrimitive.Root>
    </div>
  );
};

export default SwitchComponent;

export const SwitchCard: React.FC<SwitchProps & { className?: string }> = ({ label, description, checked, onCheckedChange, className, disabled }) => {
  const isChecked = Boolean(checked);

  const labelId = React.useId();
  const descriptionId = React.useId();
  return (
    <SwitchPrimitive.Root
      checked={isChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={clsx(
        "group -mx-2 flex w-[calc(100%+1rem)] items-center justify-between min-h-11 cursor-pointer px-2 py-2 rounded-ui-md border-0 bg-transparent transition-colors duration-[var(--motion-fast)] text-left hover:bg-ui-hover/60",
        ui.focusRing, className, disabled && "text-ui-disabled-fg cursor-not-allowed"
      )}
    >
      <span className="mr-4">
        <span id={labelId} className="block text-sm font-medium leading-tight">{label}</span>
        {description && <span id={descriptionId} className="block text-ui-muted text-xs mt-0.5">{description}</span>}
      </span>
      <span data-switch-track aria-hidden="true" data-state={isChecked ? "checked" : "unchecked"} className={ui.switchTrack}>
        <SwitchPrimitive.Thumb className={ui.switchThumb} />
      </span>
    </SwitchPrimitive.Root>
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
        className={clsx("group", switchTargetClass)}
        {...switchProps}
      >
        <span data-switch-track aria-hidden="true" className={clsx(ui.switchTrack, 'group-data-[state=checked]:bg-ui-primary group-data-[state=checked]:border-ui-primary')}>
          <SwitchPrimitive.Thumb className={ui.switchThumb} />
        </span>
      </SwitchPrimitive.Root>

      {label && (
        <label className="text-sm text-ui-fg leading-[1.5] cursor-pointer select-none" htmlFor={switchId}>
          {label}
        </label>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

export { Switch };
