/** Canvas charts resolve the same semantic colors as their labels and legends. */
export function chartPalette() {
    const style = getComputedStyle(document.documentElement);
    const read = (token: string) => style.getPropertyValue(token).trim();
    const uploadStroke = read('--color-success');
    const downloadStroke = read('--color-info');
    return {
        uploadStroke,
        uploadFill: `color-mix(in srgb, ${uploadStroke} 12%, transparent)`,
        downloadStroke,
        downloadFill: `color-mix(in srgb, ${downloadStroke} 10%, transparent)`,
        axis: read('--text-secondary'),
        grid: read('--border'),
        pointFill: read('--surface'),
    };
}
