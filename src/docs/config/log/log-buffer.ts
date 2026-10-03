type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "FATAL" | "TRACE" | "LOG";

type ParsedLogLine = {
    time?: string;
    displayTime?: string;
    level: LogLevel;
    message: string;
    source?: string;
    details?: string;
}

export type LogEntry = {
    id: number;
    line: string;
    parsed: ParsedLogLine;
}

export const levelStyles: Record<LogLevel, { bar: string; badge: string; text: string }> = {
    ERROR: {
        bar: "bg-red-500",
        badge: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
        text: "text-red-700 dark:text-red-200",
    },
    FATAL: {
        bar: "bg-rose-600",
        badge: "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
        text: "text-rose-700 dark:text-rose-200",
    },
    WARN: {
        bar: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-200",
    },
    INFO: {
        bar: "bg-sky-500",
        badge: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
        text: "text-slate-800 dark:text-slate-100",
    },
    DEBUG: {
        bar: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
        text: "text-emerald-700 dark:text-emerald-200",
    },
    TRACE: {
        bar: "bg-violet-500",
        badge: "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
        text: "text-violet-700 dark:text-violet-200",
    },
    LOG: {
        bar: "bg-slate-300 dark:bg-slate-600",
        badge: "bg-slate-500/10 text-slate-600 ring-slate-500/15 dark:text-slate-300",
        text: "text-slate-800 dark:text-slate-100",
    },
};

const readSlogValue = (line: string, key: string): string | undefined => {
    const start = line.indexOf(`${key}=`);
    if (start < 0) return undefined;

    let i = start + key.length + 1;
    if (line[i] !== '"') {
        const end = line.indexOf(" ", i);
        return line.slice(i, end < 0 ? undefined : end);
    }

    i += 1;
    let value = "";
    for (; i < line.length; i++) {
        const char = line[i];
        if (char === "\\" && i + 1 < line.length) {
            value += line[i + 1];
            i += 1;
            continue;
        }
        if (char === '"') break;
        value += char;
    }
    return value;
}

const trimSlogFields = (line: string) => {
    return line
        .replace(/\btime=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\blevel=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\bsource=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\bmsg=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .trim();
}

const formatLogTime = (value?: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const time = date.toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return `${time}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

const parseLogLine = (line: string): ParsedLogLine => {
    const rawLevel = readSlogValue(line, "level")?.toUpperCase();
    const level = rawLevel && rawLevel in levelStyles ? rawLevel as LogLevel : "LOG";
    const message = readSlogValue(line, "msg") ?? line;
    const source = readSlogValue(line, "source");
    const time = readSlogValue(line, "time");
    const details = message === line ? undefined : trimSlogFields(line);

    return { time, displayTime: formatLogTime(time), level, message, source, details };
}

export class LogRingBuffer {
    private entries: LogEntry[]
    private head = 0
    private count = 0
    private version = 0
    private nextId = 0
    private retainedChars = 0

    constructor(private capacity: number) {
        this.entries = Array.from<LogEntry>({ length: capacity })
    }

    get size() {
        return this.count
    }

    get currentVersion() {
        return this.version
    }

    get(index: number) {
        if (index < 0 || index >= this.count) return undefined
        return this.entries[(this.head + index) % this.capacity]
    }

    append(values: string[]) {
        if (values.length === 0 || this.capacity <= 0) return this.version

        for (let i = Math.min(values.length, this.capacity) - 1; i >= 0; i--) {
            const line = values[i].length > 8192 ? values[i].slice(0, 8192) + " … [truncated]" : values[i]
            this.head = (this.head - 1 + this.capacity) % this.capacity
            if (this.count === this.capacity) this.retainedChars -= this.entries[this.head]?.line.length ?? 0;
            this.retainedChars += line.length;
            this.entries[this.head] = {
                id: ++this.nextId,
                line,
                parsed: parseLogLine(line),
            }
            if (this.count < this.capacity) this.count++
            while (this.retainedChars > 2 * 1024 * 1024 && this.count > 1) {
                const oldest = (this.head + this.count - 1) % this.capacity;
                this.retainedChars -= this.entries[oldest]?.line.length ?? 0;
                delete this.entries[oldest];
                this.count--;
            }
        }

        this.version++
        return this.version
    }

    setCapacity(capacity: number) {
        if (this.capacity === capacity) return this.version

        const keep = Math.min(this.count, capacity)
        const next = Array.from<LogEntry>({ length: capacity })
        for (let i = 0; i < keep; i++) {
            const entry = this.get(i)
            if (entry) next[i] = entry
        }

        this.capacity = capacity
        this.entries = next
        this.retainedChars = next.reduce((sum, entry) => sum + (entry?.line.length ?? 0), 0)
        this.head = 0
        this.count = keep
        this.version++
        return this.version
    }

    clear() {
        if (this.count === 0) return this.version
        this.entries = Array.from<LogEntry>({ length: this.capacity })
        this.head = 0
        this.count = 0
        this.retainedChars = 0
        this.version++
        return this.version
    }
}
