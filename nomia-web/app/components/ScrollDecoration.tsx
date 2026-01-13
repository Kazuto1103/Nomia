"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

export default function ScrollDecoration() {
    const { scrollYProgress } = useScroll();

    // Smooth the scroll input for fluid animations
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // BOX 1: Base layer
    const box1Opacity = useTransform(smoothProgress, [0.1, 0.15, 0.7, 0.75], [0, 1, 1, 0]);
    const box1X = useTransform(smoothProgress, [0.1, 0.15], [50, 0]); // Slide in from right
    const box1Y = useTransform(smoothProgress, [0.1, 0.15], [0, 0]);

    // BOX 2: Offset trailing towards corner
    const box2Opacity = useTransform(smoothProgress, [0.15, 0.2, 0.7, 0.75], [0, 1, 1, 0]);
    const box2X = useTransform(smoothProgress, [0.15, 0.2], [50, 4]);
    const box2Y = useTransform(smoothProgress, [0.15, 0.2], [0, 4]);

    // BOX 3: Offset trailing towards corner
    const box3Opacity = useTransform(smoothProgress, [0.2, 0.25, 0.7, 0.75], [0, 1, 1, 0]);
    const box3X = useTransform(smoothProgress, [0.2, 0.25], [50, 8]);
    const box3Y = useTransform(smoothProgress, [0.2, 0.25], [0, 8]);

    // BOX 4 (TOP): Prominent layer
    const box4Opacity = useTransform(smoothProgress, [0.25, 0.3, 0.7, 0.75], [0, 1, 1, 0]);
    const box4X = useTransform(smoothProgress, [0.25, 0.3], [50, 12]);
    const box4Y = useTransform(smoothProgress, [0.25, 0.3], [0, 12]);

    // TYPEWRITER TRIGGER
    const [shouldType, setShouldType] = useState(false);
    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (latest) => {
            if (latest > 0.3 && latest < 0.7) {
                setShouldType(true);
            } else if (latest < 0.2 || latest > 0.8) {
                setShouldType(false);
            }
        });
        return () => unsubscribe();
    }, [smoothProgress]);

    const line1 = "GOD'S IN HIS HEAVEN";
    const line2 = "ALL'S RIGHT WITH THE WORLD";

    const { displayText: text1 } = useTypewriter(line1, 40, 0, shouldType);
    const { displayText: text2 } = useTypewriter(line2, 40, 0, shouldType);

    return (
        <>
            {/* Minimal Corner Decoration - Relocated to Bottom-Right */}
            <div className="fixed right-8 bottom-24 z-40 pointer-events-none">
                <div className="relative">
                    {/* Box 1 */}
                    <motion.div
                        style={{ opacity: box1Opacity, x: box1X, y: box1Y }}
                        className="absolute top-0 right-0 w-32 h-16 border border-white/20 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Box 2 */}
                    <motion.div
                        style={{ opacity: box2Opacity, x: box2X, y: box2Y }}
                        className="absolute top-0 right-0 w-32 h-16 border border-white/30 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Box 3 */}
                    <motion.div
                        style={{ opacity: box3Opacity, x: box3X, y: box3Y }}
                        className="absolute top-0 right-0 w-32 h-16 border border-white/40 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Box 4 - Top layer */}
                    <motion.div
                        style={{ opacity: box4Opacity, x: box4X, y: box4Y }}
                        className="absolute top-0 right-0 w-32 h-16 border border-white bg-black/90 backdrop-blur-md"
                    >
                        {/* Minimal Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                        {/* Text Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-1 font-mono text-white text-[7px] tracking-[0.1em]">
                            <div className="text-center space-y-0.5 leading-tight">
                                <div className="opacity-70">
                                    {text1}
                                </div>
                                <div className="opacity-70">
                                    {text2}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
