import { createElement, useState } from "react";
import { nodeIcon } from "./presentation";
import type { TopologyNode } from "./model";
import styles from "./topology.module.css";

/**
 * The node's app icon when it has one, otherwise its kind icon. An icon that
 * fails to load (consent withdrawn, app uninstalled) falls back to the kind icon.
 */
export function NodeIcon({ node, size, imageSize }: { node: TopologyNode; size: number; imageSize: number }) {
    const [failed, setFailed] = useState<string>();
    if (node.iconUrl && failed !== node.iconUrl) {
        const url = node.iconUrl;
        return <img className={styles.appIcon} src={url} width={imageSize} height={imageSize} alt="" draggable={false} decoding="async" onError={() => setFailed(url)} />;
    }
    return createElement(nodeIcon(node), { size, strokeWidth: 1.75 });
}
