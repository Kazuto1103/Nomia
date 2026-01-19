"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

export default function ScrollDecoration() {
    const { scrollYProgress } = useScroll();

    // Smooth the scroll input for fluid animations
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // BOX 1: Base layer (Rear-most)
    const box1Opacity = useTransform(smoothProgress, [0.38, 0.45, 0.75, 0.85], [0, 0.4, 0.4, 0]);
    const box1X = useTransform(smoothProgress, [0.38, 0.45, 0.75, 0.85], [150, 0, 0, 150]);
    const box1Y = useTransform(smoothProgress, [0.38, 0.45, 0.75, 0.85], [0, 0, 0, 0]);
    const box1Scale = useTransform(smoothProgress, [0.38, 0.45, 0.75, 0.85], [0.5, 0.9, 0.9, 0.5]);

    // BOX 2: Offset 1
    const box2Opacity = useTransform(smoothProgress, [0.40, 0.47, 0.73, 0.83], [0, 0.6, 0.6, 0]);
    const box2X = useTransform(smoothProgress, [0.40, 0.47, 0.73, 0.83], [150, 15, 15, 150]);
    const box2Y = useTransform(smoothProgress, [0.40, 0.47, 0.73, 0.83], [0, 15, 15, 0]);
    const box2Scale = useTransform(smoothProgress, [0.40, 0.47, 0.73, 0.83], [0.5, 0.95, 0.95, 0.5]);

    // BOX 3: Offset 2
    const box3Opacity = useTransform(smoothProgress, [0.42, 0.49, 0.71, 0.81], [0, 0.8, 0.8, 0]);
    const box3X = useTransform(smoothProgress, [0.42, 0.49, 0.71, 0.81], [150, 30, 30, 150]);
    const box3Y = useTransform(smoothProgress, [0.42, 0.49, 0.71, 0.81], [0, 30, 30, 0]);
    const box3Scale = useTransform(smoothProgress, [0.42, 0.49, 0.71, 0.81], [0.5, 1, 1, 0.5]);

    // BOX 4 (TOP): Front-most
    const box4Opacity = useTransform(smoothProgress, [0.44, 0.51, 0.69, 0.79], [0, 1, 1, 0]);
    const box4X = useTransform(smoothProgress, [0.44, 0.51, 0.69, 0.79], [150, 45, 45, 150]);
    const box4Y = useTransform(smoothProgress, [0.44, 0.51, 0.69, 0.79], [0, 45, 45, 0]);
    const box4Scale = useTransform(smoothProgress, [0.44, 0.51, 0.69, 0.79], [0.5, 1.05, 1.05, 0.5]);

    // TYPEWRITER TRIGGER
    const [shouldType, setShouldType] = useState(false);
    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (latest) => {
            if (latest > 0.42 && latest < 0.70) {
                setShouldType(true);
            } else if (latest < 0.35 || latest > 0.80) {
                setShouldType(false);
            }
        });
        return () => unsubscribe();
    }, [smoothProgress]);

    const line1 = "GOD'S IN HIS HEAVEN";
    const line2 = "ALL'S RIGHT WITH THE WORLD";

    const { displayText: text1 } = useTypewriter(line1, 40, 0, shouldType);
    const { displayText: text2 } = useTypewriter(line2, 40, 0, shouldType);

    // Randomized Hex String for background flicker
    const [hexString, setHexString] = useState("0x00FF00");
    useEffect(() => {
        const interval = setInterval(() => {
            setHexString("0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0'));
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Chamfered Shape Path
    const clipPath = "polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 15% 100%, 0% 85%)";

    return (
        <div className="fixed right-12 bottom-32 z-40 pointer-events-none origin-bottom-right">
            <div className="relative w-[400px] h-[180px]">
                {/* Layer 1 (Rear) */}
                <motion.div
                    style={{ opacity: box1Opacity, x: box1X, y: box1Y, scale: box1Scale, clipPath }}
                    className="absolute inset-0 border-2 border-white/20 bg-white/5 backdrop-blur-[1px]"
                />

                {/* Layer 2 */}
                <motion.div
                    style={{ opacity: box2Opacity, x: box2X, y: box2Y, scale: box2Scale, clipPath }}
                    className="absolute inset-0 border-2 border-white/30 bg-white/5 backdrop-blur-[2px]"
                />

                {/* Layer 3 */}
                <motion.div
                    style={{ opacity: box3Opacity, x: box3X, y: box3Y, scale: box3Scale, clipPath }}
                    className="absolute inset-0 border-2 border-white/40 bg-white/10 backdrop-blur-[3px]"
                />

                {/* Layer 4 (Top) */}
                <motion.div
                    style={{ opacity: box4Opacity, x: box4X, y: box4Y, scale: box4Scale, clipPath }}
                    className="absolute inset-0 border-2 border-white bg-black/95 backdrop-blur-2xl group overflow-hidden shadow-2xl shadow-white/5"
                >
                    {/* Scanlines inside the box */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                    {/* Micro Decorations: Hex Readout */}
                    <div className="absolute top-2 right-6 font-mono text-[8px] opacity-30 tracking-tighter">
                        {hexString}
                    </div>

                    {/* Micro Decorations: Coordinate Readout */}
                    <div className="absolute bottom-6 left-6 font-mono text-[8px] opacity-40">
                        LAT: 35.6895 <br />
                        LON: 139.6917
                    </div>

                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-white/10 overflow-hidden">
                        <motion.div
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-full h-1/2 bg-white/40"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center px-10">
                        <div className="w-full border-l-2 border-white/30 pl-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-white animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">SYSTEM_LINK // ACTIVE</span>
                            </div>

                            <div className="font-mono space-y-1">
                                <h3 className="text-xl font-black text-white glow-text leading-tight">
                                    {text1}
                                </h3>
                                <p className="text-[10px] text-white/60 tracking-wider uppercase font-bold">
                                    {text2}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Bar Graph (Visual Only) */}
                    <div className="absolute bottom-4 right-8 flex items-end gap-0.5 opacity-30">
                        {[4, 7, 3, 9, 6, 2, 8].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [h * 2, h * 4, h * 2] }}
                                transition={{ duration: 1 + i * 0.2, repeat: Infinity }}
                                className="w-1 bg-white"
                                style={{ height: h * 2 }}
                            />
                        ))}
                    </div>

                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />
                </motion.div>
            </div>
        </div>
    );
}
