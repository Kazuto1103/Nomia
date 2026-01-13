"use client";

import { useState, useEffect } from "react";
import WarpWindow from "./WarpWindow";

const WARP_DATA = [
    {
        assetSrc: "/decoration/hologram_rubik.gif",
        assetType: "gif" as const,
        frameType: "neffos" as const,
        speed: 1.5,
        width: "300px",
        height: "300px",
        label: "WARP_CUBE_MODULE",
    },
    {
        assetSrc: "/decoration/hologram_halo.gif",
        assetType: "gif" as const,
        frameType: "underline" as const,
        speed: 0.8,
        width: "250px",
        height: "250px",
        label: "HALO_SYNC_LINK",
    },
    {
        assetSrc: "/decoration/flower_background.gif",
        assetType: "gif" as const,
        frameType: "lines" as const,
        speed: 1.2,
        width: "400px",
        height: "250px",
        label: "BIOME_TRANSCRIPTION",
    },
    {
        assetSrc: "/decoration/hologram_overlay2.mp4",
        assetType: "video" as const,
        frameType: "neffos" as const,
        speed: 1.0,
        width: "280px",
        height: "180px",
        label: "TELEMETRY_FEED_02",
    },
];

export default function FloatingWarpSystem() {
    const [windows, setWindows] = useState<any[]>([]);

    useEffect(() => {
        // Generate randomized positions that avoid the center (roughly 30% to 70% width)
        const generated = WARP_DATA.map((data, index) => {
            const isLeft = index % 2 === 0;
            const x = isLeft
                ? `${Math.random() * 10 + 5}%` // 5-15%
                : `${Math.random() * 10 + 75}%`; // 75-85%

            const y = `${Math.random() * 60 + 20}%`; // 20-80%

            return {
                ...data,
                initialX: x,
                initialY: y,
            };
        });
        setWindows(generated);
    }, []);

    return (
        <>
            {windows.map((window, i) => (
                <WarpWindow key={i} {...window} />
            ))}
        </>
    );
}
