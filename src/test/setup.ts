const values = new Map<string, string>();

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const storage: Storage = {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key) { return values.get(key) ?? null; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    removeItem(key) { values.delete(key); },
    setItem(key, value) { values.set(key, String(value)); },
};

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });

// jsdom has no scrolling implementation; keyboard navigation still updates selection.
if (!HTMLElement.prototype.scrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
        configurable: true,
        value: () => {},
    });
}

// Radix form controls measure themselves; jsdom has no layout to observe.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
