
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface WikiQRCodeProps {
    url: string;
    size?: number;
    className?: string;
    showLabel?: boolean;
}

export const WikiQRCode = ({ url, size = 128, className, showLabel = true }: WikiQRCodeProps) => {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="bg-white p-2 rounded-lg border shadow-sm">
                <QRCodeSVG
                    value={url}
                    size={size}
                    level="H"
                />
            </div>
            {showLabel && (
                <span className="text-xs text-muted-foreground font-mono">
                    Scan to view on mobile
                </span>
            )}
        </div>
    );
};
