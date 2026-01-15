"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Terminal, Radio, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";

export default function V1RGEntry() {
    const [isLoading, setIsLoading] = useState(true);
    const [typewriter, setTypewriter] = useState("");
    const fullText = "PHANTOM_TERMINAL";

    const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Loading Sequence
        const timer = setTimeout(() => setIsLoading(false), 2500);

        // Typewriter Effect
        let i = 0;
        let isDeleting = false;

        const type = () => {
            const current = isDeleting
                ? fullText.substring(0, i - 1)
                : fullText.substring(0, i + 1);

            setTypewriter(current);
            i = isDeleting ? i - 1 : i + 1;

            if (!isDeleting && i === fullText.length) {
                // Wait before deleting
                typeTimeoutRef.current = setTimeout(() => {
                    isDeleting = true;
                    type();
                }, 3000);
            } else if (isDeleting && i === 0) {
                isDeleting = false;
                typeTimeoutRef.current = setTimeout(type, 150);
            } else {
                typeTimeoutRef.current = setTimeout(type, isDeleting ? 50 : 150);
            }
        };

        // Start typing loop
        typeTimeoutRef.current = setTimeout(type, 500);

        return () => {
            clearTimeout(timer);
            if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-black text-white font-mono uppercase overflow-hidden flex items-center justify-center p-6 selection:bg-white selection:text-black">

            {/* 1. CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden grayscale contrast-150 brightness-50">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
                </video>
            </div>

            {/* 2. ATMOSPHERIC OVERLAYS */}
            <div className="scanlines fixed inset-0 z-10 pointer-events-none opacity-30" />
            <div className="vignette fixed inset-0 z-[5] pointer-events-none opacity-80" />

            {/* 3. CORNER HUD PROJECTS (Shared with main) */}
            <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen opacity-30">
                <div className="absolute top-0 left-0 w-64 h-64 scale-x-[-1]">
                    <video autoPlay loop muted playsInline className="w-full h-full object-contain">
                        <source src="/decoration/hologram_overlay3.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 scale-y-[-1]">
                    <video autoPlay loop muted playsInline className="w-full h-full object-contain">
                        <source src="/decoration/hologram_overlay.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* 4. LOADING HANDSHAKE (V1.0 style) */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center space-y-4"
                    >
                        <div className="text-xs font-bold tracking-[0.5em] animate-pulse">ESTABLISHING_SECURE_LINK...</div>
                        <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2.5, ease: "circInOut" }}
                                className="absolute inset-0 bg-white"
                                style={{ background: "repeating-linear-gradient(90deg, #fff 0, #fff 10px, transparent 10px, transparent 12px)" }}
                            />
                        </div>
                        <div className="text-[8px] opacity-40 tracking-widest uppercase">RSA-4096_PASS // PORTAL_v1.0</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. MAIN INTERFACE */}
            <div className="relative z-20 text-center space-y-12 max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <p className="text-[0.6rem] tracking-[1em] opacity-40">NOMIA_AUTHORIZED_SYSTEM_ACCESS</p>
                    <h1 className="text-8xl font-black tracking-tighter glow-text">V1-RG</h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/robots/v1-rg/live" className="group border border-white/20 bg-white/5 p-12 space-y-4 transition-all hover:bg-white hover:text-black hover:scale-105">
                        <Radio className="w-16 h-16 mx-auto group-hover:animate-pulse" />
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">LIVE_SYSTEM</h2>
                            <p className="text-[10px] tracking-widest opacity-60 group-hover:opacity-100">DIRECT_CONNECTION // SERIAL_115200</p>
                        </div>
                    </Link>

                    <Link href="/robots/v1-rg/mock" className="group border border-white/20 bg-white/5 p-12 space-y-4 transition-all hover:bg-white hover:text-black hover:scale-105">
                        <Terminal className="w-16 h-16 mx-auto group-hover:animate-bounce" />
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">MOCK_CORE</h2>
                            <p className="text-[10px] tracking-widest opacity-60 group-hover:opacity-100">SIMULATED_ENVIRONMENT // PATROL_ALARM</p>
                        </div>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-[0.6rem] tracking-widest space-y-2"
                >
                    <p>SECURITY_KEY_VERIFIED: RSA-4096_PASS</p>
                    <p>SYSTEM_UPTIME_OK // {new Date().toLocaleTimeString()}</p>
                </motion.div>
            </div>

            {/* 6. PHANTOM BRANDING (Bottom Left) */}
            <div className="fixed bottom-12 left-12 flex items-start gap-6 z-30 pointer-events-none">
                <div className="relative w-[1px] h-48 bg-gradient-to-b from-white to-transparent">
                    <div className="absolute top-0 -left-[2px] w-[5px] h-[5px] bg-white rounded-full shadow-[0_0_10px_#fff]" />
                </div>
                <div className="flex flex-col h-48 justify-end">
                    <div className="vertical-text text-[12px] font-black tracking-[0.8em] h-full flex items-center">
                        {typewriter}
                        <span className="w-0.5 h-4 bg-white ml-2 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Return to Hub */}
            <Link href="/" className="fixed bottom-12 right-12 z-30 text-[10px] tracking-[0.5em] opacity-30 hover:opacity-100 transition-opacity">
                [ RETURN_TO_HUB ]
            </Link>

        </div>
    );
}
