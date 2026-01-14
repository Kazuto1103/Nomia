"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Telemetry {
    cpu_temp: string | number;
    uptime: string;
    ultra_dist: number;
    mode: string;
    logs: string[];
}

export default function V1RGLive() {
    const [connected, setConnected] = useState(false);
    const [triggerGlitch, setTriggerGlitch] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        cpu_temp: "--",
        uptime: "00:00:00",
        ultra_dist: 0,
        mode: "OFFLINE",
        logs: [],
    });
    const [logExpanded, setLogExpanded] = useState(true);

    const wsRef = useRef<WebSocket | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const v1Ref = useRef<HTMLVideoElement>(null);
    const v2Ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // 1. Initial Loading
        const loadTimer = setTimeout(() => setIsLoading(false), 2500);

        // 2. WebSocket Connection
        connectWS();

        // 3. Glitch Interval
        const glitchInterval = setInterval(() => {
            if (!connected) {
                setTriggerGlitch(true);
                setTimeout(() => setTriggerGlitch(false), 150);
            }
        }, 2500);

        // 4. Keyboard Listeners
        const handleKeyDown = (e: KeyboardEvent) => {
            const keys: Record<string, string> = { w: "FWD", s: "BWD", a: "LEFT", d: "RIGHT" };
            if (keys[e.key.toLowerCase()]) {
                sendCmd("CMD_MOVE", keys[e.key.toLowerCase()]);
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        // 5. Video Loop initialization
        initSmoothLoop();

        return () => {
            clearTimeout(loadTimer);
            clearInterval(glitchInterval);
            window.removeEventListener("keydown", handleKeyDown);
            wsRef.current?.close();
        };
    }, [connected]);

    const connectWS = () => {
        try {
            const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
            const ws = new WebSocket(`ws://${hostname}:8080/ws`);
            wsRef.current = ws;

            ws.onopen = () => setConnected(true);
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setTelemetry(data);
                // Scroll log to bottom
                if (logContainerRef.current) {
                    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                }
            };
            ws.onclose = () => {
                setConnected(false);
                setTelemetry((prev) => ({ ...prev, mode: "LINK_LOST" }));
                setTimeout(connectWS, 2000);
            };
        } catch (e) {
            console.warn("WebSocket Connection Failed:", e);
            setConnected(false);
            setTelemetry((prev) => ({ ...prev, mode: "OFFLINE" }));
        }
    };

    const sendCmd = (action: string, value = "") => {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
        fetch(`http://${hostname}:8080/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, value }),
        }).catch(err => console.error("Command Error:", err));
    };

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
        <div className={`relative min-h-screen bg-black text-white font-mono uppercase overflow-hidden flex flex-col transition-colors duration-100 selection:bg-white selection:text-black ${(!connected || triggerGlitch) ? 'glitch-active' : ''} ${!connected ? 'invert-warning' : ''}`}>

            {/* ATMOSPHERIC OVERLAYS */}
            <div className="overlay scanlines fixed inset-0 z-[100] pointer-events-none opacity-50" />
            <div className="overlay vignette fixed inset-0 z-[100] pointer-events-none" />

            {/* CINEMATIC LOADING OVERLAY */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="text-xs font-bold tracking-[0.5em] animate-pulse">INITIALIZING_LINK...</div>
                        <div className="w-[150px] h-[2px] bg-white/10 mt-5 relative overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 bg-white"
                                style={{ background: "repeating-linear-gradient(90deg, #fff 0, #fff 10px, transparent 10px, transparent 12px)", boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                            />
                        </div>
                        <div className="text-[8px] opacity-40 mt-2 tracking-widest">STABILIZING_MATRIX</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CROSSFADE VIDEO ENGINE */}
            <video ref={v1Ref} className="fixed inset-0 min-w-full min-h-full object-cover grayscale contrast-150 brightness-[0.35] z-0 opacity-100 transition-opacity duration-[2000ms]" muted playsInline autoPlay>
                <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
            </video>
            <video ref={v2Ref} className="fixed inset-0 min-w-full min-h-full object-cover grayscale contrast-150 brightness-[0.35] z-0 opacity-0 transition-opacity duration-[2000ms]" muted playsInline>
                <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
            </video>

            {/* INTERFACE CONTENT */}
            <div className="relative z-10 h-screen flex flex-col p-6 space-y-4">

                {/* HEADER */}
                <header className="flex-shrink-0 flex justify-between items-start">
                    <div className="flex items-end gap-8">
                        <div className="flex flex-col">
                            <div className="text-[0.5rem] tracking-[1em] opacity-30 mb-1 ml-1">PROJECT_INITIATIVE</div>
                            <h1 className="text-6xl font-black tracking-[-0.05em] leading-none">NOMIA</h1>
                        </div>
                        <div className="h-12 w-[1px] bg-white/10 mb-1" />
                        <div className="space-y-3 mb-1">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black tracking-[0.2em]">V1-RG // LIVE</span>
                                <div className="w-12 h-[1px] bg-white/20" />
                            </div>
                            <div className="flex gap-3">
                                <span className={`status-tag ${connected ? 'text-white border-white' : 'text-red-500 border-red-500 font-bold animate-pulse'}`}>
                                    [ NETWORK: {connected ? 'STABLE' : 'LINK_LOST'} ]
                                </span>
                                <span className="status-tag text-green-500 border-green-500">[ MODE: LIVE ]</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 text-white">
                        <nav className="flex gap-2">
                            <Link href="/robots/v1-rg/live" className="status-tag bg-white text-black border-white">[01: TERMINAL]</Link>
                            <Link href="/robots/v1-rg/data" className="status-tag border-white/20 hover:bg-white hover:text-black transition-all">[02: DATA_MATRX]</Link>
                            <Link href="/robots/v1-rg" className="status-tag border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all">[03: SYS_EXIT]</Link>
                        </nav>
                        <div className="flex gap-6">
                            <div className="text-right">
                                <div className="text-[8px] opacity-40 mb-1 tracking-widest">THERMAL_SENS_01</div>
                                <div className="text-2xl font-bold font-mono">{telemetry.cpu_temp}°C</div>
                            </div>
                            <div className="w-[1px] h-10 bg-white/20" />
                            <div className="text-right">
                                <div className="text-[8px] opacity-40 mb-1 tracking-widest">SYS_UPTIME_SEC</div>
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
                                <div className="text-[8px] tracking-[1em] opacity-50 mb-2">STATUS</div>
                                <div className="text-2xl font-black tracking-tighter px-6 py-2 border border-white">
                                    {telemetry.mode}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MACHINE LOG */}
                    <div className="lg:col-span-4 h-full flex flex-col relative justify-center">
                        <motion.div
                            initial={false}
                            animate={{ x: logExpanded ? 0 : "110%", opacity: logExpanded ? 1 : 0 }}
                            className="terminal-panel h-[16rem] p-6 flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                <span className="text-xs font-bold tracking-widest">MACHINE_LOG</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        <div className={`w-1 h-1 ${connected ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                                        <div className="w-1 h-1 bg-white opacity-20" />
                                    </div>
                                    <button onClick={() => setLogExpanded(false)} className="text-[8px] hover:text-red-400 transition-colors">
                                        [ COLLAPSE_R ]
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

                {/* FOOTER CONTROLS */}
                <footer className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                    <button onClick={() => sendCmd('CMD_MODE', 'MANUAL')} className={`btn-mode terminal-panel py-6 flex flex-col items-center justify-center ${telemetry.mode === 'MANUAL' ? 'bg-white text-black border-white' : ''}`}>
                        <span className="text-[8px] opacity-40 mb-1">OPT_01</span>
                        <span className="text-sm font-black tracking-widest">MANUAL</span>
                    </button>
                    <button onClick={() => sendCmd('CMD_MODE', 'AUTO')} className={`btn-mode terminal-panel py-6 flex flex-col items-center justify-center ${telemetry.mode === 'AUTO' ? 'bg-white text-black border-white' : ''}`}>
                        <span className="text-[8px] opacity-40 mb-1">OPT_02</span>
                        <span className="text-sm font-black tracking-widest">AUTO_DRIVE</span>
                    </button>
                    <button onClick={() => sendCmd('CMD_MODE', 'DOCKING')} className={`btn-mode terminal-panel py-6 flex flex-col items-center justify-center ${telemetry.mode === 'DOCKING' ? 'bg-white text-black border-white' : ''}`}>
                        <span className="text-[8px] opacity-40 mb-1">OPT_03</span>
                        <span className="text-sm font-black tracking-widest">DOCK_STN</span>
                    </button>
                    <button onClick={() => sendCmd('CMD_TERMINATE')} className="btn-mode border border-red-500/50 bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-black py-6 flex flex-col items-center justify-center transition-all">
                        <span className="text-[8px] mb-1">HALT_00</span>
                        <span className="text-sm font-black tracking-widest">TERMINATE</span>
                    </button>
                </footer>

            </div>

            <style jsx global>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-3px, 1px); }
          50% { transform: translate(3px, -1px); filter: invert(0.1); }
          75% { transform: translate(-1px, -3px); }
          100% { transform: translate(0); }
        }
        .glitch-active {
          animation: glitch 0.2s linear infinite;
        }
        .invert-warning {
          filter: invert(1);
          background: black !important;
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
