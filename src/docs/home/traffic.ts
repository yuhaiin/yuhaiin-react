import type { Flow } from "../connections/components";

export type LiveTraffic = { labels: string[]; upload: number[]; download: number[]; rawMax: number };

export function appendTrafficSample(prevState: LiveTraffic, nextFlow: Flow, limit = 120): LiveTraffic {
    const time = nextFlow.time.toLocaleTimeString();
    const pointMax = Math.max(nextFlow.uploadRate, nextFlow.downloadRate);
    const labels = [...prevState.labels, time];
    const upload = [...prevState.upload, nextFlow.uploadRate];
    const download = [...prevState.download, nextFlow.downloadRate];
    let rawMax = Math.max(prevState.rawMax, pointMax);

    if (labels.length > limit) {
        labels.shift();
        const expiredUpload = upload.shift();
        const expiredDownload = download.shift();
        if (expiredUpload === rawMax || expiredDownload === rawMax) rawMax = Math.max(...upload, ...download, 0);
    }

    return { labels, upload, download, rawMax };
}
