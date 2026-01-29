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
            className={`absolute pointer-events-none bg-black p-2 rounded text-white text-xs min-w-[120px] z-10 ${visible ? 'block' : 'hidden'}`}
            style={{
                left,
                top,
            }}
        >
            <div className="font-semibold mb-1 text-slate-100">{label}</div>
            <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-slate-300">Upload:</span>
                <span className="font-medium">{formatBytes(upload ?? 0, 2, ' ') + '/S'}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-slate-300">Download:</span>
                <span className="font-medium">{formatBytes(download ?? 0, 2, ' ') + '/S'}</span>
            </div>
        </div>
    );
};
