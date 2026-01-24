import { clsx } from "clsx";
import * as React from "react";
import styles from "./inputgroup.module.css";

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.group, className)} {...props} />
));
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.text, className)} {...props} />
));
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupText };
