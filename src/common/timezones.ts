// List time zones using the browser's IANA database instead of a bundled
// list that would become stale. Labels include the current offset for search.
export interface TimezoneOption {
    value: string;
    label: string;
    label_children: string[];
}

const fallbackZones = [
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Europe/London",
    "Europe/Berlin", "America/New_York", "America/Los_Angeles",
];

export function timezoneOptions(): TimezoneOption[] {
    const iana = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zones = new Set(["UTC", local, ...(iana.supportedValuesOf?.("timeZone") ?? fallbackZones)].filter(Boolean));
    return [...zones].sort().map(zone => {
        let offset = "";
        try {
            const name = new Intl.DateTimeFormat("en", {
                timeZone: zone,
                timeZoneName: "shortOffset",
            }).formatToParts(new Date()).find(part => part.type === "timeZoneName")?.value ?? "";
            const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(name);
            offset = match ? `UTC${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}` : "UTC+00:00";
        } catch {
            // The server also checks zone availability.
        }
        return { value: zone, label: zone, label_children: offset ? [offset] : [] };
    });
}

export function isValidTimezone(name: string): boolean {
    if (!name) return true;
    try {
        new Intl.DateTimeFormat("en", { timeZone: name });
        return true;
    } catch {
        return false;
    }
}
