"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

interface TechSpecsProps {
    isOpen: boolean;
    onClose: () => void;
}

function TypewriterText({
    text,
    delay = 0,
    speed = 20,
    className = "",
    shouldStart = true
}: {
    text: string;
    delay?: number;
    speed?: number;
    className?: string;
    shouldStart?: boolean;
}) {
    const { displayText, isComplete } = useTypewriter(text, speed, delay, shouldStart);

    return (
        <span className={className}>
            {displayText}
            {!isComplete && <span className="animate-pulse">_</span>}
        </span>
    );
}

export default function MechaTechSpecs({ isOpen, onClose }: TechSpecsProps) {
    const [animationStage, setAnimationStage] = useState(0);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];

        if (isOpen) {
            setAnimationStage(0);
            setShowContent(false);

            // Faster animation sequence
            timeouts.push(setTimeout(() => setAnimationStage(1), 50));
            timeouts.push(setTimeout(() => setAnimationStage(2), 200));
            timeouts.push(setTimeout(() => setAnimationStage(3), 400));
            timeouts.push(setTimeout(() => {
                setAnimationStage(4);
                setShowContent(true);
            }, 600));
        }

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* Floating Container with Anti-Gravity Effect */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 300
                        }}
                        className="relative w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Outside and Prominent */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={onClose}
                            className="absolute -top-4 -right-4 z-[110] p-2 bg-white text-black hover:bg-red-500 hover:text-white transition-colors border-2 border-white shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>

                        {/* Floating Animation */}
                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {/* Split Lines */}
                            {animationStage >= 2 && (
                                <>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "50%" }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-[1px] bg-white/50 origin-left"
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "50%" }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-0 right-0 h-[1px] bg-white/50 origin-right"
                                    />
                                </>
                            )}

                            {/* Main Content Box */}
                            {animationStage >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative border border-white/30 bg-black/90 backdrop-blur-xl p-5 origin-top"
                                >
                                    {/* Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white" />

                                    {showContent && (
                                        <div className="space-y-4 font-mono text-white text-sm">
                                            {/* Header */}
                                            <div className="border-b border-white/20 pb-2">
                                                <h2 className="text-lg font-black tracking-tight mb-1">
                                                    <TypewriterText text="V1-RG // TECHNICAL_SPECS" speed={15} />
                                                </h2>
                                                <p className="text-[9px] opacity-40 tracking-widest">
                                                    <TypewriterText text="PHANTOM_CLASS_AUTONOMOUS_UNIT" speed={10} delay={300} />
                                                </p>
                                            </div>

                                            {/* Two Column Layout */}
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                {/* Hardware */}
                                                <div className="space-y-2">
                                                    <h3 className="text-[10px] font-bold tracking-widest opacity-60 mb-1.5">
                                                        <TypewriterText text="| HARDWARE_MATRIX" speed={15} delay={500} />
                                                    </h3>
                                                    <SpecLine label="MAIN_PROC" value="RPi5 4GB" delay={700} />
                                                    <SpecLine label="MCU" value="ESP32-C3" delay={800} />
                                                    <SpecLine label="POWER" value="LiPo 3S 11.1V" delay={900} />
                                                    <SpecLine label="MOTOR_DRV" value="L298N H-Bridge" delay={1000} />
                                                    <SpecLine label="SENSOR" value="HC-SR04 Ultra" delay={1100} />
                                                    <SpecLine label="COMM" value="UDP/WebSocket" delay={1200} />
                                                </div>

                                                {/* Software */}
                                                <div className="space-y-2">
                                                    <h3 className="text-[10px] font-bold tracking-widest opacity-60 mb-1.5">
                                                        <TypewriterText text="| SOFTWARE_STACK" speed={15} delay={600} />
                                                    </h3>
                                                    <SpecLine label="BACKEND" value="FastAPI Py3.11" delay={700} />
                                                    <SpecLine label="FRONTEND" value="Alpine + TW" delay={800} />
                                                    <SpecLine label="REALTIME" value="WS Port 8080" delay={900} />
                                                    <SpecLine label="MODES" value="MAN|AUTO|DOCK" delay={1000} />
                                                    <SpecLine label="TELEMETRY" value="100ms (10Hz)" delay={1100} />
                                                    <SpecLine label="E_KILL" value="CMD_TERMINATE" delay={1200} />
                                                </div>
                                            </div>

                                            {/* Operational Params - Compact */}
                                            <div className="border-t border-white/20 pt-3">
                                                <h3 className="text-[10px] font-bold tracking-widest opacity-60 mb-2">
                                                    <TypewriterText text="| OPERATIONAL_PARAMS" speed={15} delay={1300} />
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <ParamBox label="MAX_SPEED" value="2.5 m/s" delay={1400} />
                                                    <ParamBox label="RANGE" value="0-400cm" delay={1500} />
                                                    <ParamBox label="RUNTIME" value="~45min" delay={1600} />
                                                </div>
                                            </div>

                                            {/* Status - Inline */}
                                            <div className="border-t border-white/10 pt-3 flex gap-3 text-[9px]">
                                                <StatusBadge text="NET:ONLINE" delay={1700} />
                                                <StatusBadge text="SENS:OK" delay={1750} />
                                                <StatusBadge text="MOT:RDY" delay={1800} />
                                                <StatusBadge text="BAT:98%" delay={1850} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SpecLine({ label, value, delay }: { label: string; value: string; delay: number }) {
    return (
        <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1.5">
            <span className="opacity-40">
                <TypewriterText text={label} speed={10} delay={delay} />
            </span>
            <span className="font-bold">
                <TypewriterText text={value} speed={10} delay={delay + 100} />
            </span>
        </div>
    );
}

function ParamBox({ label, value, delay }: { label: string; value: string; delay: number }) {
    return (
        <div className="border border-white/20 p-1.5">
            <p className="text-[8px] opacity-40 mb-0.5">
                <TypewriterText text={label} speed={10} delay={delay} />
            </p>
            <p className="text-sm font-bold">
                <TypewriterText text={value} speed={15} delay={delay + 100} />
            </p>
        </div>
    );
}

function StatusBadge({ text, delay }: { text: string; delay: number }) {
    return (
        <div className="border border-green-500/50 text-green-500 px-2 py-1">
            <TypewriterText text={text} speed={8} delay={delay} />
        </div>
    );
}
