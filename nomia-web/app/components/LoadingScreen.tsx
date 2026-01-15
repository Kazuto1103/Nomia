"use client";

import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useAnimationFrame } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";


interface LoadingScreenProps {
    onComplete: () => void;
}


// Helper Component for Curved Text - Optimized with MotionValues & Scalable
function TextRing({ radius, text, rotation, opacity, scale, loop = true, letterSpacing = 0.3, fontSize = 10 }: { radius: number, text: string, rotation: any, opacity: number, scale?: any, loop?: boolean, letterSpacing?: number, fontSize?: number }) {
    // Generate a unique ID for the path to avoid conflicts
    const pathId = `text-path-${radius}-${text.substring(0, 3)}`;

    return (
        <motion.div
            className="absolute flex items-center justify-center rounded-full pointer-events-none"
            style={{
                width: radius * 2,
                height: radius * 2,
                rotate: rotation, // MotionValue rotation
                scale: scale || 1, // Synced Expansion
                opacity: opacity,
                willChange: "transform" // Hardware acceleration hint
            }}
        >
            <svg
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                className="w-full h-full"
                style={{ overflow: "visible" }}
            >
                <path
                    id={pathId}
                    d={`
                        M ${radius}, ${radius}
                        m 0, -${radius}
                        a ${radius},${radius} 0 1,1 0,${radius * 2}
                        a ${radius},${radius} 0 1,1 0,-${radius * 2}
                    `}
                    fill="none"
                />
                <text className="font-mono font-bold fill-white" style={{ fontSize: `${fontSize}px`, letterSpacing: `${letterSpacing}em` }}>
                    <textPath
                        href={`#${pathId}`}
                        startOffset="50%"
                        textAnchor="middle"
                        spacing="auto" // Ensure better spacing for gaps
                    >
                        {text}
                    </textPath>
                </text>
            </svg>
        </motion.div>
    );
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // MOTION VALUES (Bypass React Render Cycle for 60fps)
    const progress = useMotionValue(0);
    const rotation = useMotionValue(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [randomVideo, setRandomVideo] = useState<string>("");

    // DERIVED TRANSFORMS (Mapped directly from MotionValues)
    // Ring Rotations
    const rotateR1 = useTransform(rotation, r => r * 0.4);
    const rotateR2 = useTransform(rotation, r => r * -0.35);
    const rotateR3 = useTransform(rotation, r => r * 0.3);
    const rotateR4 = useTransform(rotation, r => r * -0.25);

    // Central Hub Rotations
    const rotateInner = useTransform(rotation, r => r * 2);
    const rotateOuter = useTransform(rotation, r => r * -1.5);

    // Progress Transforms
    // Sync Text Expansion with Radar: 1 -> 1.15 (Slightly more than radar to feel "alive")
    const scaleRadar = useTransform(progress, p => 1 + (p / 100) * 0.15);
    const opacityRadar = useTransform(progress, p => 0.15 + (p / 100) * 0.3);
    const progressWidth = useTransform(progress, p => `${p}%`);

    // Text Ref for high-perf updates
    const textRef = useRef<HTMLDivElement>(null);

    // Session Randomization
    useEffect(() => {
        const videos = [
            "/decoration/loading_background1.mp4",
            "/decoration/loading_background2.mp4",
            "/decoration/loading_background3.mp4"
        ];
        setRandomVideo(videos[Math.floor(Math.random() * videos.length)]);
    }, []);

    // OPTIMIZED PHYSICS LOOP (useAnimationFrame)
    useAnimationFrame((time, delta) => {
        // NOTE: We do NOT return early if isExiting, to keep rotation spinning during the fade out (Prevents "patah"/choppy look)

        // 1. Progress Logic (Only update if not exiting yet)
        let currentProgress = progress.get();
        if (!isExiting) {
            if (isPressed && currentProgress < 100) {
                progress.set(Math.min(currentProgress + 1.5, 100)); // Charge up
            } else if (!isPressed && currentProgress > 0) {
                progress.set(Math.max(currentProgress - 2, 0)); // Decay
            }
        }

        // 2. Rotation Logic
        const currentProg = progress.get();
        // Speed Curve: Idle (0.08) -> Active (Aggressive Boost)
        // Previous max was ~4-8. New max: 2 + 15 = 17 degrees/frame (Very fast blur)
        const speed = (isPressed || isExiting) // Keep spinning fast if exiting
            ? 1.5 + Math.pow(currentProg / 100, 2) * 15
            : 0.08;

        rotation.set(rotation.get() + speed);

        // 3. Video Speed Sync
        if (videoRef.current) {
            const targetSpeed = isPressed ? 1.0 + (currentProg / 100) * 3.0 : 0.5;
            const currentRate = videoRef.current.playbackRate;
            if (Math.abs(targetSpeed - currentRate) > 0.01) {
                videoRef.current.playbackRate += (targetSpeed - currentRate) * 0.1;
            }
        }

        // 4. Update Text Content directly
        if (textRef.current) {
            textRef.current.textContent = `PROXIMITY_SYNC: ${currentProg.toFixed(1)}%`;
        }

        // 5. Trigger Complete
        if (currentProg >= 100 && !isExiting) {
            handleTriggerComplete();
        }
    });


    const handleTriggerComplete = () => {
        if (isExiting) return; // double check
        setIsExiting(true);
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    // Sequential Entrance Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.15 // 0.15s delay between layers
            }
        },
        exit: {
            opacity: 0,
            scale: 1.05, // Subtle expansion for "breath" effect, not warp
            filter: "blur(4px)", // Less blur, more motion smear feeling
            transition: { duration: 0.8, ease: "easeIn" }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: "circOut" }
        }
    } as const;

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-[10000] bg-black flex flex-center cursor-none overflow-hidden"
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    onTouchStart={() => setIsPressed(true)}
                    onTouchEnd={() => setIsPressed(false)}
                >
                    {/* Background Dynamic Video */}
                    <motion.div variants={itemVariants} className="absolute inset-0 z-0 opacity-20 grayscale pointer-events-none overflow-hidden" style={{ willChange: "transform", transform: "translate3d(0,0,0)" }}>
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
                    </motion.div>

                    {/* Background Noise/Scanlines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />

                    <div className="relative flex items-center justify-center w-full h-full">

                        {/* CENTRAL HUB: REACTOR TURBINE (First to appear) */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center z-50">
                            {/* Inner Reactor Ring (CW) */}
                            <motion.div
                                style={{
                                    rotate: rotateInner,
                                }}
                                animate={{ scale: isPressed ? 0.9 : 1 }}
                                className="absolute w-[40px] h-[40px] rounded-full border-2 border-dashed border-white/60"
                            />

                            {/* Outer Shield Ring (CCW) */}
                            <motion.div
                                style={{
                                    rotate: rotateOuter,
                                }}
                                animate={{
                                    scale: isPressed ? 1.1 : 1,
                                    opacity: isPressed ? 0.8 : 0.4
                                }}
                                className="absolute w-[56px] h-[56px] rounded-full border border-dotted border-white/40"
                            />

                            {/* Core Energy Source */}
                            <motion.div
                                animate={{
                                    scale: isPressed ? [1, 1.2, 1] : [1, 1.05, 1],
                                    backgroundColor: isPressed ? "#ffffff" : "transparent"
                                }}
                                transition={{ repeat: Infinity, duration: isPressed ? 0.2 : 3, ease: "easeInOut" }}
                                className="w-4 h-4 rounded-full border border-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                            />

                            <motion.div
                                animate={{ opacity: isPressed ? 1 : 0.2 }}
                                className="absolute w-[80px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
                            />
                            <motion.div
                                animate={{ opacity: isPressed ? 1 : 0.2 }}
                                className="absolute w-[1px] h-[80px] bg-gradient-to-b from-transparent via-white to-transparent"
                            />
                        </motion.div>


                        {/* 0. HUD TEXT RINGS (New Layer - Reordered & Expanded) */}
                        {/* Ring 1 - Slogan - Staggered text with gaps */}
                        <motion.div variants={itemVariants} className="absolute inset-0 flex items-center justify-center">
                            <TextRing
                                radius={115}
                                // Restored density: 3 repetitions, small gaps
                                text="NOMIA // ADVANCED ROBOTIC CONTROL SYSTEM // PARENT_OS //  NOMIA // ADVANCED ROBOTIC CONTROL SYSTEM // PARENT_OS //  NOMIA // ADVANCED ROBOTIC CONTROL SYSTEM // PARENT_OS //  "
                                rotation={rotateR1}
                                scale={scaleRadar}
                                opacity={0.6}
                                fontSize={7}
                                letterSpacing={0.25}
                            />
                        </motion.div>

                        {/* Ring 2 - Coordinates - Clustered with gaps */}
                        <motion.div variants={itemVariants} className="absolute inset-0 flex items-center justify-center">
                            <TextRing
                                radius={235}
                                // Restored density: More cities, smaller gaps
                                text="TYO 35.6°N 139.6°E // NYC 40.7°N 74.0°W // LON 51.5°N 0.1°W   BER 52.5°N 13.4°E // SEL 37.5°N 126.9°E // SZX 22.5°N 114.0°E   SFO 37.7°N 122.4°W // SIN 1.3°N 103.8°E // TYO 35.6°N 139.6°E   "
                                rotation={rotateR2}
                                scale={scaleRadar}
                                opacity={0.5}
                                fontSize={7}
                                letterSpacing={0.2}
                            />
                        </motion.div>

                        {/* Ring 3 - Compass - Continuous but subtle unevenness */}
                        <motion.div variants={itemVariants} className="absolute inset-0 flex items-center justify-center">
                            <TextRing
                                radius={355}
                                // Restored density: Continuous
                                text="000 --- 010 --- 020 --- 030 --- 040 --- 050 --- 060 --- 070 --- 080 --- 090 --- 100 --- 110 --- 120 --- 130 --- 140 --- 150 --- 160 --- 170 --- 180 --- 190 --- 200 --- 210 --- 220 --- 230 --- 240 --- 250 --- 260 --- 270 --- 280 --- 290 --- 300 --- 310 --- 320 --- 330 --- 340 --- 350 --- 000 --- 010 --- 020 --- 030 --- 040 --- 050 --- "
                                rotation={rotateR3}
                                scale={scaleRadar}
                                opacity={0.3}
                                fontSize={8}
                                letterSpacing={0.4}
                            />
                        </motion.div>

                        {/* Ring 4 - System Diagnostics - 4 distinct quadrants */}
                        <motion.div variants={itemVariants} className="absolute inset-0 flex items-center justify-center">
                            <TextRing
                                radius={475}
                                // Restored density: 4 full blocks, minimal gap
                                text="[SYS_READY] 0x4F1A // [NET_SECURE] 0xA1B2 // [MEM_OK] 0xC3D4 // [PWR_STABLE] 0xE5F6 // [SYS_READY] 0x4F1A // [NET_SECURE] 0xA1B2 // [MEM_OK] 0xC3D4 // [PWR_STABLE] 0xE5F6 // [SYS_READY] 0x4F1A // [NET_SECURE] 0xA1B2 // [MEM_OK] 0xC3D4 // [PWR_STABLE] 0xE5F6 // [SYS_READY] 0x4F1A // [NET_SECURE] 0xA1B2 // [MEM_OK] 0xC3D4 // [PWR_STABLE] 0xE5F6 // "
                                rotation={rotateR4}
                                scale={scaleRadar}
                                opacity={0.2}
                                fontSize={9}
                                letterSpacing={0.3}
                            />
                        </motion.div>


                        {/* RADAR CIRCLES - Matched to Text Rings - Also use ItemVariants for staggered entry */}
                        {[100, 220, 340, 460].map((r, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                style={{
                                    scale: scaleRadar,
                                    opacity: opacityRadar,
                                    borderWidth: "1px",
                                    width: `${r * 2}px`,
                                    height: `${r * 2}px`,
                                }}
                                className="absolute rounded-full border border-white/40"
                            />
                        ))}


                        {/* STATUS TEXT - Appears last */}
                        <motion.div variants={itemVariants} className="absolute bottom-24 flex flex-col items-center font-mono tracking-[0.5em]">
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
                                    style={{ width: progressWidth }}
                                />
                            </div>

                            <div className="mt-2 text-[8px] text-white/30" ref={textRef}>
                                PROXIMITY_SYNC: 0.0%
                            </div>
                        </motion.div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
