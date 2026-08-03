import React, { Suspense } from 'react';

// The lazy component API needs to preserve arbitrary component prop types.
// oxlint-disable-next-line typescript/no-explicit-any
export default function dynamic<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options?: {
        suspense?: boolean;
        fallback?: React.ReactNode;
        ssr?: boolean;
        // oxlint-disable-next-line typescript/no-explicit-any
        loading?: React.ComponentType<any> | React.ReactNode
    }
) {
    const LazyComponent = React.lazy(importFunc);

    let fallback = options?.fallback || null;
    if (!fallback && options?.loading) {
        if (React.isValidElement(options.loading)) {
            fallback = options.loading;
        } else if (typeof options.loading === 'function') {
            // oxlint-disable-next-line typescript/no-explicit-any
            const LoadingComp = options.loading as React.ComponentType<any>;
            fallback = <LoadingComp />;
        }
    }

    const DynamicComponent = (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );

    return DynamicComponent;
}
