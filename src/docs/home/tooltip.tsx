import { useTranslation } from 'react-i18next';
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
    const { t: uiT } = useTranslation('ui');

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
            if (uploadRef.current) uploadRef.current.textContent = `${formatBytes(upload, 1, " ")}/s`;
            if (downloadRef.current) downloadRef.current.textContent = `${formatBytes(download, 1, " ")}/s`;
        },
        hide() {
            if (rootRef.current) rootRef.current.style.display = "none";
        },
    }), []);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={rootRef}
            className="fixed pointer-events-none hidden w-[208px] whitespace-nowrap rounded-ui-md border border-ui-border bg-ui-surface-raised px-3 py-2 text-xs text-ui-fg shadow-lg z-[2147483646]"
            style={{ left: 0, top: 0 }}
        >
            <div ref={labelRef} className="mb-1.5 tabular-nums text-ui-muted" />
            <div className="mb-1 flex items-center gap-2">
                <span className="h-0.5 w-3 shrink-0 rounded-full bg-ui-info" aria-hidden />
                <span className="text-ui-muted">{uiT("download")}</span>
                <span ref={downloadRef} className="ml-auto font-medium tabular-nums text-ui-heading" />
            </div>
            <div className="flex items-center gap-2">
                <span className="h-0.5 w-3 shrink-0 rounded-full bg-ui-success" aria-hidden />
                <span className="text-ui-muted">{uiT("upload")}</span>
                <span ref={uploadRef} className="ml-auto font-medium tabular-nums text-ui-heading" />
            </div>
        </div>,
        document.body
    );
});
