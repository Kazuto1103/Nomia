"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Activity, Database, Settings, Power, ShieldCheck, Terminal, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
type SystemState = "IDLE" | "AUTHENTICATING" | "ACCESS_GRANTED" | "MODE_SELECT";

export default function Dashboard() {
    const router = useRouter();
    const [hovered, setHovered] = useState<string | null>(null);
    const [systemState, setSystemState] = useState<SystemState>("IDLE");
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    // Auth Animation State
    const [authLog, setAuthLog] = useState<string[]>([]);

    const handleUnitClick = (unitId: string) => {
        if (unitId !== "v1-rg") return; // Only V1-RG is active
        setSelectedUnit(unitId);
        setSystemState("AUTHENTICATING");
        runAuthSequence();
    };

    const runAuthSequence = () => {
        setAuthLog([]);
        const steps = [
            "ESTABLISHING_SECURE_LINK...",
            "VERIFYING_ENCRYPTION_KEYS...",
            "BYPASSING_FIREWALL...",
            "ACCESS_GRANTED // WELCOME_COMMANDER"
        ];

        let delay = 0;
        steps.forEach((step, index) => {
            delay += 800 + Math.random() * 500;
            setTimeout(() => {
                setAuthLog(prev => [...prev, step]);
                if (index === steps.length - 1) {
                    setTimeout(() => setSystemState("MODE_SELECT"), 1000);
                }
            }, delay);
        });
    };

    // Nav Handlers
    const deployLive = () => {
        window.location.href = "/v1-rg/live";
    };

    const initiateMock = () => {
        window.location.href = "/v1-rg/mock";
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white font-mono selection:bg-white selection:text-black">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover cinematic-bg"
                >
                    <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Hologram Overlay (HUD Projection) */}
            <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-50">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/decoration/hologram_overlay.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Global Overlays */}
            <div className="scanlines" />
            <div className="vignette" />

            {/* Header */}
            <header className="relative z-30 border-b border-white/20 p-6 flex justify-between items-center backdrop-blur-sm bg-black/20">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">NOMIA // CENTER</h1>
                    <p className="text-[10px] opacity-70 tracking-[0.4em] mt-1">OPERATIONAL_DASHBOARD_V2</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[9px] tracking-widest opacity-50">NET_STATUS</span>
                        <span className="text-xs font-bold text-green-500">[ CONNECTED ]</span>
                    </div>
                    <button className="p-3 border border-white/20 hover:bg-white hover:text-black transition-colors rounded-none">
                        <Settings className="w-4 h-4" />
                    </button>
                    <Link href="/" className="p-3 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-colors rounded-none">
                        <Power className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-30 p-12 flex flex-col items-center justify-center min-h-[60vh]">
                <AnimatePresence mode="wait">

                    {/* STEP 1: DASHBOARD INDEX */}
                    {systemState === "IDLE" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {/* V1-RG Card */}
                            <motion.div
                                onClick={() => handleUnitClick("v1-rg")}
                                onHoverStart={() => setHovered("v1-rg")}
                                onHoverEnd={() => setHovered(null)}
                                className="group relative h-80 bg-black/40 border border-white/20 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-white invert-logic"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] tracking-widest">[ ONLINE ]</span>
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter mb-2">V1-RG</h2>
                                    <p className="text-xs opacity-60 leading-relaxed border-l border-current pl-3">
                                        Mobile Robotics Unit.<br />
                                        Telemetry & Control Interface.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Placeholder Cards */}
                            <div className="h-80 border border-white/10 flex flex-col items-center justify-center opacity-30 bg-[url('/assets/grid.png')]">
                                <Database className="w-8 h-8 mb-4" />
                                <span className="text-[10px] tracking-[0.2em]">VOID_X [OFFLINE]</span>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: HANDSHAKE ANIMATION */}
                    {systemState === "AUTHENTICATING" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-lg border-t border-b border-white/20 bg-black/80 backdrop-blur-xl p-12 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white animate-scan" />
                            <div className="space-y-4 font-mono text-sm">
                                {authLog.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="text-green-500">{">"}</span>
                                        <span>{log}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 h-1 w-full bg-white/10 relative overflow-hidden">
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-white"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: MODE SELECTOR */}
                    {systemState === "MODE_SELECT" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-6 w-full max-w-2xl"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold tracking-[0.2em] mb-2">MISSION_READY</h2>
                                <p className="text-xs opacity-50 tracking-widest">SELECT OPERATION PARAMETERS</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={deployLive}
                                    className="group invert-logic border border-white p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300"
                                >
                                    <Radio className="w-12 h-12" />
                                    <div className="text-center">
                                        <span className="block text-xl font-black tracking-tighter mb-1">DEPLOY_LIVE</span>
                                        <span className="text-[9px] tracking-widest opacity-60 group-hover:opacity-100">HARDWARE_LINK_V1</span>
                                    </div>
                                </button>

                                <button
                                    onClick={initiateMock}
                                    className="group invert-logic border border-white/40 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300"
                                >
                                    <Terminal className="w-12 h-12" />
                                    <div className="text-center">
                                        <span className="block text-xl font-black tracking-tighter mb-1">MOCK_CORE</span>
                                        <span className="text-[9px] tracking-widest opacity-60 group-hover:opacity-100">SIMULATION_ENV</span>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setSystemState("IDLE")}
                                className="mt-8 text-[10px] tracking-widest opacity-40 hover:opacity-100 transition-opacity text-center uppercase"
                            >
                                [ Abort Sequence ]
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* Footer Info */}
            <footer className="fixed bottom-0 w-full p-4 border-t border-white/10 z-30 flex justify-between items-center text-[8px] tracking-[0.2em] opacity-40 bg-black">
                <span>SECURE_CONN_ESTABLISHED</span>
                <span>SYSTEM_ID: NOMIA-PRIME</span>
            </footer>

        </div>
    );
}
