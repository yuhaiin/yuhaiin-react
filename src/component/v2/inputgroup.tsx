import { clsx } from "clsx";
import * as React from "react";
import styles from "./inputgroup.module.css";

const InputGroupContext = React.createContext<{}>({});

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {

    // We need to clone children to pass index/position?
    // Actually, context is better if we want to avoid cloning, but children need to know their position.
    // CSS-only approach using :first-child etc is standard, but the issue is *child components* (like Select)
    // have inner elements with border-radius.

    // The user suggested: "Modify the FormSelect / Input components to accept a 'group position' prop".
    // This implies we should pass this prop manually or automatically.
    // To do it automatically, we can map children.

    const count = React.Children.count(children);
    const childrenWithProps = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
            let position = "middle";
            if (index === 0) position = "first";
            if (index === count - 1) position = "last";
            if (count === 1) position = "single";

            // We pass a special prop or context?
            // The prompt says "Modify... to accept a 'group position' prop... automatically change style".
            // So we clone and pass `groupPosition`.
            // Note: Custom components like FormSelect need to accept this prop. Native elements (div, button) won't care unless we wrap or use context.
            // But FormSelect/Input are the main concern.
            return React.cloneElement(child as React.ReactElement<any>, { groupPosition: position });
        }
        return child;
    });

    return (
        <div ref={ref} className={clsx(styles.group, className)} {...props}>
            {childrenWithProps}
        </div>
    );
});
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { groupPosition?: string }
>(({ className, groupPosition, ...props }, ref) => {
    // InputGroupText is simple, usually just needs to respect CSS :first-child etc.
    // But if we want to be explicit:
    // Actually, InputGroupText in `inputgroup.module.css` already handles standard borders.
    // Let's just pass through for now or apply specific classes if needed.

    // Logic for radius based on position:
    const radiusClass =
        groupPosition === 'first' ? 'rounded-r-none border-r-0' :
        groupPosition === 'last' ? 'rounded-l-none' :
        groupPosition === 'middle' ? 'rounded-none border-r-0' :
        ''; // single -> keep default radius

    return <div ref={ref} className={clsx(styles.text, radiusClass, className)} {...props} />
});
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupText };
