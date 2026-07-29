import { FC } from "react";

export const IFramePage: FC<{ src: string, appearance?: "default" | "light" }> = ({ src, appearance = "default" }) => {
    const forceLight = appearance === "light";

    return (
        <div className="ui-embed-frame">
            <iframe
                src={src}
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                loading="lazy"
                style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    backgroundColor: forceLight ? '#ffffff' : undefined,
                    colorScheme: forceLight ? 'light' : undefined,
                }}
            />
        </div>
    );
}
