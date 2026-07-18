import { forwardRef, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import { formatBytes } from "./format";

export type ChartTooltipHandle = {
    show: (payload: {
        left: number;
        top: number;
        label: string;
        upload: number;
        download: number;
    }) => void;
    hide: () => void;
};

export const Tooltip = forwardRef<ChartTooltipHandle>(function Tooltip(_, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const uploadRef = useRef<HTMLSpanElement>(null);
    const downloadRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(ref, () => ({
        show({ left, top, label, upload, download }) {
            const root = rootRef.current;
            if (!root) return;
            root.style.display = "block";
            root.style.left = `${left}px`;
            root.style.top = `${top}px`;
            if (labelRef.current) labelRef.current.textContent = label;
            if (uploadRef.current) uploadRef.current.textContent = `${formatBytes(upload, 2, " ")}/S`;
            if (downloadRef.current) downloadRef.current.textContent = `${formatBytes(download, 2, " ")}/S`;
        },
        hide() {
            if (rootRef.current) rootRef.current.style.display = "none";
        },
    }), []);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={rootRef}
            className="fixed pointer-events-none hidden rounded bg-ui-heading p-2 text-xs text-ui-bg shadow-md w-[176px] z-[2147483646]"
            style={{ left: 0, top: 0 }}
        >
            <div ref={labelRef} className="mb-1 font-semibold text-ui-bg/95" />
            <div className="mb-0.5 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ui-success" />
                <span className="text-ui-bg/70">Upload:</span>
                <span ref={uploadRef} className="font-medium" />
            </div>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ui-info" />
                <span className="text-ui-bg/70">Download:</span>
                <span ref={downloadRef} className="font-medium" />
            </div>
        </div>,
        document.body
    );
});
