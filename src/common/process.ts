/**
 * A readable name for a process path, for places that list processes by name.
 *
 * - macOS app bundles show the bundle name: `/Applications/Lark.app/Contents/MacOS/Lark` is "Lark",
 *   and a helper bundle inside it keeps its own name ("Lark Helper (Renderer)").
 * - Windows executables drop `.exe`: `C:\Program Files\App\app.exe` is "app".
 * - Everything else shows the executable name: `/usr/bin/curl` is "curl".
 *
 * Names without a directory (Android package names, plain names) are returned as they are.
 * Keep the full path for matching and filtering: two different paths can share a name.
 */
export function processName(path?: string): string {
    if (!path) return "";
    const parts = path.split(/[\\/]/).filter(Boolean);
    if (!parts.length) return path;
    // The bundle's main executable lives at <Name>.app/Contents/MacOS/<executable>.
    for (let index = parts.length - 1; index >= 0; index--) {
        if (!/\.app$/i.test(parts[index])) continue;
        if (parts[index + 1] === "Contents" && parts[index + 2] === "MacOS" && index + 3 === parts.length - 1) {
            return parts[index].slice(0, -4);
        }
        break;
    }
    const executable = parts[parts.length - 1];
    return executable.replace(/\.exe$/i, "") || executable;
}
