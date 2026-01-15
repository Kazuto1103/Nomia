"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";


interface LoadingScreenProps {
    onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const requestRef = useRef<number>(null);

    const pulseControls = useAnimation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [randomVideo, setRandomVideo] = useState<string>("");

    // Session Randomization: Pick 1 of 3 videos on mount
    useEffect(() => {
        const videos = [
            "/decoration/loading_background1.mp4",
            "/decoration/loading_background2.mp4",
            "/decoration/loading_background3.mp4"
        ];
        const selected = videos[Math.floor(Math.random() * videos.length)];
        setRandomVideo(selected);
    }, []);

    // Adaptive Playback Rate (Smoothed with GSAP)
    useEffect(() => {
        if (videoRef.current) {
            const targetSpeed = isPressed ? 1.0 + (progress / 100) * 3.0 : 0.5;
            gsap.to(videoRef.current, {
                playbackRate: targetSpeed,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [isPressed, progress]);

    // Physics loop for pressure
    useEffect(() => {
        const animate = () => {
            if (isPressed && progress < 100) {
                setProgress((prev) => Math.min(prev + 1.5, 100));
            } else if (!isPressed && progress > 0) {
                setProgress((prev) => Math.max(prev - 2, 0));
            }

            if (progress >= 100 && !isExiting) {
                handleTriggerComplete();
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPressed, progress, isExiting]);

    const handleTriggerComplete = () => {
        setIsExiting(true);
        // Sequence: Complete
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                    className="fixed inset-0 z-[10000] bg-black flex flex-center cursor-none overflow-hidden"
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    onTouchStart={() => setIsPressed(true)}
                    onTouchEnd={() => setIsPressed(false)}
                >
                    {/* Background Dynamic Video (Session Randomized) */}
                    <div className="absolute inset-0 z-0 opacity-20 grayscale pointer-events-none overflow-hidden" style={{ willChange: "transform", transform: "translate3d(0,0,0)" }}>
                        {randomVideo && (
                            <video
                                ref={videoRef}
                                key={randomVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <source src={randomVideo} type="video/mp4" />
                            </video>
                        )}
                    </div>

                    {/* Background Noise/Scanlines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />

                    <div className="relative flex items-center justify-center w-full h-full">
                        {/* RADAR CIRCLES */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: (i + 1) * 0.5 + (progress / 100) * (5 - i) * 0.1,
                                    opacity: 0.1 + (progress / 100) * 0.4,
                                    borderWidth: isPressed ? "2px" : "1px"
                                }}
                                transition={{ delay: i * 0.1, ease: "circOut" }}
                                className="absolute rounded-full border border-white"
                                style={{
                                    width: `${(i + 1) * 150}px`,
                                    height: `${(i + 1) * 150}px`,
                                }}
                            />
                        ))}

                        {/* CENTRAL INTERACTIVE HUB */}
                        <motion.div
                            animate={{
                                scale: isPressed ? 0.8 : 1,
                                rotate: isPressed ? progress * 3.6 : 0,
                            }}
                            className="relative w-48 h-48 flex items-center justify-center"
                        >
                            {/* Core Dot */}
                            <motion.div
                                animate={{
                                    scale: isPressed ? [1, 1.5, 1] : 1,
                                    backgroundColor: progress >= 100 ? "#ffffff" : "rgba(255, 255, 255, 0)"
                                }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            />

                            {/* Radial Vector Lines */}
                            {[...Array(24)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: isPressed ? 100 + (Math.random() * progress) : 40,
                                        opacity: isPressed ? 0.5 : 0.2,
                                        rotate: i * 15,
                                    }}
                                    className="absolute w-[1px] bg-white origin-bottom"
                                    style={{ bottom: "50%" }}
                                />
                            ))}
                        </motion.div>

                        {/* STATUS TEXT */}
                        <div className="absolute bottom-24 flex flex-col items-center font-mono tracking-[0.5em]">
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-[10px] text-white/50 mb-4"
                            >
                                [ HOLD_TO_AUTHORIZE_SYSTEM_HANDSHAKE ]
                            </motion.span>

                            <div className="w-64 h-[2px] bg-white/10 relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-white"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="mt-2 text-[8px] text-white/30">
                                PROXIMITY_SYNC: {progress.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
