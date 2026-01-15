"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Radio, Terminal, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ModeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModeState = "SELECT" | "AUTHENTICATING";

export default function ModeSelector({ isOpen, onClose }: ModeSelectorProps) {
    const [state, setState] = useState<ModeState>("SELECT");
    const [authLog, setAuthLog] = useState<string[]>([]);
    const [selectedMode, setSelectedMode] = useState<"live" | "mock" | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setState("SELECT");
            setAuthLog([]);
            setSelectedMode(null);
        }
    }, [isOpen]);

    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    const handleModeSelect = (mode: "live" | "mock") => {
        setSelectedMode(mode);
        setState("AUTHENTICATING");
        runAuthSequence(mode);
    };

    const runAuthSequence = (mode: "live" | "mock") => {
        const steps = [
            "ESTABLISHING_SECURE_LINK...",
            "VERIFYING_ENCRYPTION_KEYS...",
            "SYNCING_POLARITY...",
            "ACCESS_GRANTED // READY_FOR_DEPLOY"
        ];

        let delay = 0;
        steps.forEach((step, index) => {
            delay += 600 + Math.random() * 400;
            const t1 = setTimeout(() => {
                setAuthLog(prev => [...prev, step]);
                if (index === steps.length - 1) {
                    const t2 = setTimeout(() => {
                        window.location.href = mode === "live" ? "/v1-rg/live" : "/v1-rg/mock";
                    }, 800);
                    timeoutsRef.current.push(t2);
                }
            }, delay);
            timeoutsRef.current.push(t1);
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-2xl border border-white/20 bg-black p-8 md:p-12 overflow-hidden"
                    >
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <AnimatePresence mode="wait">
                            {state === "SELECT" ? (
                                <motion.div
                                    key="select"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-4xl font-black tracking-tighter">SELECT_PROTOCOL</h2>
                                        <p className="text-[10px] tracking-[0.4em] opacity-40 uppercase">Choose Operation Environment</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button
                                            onClick={() => handleModeSelect("live")}
                                            className="group relative border border-white/20 p-8 flex flex-col items-center gap-4 transition-all hover:border-white hover:bg-white hover:text-black"
                                        >
                                            <Radio className="w-12 h-12 mb-2" />
                                            <div className="text-center">
                                                <span className="block text-xl font-bold tracking-tight">LIVE_DEPLOY</span>
                                                <span className="text-[8px] tracking-[0.2em] opacity-50 group-hover:opacity-100">REAL-TIME HARDWARE LINK</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleModeSelect("mock")}
                                            className="group relative border border-white/20 p-8 flex flex-col items-center gap-4 transition-all hover:border-white hover:bg-white hover:text-black"
                                        >
                                            <Terminal className="w-12 h-12 mb-2" />
                                            <div className="text-center">
                                                <span className="block text-xl font-bold tracking-tight">VIRT_CORE</span>
                                                <span className="text-[8px] tracking-[0.2em] opacity-50 group-hover:opacity-100">MOCK SIMULATION MODE</span>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="auth"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="min-h-[300px] flex flex-col justify-center"
                                >
                                    <div className="mb-8 flex items-center gap-4">
                                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                        <span className="text-xs tracking-[0.3em] font-bold">INITIATING_HANDSHAKE // {selectedMode?.toUpperCase()}</span>
                                    </div>

                                    <div className="space-y-2 font-mono text-[10px] opacity-70">
                                        {authLog.map((log, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="text-white/40">{">"}</span>
                                                <span>{log}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="mt-12 h-[2px] w-full bg-white/10 relative overflow-hidden">
                                        <motion.div
                                            className="absolute inset-0 bg-white"
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "0%" }}
                                            transition={{ duration: 3, ease: "linear" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
