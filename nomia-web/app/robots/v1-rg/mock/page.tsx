"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Telemetry {
    cpu_temp: number;
    uptime: string;
    ultra_dist: number;
    mode: string;
    logs: string[];
}

export default function V1RGMock() {
    const [isLoading, setIsLoading] = useState(true);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        cpu_temp: 42,
        uptime: "00:00:00",
        ultra_dist: 250,
        mode: "BOOTING",
        logs: [],
    });
    const [logExpanded, setLogExpanded] = useState(true);
    const [startTime] = useState(Date.now());
    const lastStateIndexRef = useRef(-1);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const v1Ref = useRef<HTMLVideoElement>(null);
    const v2Ref = useRef<HTMLVideoElement>(null);

    const mock_states = [
        { mode: 'PATROL_ACTIVE', dist: 350, temp: 48, logs: ['[SYS] PATROL_UNIT_01_ENGAGED', '[NAV] CALCULATING_GRID_8', '[SNR] OBSTACLE_CLEAR'] },
        { mode: 'EMERGENCY_HALT', dist: 42, temp: 65, logs: ['[CRT] COLLISION_AVOIDANCE', '[SYS] EMERGENCY_STOP', '[SNR] DISTANCE_ALERT'] },
        { mode: 'DOCKING_STN', dist: 110, temp: 41, logs: ['[NAV] DOCKING_ALIGNMENT', '[SYS] POWER_SYNC_READY', '[COM] DOCK_HANDSHAKE'] }
    ];

    useEffect(() => {
        // 1. Initial Loading
        const loadTimer = setTimeout(() => setIsLoading(false), 2500);

        // 2. Simulation Loop
        const simInterval = setInterval(() => {
            const stateIndex = Math.floor((Date.now() - startTime) / 5000) % 3;
            const s = mock_states[stateIndex];

            setTelemetry(prev => {
                const newLogs = [...prev.logs];
                if (stateIndex !== lastStateIndexRef.current) {
                    s.logs.forEach(l => {
                        newLogs.push(l);
                        if (newLogs.length > 20) newLogs.shift();
                    });
                    lastStateIndexRef.current = stateIndex;
                }

                return {
                    mode: s.mode,
                    ultra_dist: s.dist + Math.floor(Math.random() * 20),
                    cpu_temp: s.temp + Math.floor(Math.random() * 5),
                    uptime: new Date(Date.now() - startTime).toISOString().substr(11, 8),
                    logs: newLogs
                };
            });

            // Scroll log to bottom
            if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
        }, 500);

        // 3. Video Loop
        initSmoothLoop();

        return () => {
            clearTimeout(loadTimer);
            clearInterval(simInterval);
        };
    }, []);

    const initSmoothLoop = () => {
        const v1 = v1Ref.current;
        const v2 = v2Ref.current;
        if (!v1 || !v2) return;

        v1.muted = v2.muted = true;
        let activeVid = v1;
        let nextVid = v2;

        const transition = () => {
            nextVid.currentTime = 0;
            nextVid.play().then(() => {
                nextVid.style.opacity = "1";
                activeVid.style.opacity = "0";
                [activeVid, nextVid] = [nextVid, activeVid];
                scheduleTransition();
            }).catch(() => {
                activeVid.currentTime = 0;
                scheduleTransition();
            });
        };

        const scheduleTransition = () => {
            const checkPos = () => {
                if (activeVid.duration > 0 && activeVid.duration - activeVid.currentTime < 1.5) {
                    activeVid.removeEventListener("timeupdate", checkPos);
                    transition();
                }
            };
            activeVid.addEventListener("timeupdate", checkPos);
        };

        v1.play().then(() => scheduleTransition()).catch(() => {
            window.addEventListener("click", () => {
                v1.play();
                scheduleTransition();
            }, { once: true });
        });
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-mono uppercase overflow-hidden flex flex-col selection:bg-white selection:text-black">

            {/* ATMOSPHERIC OVERLAYS */}
            <div className="overlay scanlines fixed inset-0 z-[100] pointer-events-none opacity-50" />
            <div className="overlay vignette fixed inset-0 z-[100] pointer-events-none" />

            {/* LOADING OVERLAY */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-mono"
                    >
                        <div className="text-xs font-bold tracking-[0.5em] animate-pulse">ESTABLISHING_SIMULATION...</div>
                        <div className="w-[150px] h-[2px] bg-white/10 mt-5 relative overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 bg-white"
                                style={{ background: "repeating-linear-gradient(90deg, #fff 0, #fff 10px, transparent 10px, transparent 12px)", boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                            />
                        </div>
                        <div className="text-[8px] opacity-40 mt-2 tracking-widest">LOADING_MOCK_CORE</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CROSSFADE VIDEO ENGINE */}
            <video ref={v1Ref} className="fixed inset-0 min-w-full min-h-full object-cover grayscale contrast-140 brightness-[0.35] z-0 opacity-100 transition-opacity duration-[2000ms]" muted playsInline autoPlay>
                <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
            </video>
            <video ref={v2Ref} className="fixed inset-0 min-w-full min-h-full object-cover grayscale contrast-140 brightness-[0.35] z-0 opacity-0 transition-opacity duration-[2000ms]" muted playsInline>
                <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
            </video>

            {/* INTERFACE CONTENT */}
            <div className="relative z-10 h-screen flex flex-col p-6 space-y-4">

                {/* HEADER */}
                <header className="flex-shrink-0 flex justify-between items-start">
                    <div className="flex items-end gap-8">
                        <div className="flex flex-col">
                            <div className="text-[0.5rem] tracking-[1em] opacity-30 mb-1 ml-1">AUTONOMOUS-PROJECT</div>
                            <h1 className="text-6xl font-black tracking-[-0.05em] leading-none">NOMIA</h1>
                        </div>
                        <div className="h-12 w-[1px] bg-white/10 mb-1" />
                        <div className="space-y-3 mb-1">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black tracking-[0.2em]">V1-RG // SIMULATION</span>
                                <div className="w-12 h-[1px] bg-white/20" />
                            </div>
                            <div className="flex gap-3">
                                <span className="status-tag text-green-500 border-green-500">[ STATUS: ACTIVE ]</span>
                                <span className="status-tag text-yellow-500 border-yellow-500">[ MODE: SIMULATION ]</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 text-white">
                        <nav className="flex gap-2">
                            <Link href="/robots/v1-rg/mock" className="status-tag bg-white text-black border-white">[01: TERMINAL]</Link>
                            <Link href="/robots/v1-rg/data" className="status-tag border-white/20 hover:bg-white hover:text-black transition-all">[02: DATA_MATRX]</Link>
                            <Link href="/robots/v1-rg" className="status-tag border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all">[03: SYS_EXIT]</Link>
                        </nav>
                        <div className="flex gap-6">
                            <div className="text-right">
                                <div className="text-[8px] opacity-40 mb-1 tracking-widest">MOCK_THERMAL</div>
                                <div className="text-2xl font-bold font-mono">{telemetry.cpu_temp}°C</div>
                            </div>
                            <div className="w-[1px] h-10 bg-white/20" />
                            <div className="text-right">
                                <div className="text-[8px] opacity-40 mb-1 tracking-widest">MOCK_UPTIME</div>
                                <div className="text-2xl font-bold font-mono">{telemetry.uptime}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN RADAR & STATUS */}
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-hidden">
                    <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-8">
                        <div className="w-full max-w-xl space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-[10px] tracking-[0.4em] opacity-60">DISTANCE_RADAR_SCANNER</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{telemetry.ultra_dist}</span>
                                    <span className="text-xs opacity-50">MM</span>
                                </div>
                            </div>
                            <div className="progress-container h-1 bg-white/5 border border-white/20 relative">
                                <motion.div
                                    className="progress-bar absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_#fff]"
                                    animate={{ width: `${Math.min(100, (telemetry.ultra_dist / 500) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin [animation-duration:10s]" />
                            <div className="absolute inset-4 border border-white/10 rounded-full animate-spin [animation-duration:15s] direction-reverse" />
                            <div className="text-center z-10">
                                <div className="text-[8px] tracking-[1em] opacity-50 mb-2">STATE</div>
                                <div className="text-2xl font-black tracking-tighter px-6 py-2 border border-white">
                                    {telemetry.mode}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SIMULATION LOG */}
                    <div className="lg:col-span-4 h-full flex flex-col relative justify-center">
                        <motion.div
                            initial={false}
                            animate={{ x: logExpanded ? 0 : "110%", opacity: logExpanded ? 1 : 0 }}
                            className="terminal-panel h-[16rem] p-6 flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                <span className="text-xs font-bold tracking-widest">MOCKUP_LOG_STREAM</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-1 bg-yellow-500 animate-pulse" />
                                    <button onClick={() => setLogExpanded(false)} className="text-[8px] hover:text-red-400 transition-colors">
                                        [ COLLAPSE ]
                                    </button>
                                </div>
                            </div>
                            <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2 font-mono text-[9px] scrollbar-hide">
                                {telemetry.logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity">
                                        <span className="opacity-30">{new Date().toLocaleTimeString('en-GB')}</span>
                                        <span className="text-white/80">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        {!logExpanded && (
                            <button onClick={() => setLogExpanded(true)} className="absolute inset-y-0 right-0 py-8 px-2 text-[8px] font-bold tracking-[.5em] hover:bg-white hover:text-black border border-white/20 bg-black/80 transition-all [writing-mode:vertical-lr] rotate-180">
                                OPEN_LOG_STREAM [+]
                            </button>
                        )}
                    </div>
                </main>

                {/* FOOTER STATUS PANELS */}
                <footer className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-3 gap-8 pb-4">
                    <div className="terminal-panel p-4 text-center">
                        <div className="text-[8px] opacity-40 mb-2">SIMULATION_SPEED</div>
                        <div className="text-xs font-bold tracking-widest text-white">1.5x [ACCELERATED]</div>
                    </div>
                    <div className="terminal-panel p-4 text-center">
                        <div className="text-[8px] opacity-40 mb-2">MOCK_CORE_LOAD</div>
                        <div className="text-xs font-bold tracking-widest">24% [STABLE]</div>
                    </div>
                    <div className="terminal-panel p-4 text-center">
                        <div className="text-[8px] opacity-40 mb-2">DATA_PACKET_LOSS</div>
                        <div className="text-xs font-bold tracking-widest text-green-500">0.00% [PERFECT]</div>
                    </div>
                </footer>

            </div>

            <style jsx global>{`
        .scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%);
          background-size: 100% 4px;
        }
        .vignette {
          background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.9) 150%);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .direction-reverse {
          animation-direction: reverse;
        }
        .status-tag {
          font-size: 0.6rem;
          padding: 2px 10px;
          border: 1px solid currentColor;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .terminal-panel {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px) saturate(180%);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .terminal-panel:hover {
          border-color: rgba(255, 255, 255, 0.6);
        }
      `}</style>

        </div>
    );
}
