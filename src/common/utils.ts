
export function mapSetting<T>(set: (f: (t: T | undefined) => T | undefined, revalidate?: boolean) => void) {
    return function (f: (t: T) => T, revalidate?: boolean) {
        set((t) => {
            if (t === undefined) {
                return undefined
            }
            return f(t)
        }, revalidate)
    }
}

export function updateIfPresent<T>(t: T | undefined, f: (t: T) => T): T | undefined {
    if (t === undefined) return undefined
    return f(t)
}
