"use client";

import { Info, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, type ElementType } from "react";

type HintLink = { label: string; href: string };

export function HintPopover({
    icon: Icon = Info,
    title,
    description,
    links = [],
}: {
    icon?: ElementType;
    title: string;
    description: string;
    links?: HintLink[];
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const width = Math.min(340, window.innerWidth - 32);
        setPosition({
            top: rect.bottom + 8,
            left: Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16)),
        });
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="ui-hint-trigger"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen((value) => !value)}
            >
                <Icon size={15} aria-hidden="true" />
                <span>页面说明</span>
            </button>
            {open && createPortal(
                <div
                    ref={popoverRef}
                    className="ui-hint-popover"
                    role="dialog"
                    aria-label={title}
                    style={{ top: position.top, left: position.left }}
                >
                    <div className="ui-hint-popover-header">
                        <div className="ui-hint-popover-title"><Info size={15} aria-hidden="true" />{title}</div>
                        <button type="button" className="ui-hint-popover-close" aria-label="关闭说明" onClick={() => setOpen(false)}>
                            <X size={15} />
                        </button>
                    </div>
                    <p>{description}</p>
                    {links.length > 0 && (
                        <nav className="ui-hint-popover-links" aria-label="相关页面">
                            {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
                        </nav>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
}
