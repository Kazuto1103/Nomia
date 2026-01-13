"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

export default function ScrollDecoration() {
    const { scrollYProgress } = useScroll();
    const [showDecoration, setShowDecoration] = useState(false);
    const [animationStage, setAnimationStage] = useState(0);

    // Track scroll progress
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Show when scrolled between 10% and 70%
            if (latest > 0.1 && latest < 0.7) {
                if (!showDecoration) {
                    setShowDecoration(true);
                    setAnimationStage(0);
                    // Trigger animation stages - boxes appear sequentially
                    setTimeout(() => setAnimationStage(1), 100);  // Box 1
                    setTimeout(() => setAnimationStage(2), 250);  // Box 2
                    setTimeout(() => setAnimationStage(3), 400);  // Box 3
                    setTimeout(() => setAnimationStage(4), 550);  // Box 4 (top, with text)
                }
            } else {
                setShowDecoration(false);
                setAnimationStage(0);
            }
        });

        return () => unsubscribe();
    }, [scrollYProgress, showDecoration]);

    const line1 = "GOD'S IN HIS HEAVEN";
    const line2 = "ALL'S RIGHT WITH THE WORLD";

    const { displayText: text1 } = useTypewriter(line1, 40, 0, animationStage >= 4);
    const { displayText: text2 } = useTypewriter(line2, 40, 0, animationStage >= 4);

    if (!showDecoration) return null;

    return (
        <>
            {/* Right Side Decoration - Stacked Boxes (Windows Error Style) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed right-16 top-1/3 z-40 pointer-events-none"
            >
                <div className="relative">
                    {/* Box 1 - Bottom layer (furthest back) */}
                    {animationStage >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-56 h-28 border border-white/20 bg-black"
                        />
                    )}

                    {/* Box 2 - Second layer */}
                    {animationStage >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, y: 20 }}
                            animate={{ opacity: 1, x: 6, y: 6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-56 h-28 border border-white/30 bg-black"
                        />
                    )}

                    {/* Box 3 - Third layer */}
                    {animationStage >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, y: 20 }}
                            animate={{ opacity: 1, x: 12, y: 12 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-56 h-28 border border-white/40 bg-black"
                        />
                    )}

                    {/* Box 4 - Top layer with text (NOMIA style) */}
                    {animationStage >= 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, y: 20 }}
                            animate={{ opacity: 1, x: 18, y: 18 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-56 h-28 border border-white bg-black"
                        >
                            {/* Minimal Corner Accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white" />
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white" />

                            {/* Top Bar (Title Bar Style) */}
                            <div className="absolute top-0 left-0 right-0 h-6 border-b border-white/20 flex items-center px-2">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-white/50" />
                                    <div className="w-1 h-1 bg-white/50" />
                                    <div className="w-1 h-1 bg-white/50" />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="absolute inset-0 top-6 flex flex-col items-center justify-center px-3 font-mono text-white text-[9px] tracking-[0.15em]">
                                <div className="text-center space-y-0.5 leading-tight">
                                    <div className="opacity-80">
                                        {text1}
                                        {text1.length < line1.length && <span className="animate-pulse">_</span>}
                                    </div>
                                    <div className="opacity-80">
                                        {text2}
                                        {text2.length < line2.length && <span className="animate-pulse">_</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Scanline effect overlay */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_2px]" />
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
