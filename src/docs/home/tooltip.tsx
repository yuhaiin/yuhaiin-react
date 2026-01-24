import { formatBytes } from "../connections/components";

interface TooltipProps {
    label?: string;
    upload?: number;
    download?: number;
    left: number;
    top: number;
    visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ label, upload, download, left, top, visible }) => {
    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                display: visible ? 'block' : 'none',
                pointerEvents: 'none',
                background: 'rgba(0,0,0,1)',
                padding: 8,
                borderRadius: 4,
                color: '#fff',
                fontSize: 12,
                minWidth: 120,
                zIndex: 10,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#f1f5f9' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
                <span style={{ color: '#cbd5e1' }}>Upload:</span>
                <span style={{ fontWeight: 500 }}>{formatBytes(upload ?? 0, 2, ' ') + '/S'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%' }} />
                <span style={{ color: '#cbd5e1' }}>Download:</span>
                <span style={{ fontWeight: 500 }}>{formatBytes(download ?? 0, 2, ' ') + '/S'}</span>
            </div>
        </div>
    );
};
