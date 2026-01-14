"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Telemetry {
    cpu_temp: number;
    uptime: string;
    ultra_dist: number;
    volt: string;
    logs: string[];
}

export default function V1RGData() {
    const [isLoading, setIsLoading] = useState(true);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        cpu_temp: 45,
        uptime: "00:00:00",
        ultra_dist: 120,
        volt: "11.1V",
        logs: [],
    });

    const [history, setHistory] = useState({
        dist: Array(50).fill(20),
        cpu: Array(50).fill(20)
    });

    const [startTime] = useState(Date.now());
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Initial Loading
        const loadTimer = setTimeout(() => setIsLoading(false), 2500);

        // 2. Data Simulation Interval (100ms for smooth graphs)
        const dataInterval = setInterval(() => {
            const time = Date.now() / 1000;

            // Organic data simulation
            const distBase = 150 + Math.sin(time) * 50;
            const distNoise = (Math.random() - 0.5) * 40;
            const newDist = Math.floor(Math.max(0, distBase + distNoise));

            const cpuBase = 45 + Math.cos(time * 0.5) * 5;
            const cpuNoise = (Math.random() - 0.5) * 4;
            const newCpu = Math.floor(Math.max(0, cpuBase + cpuNoise));

            const newUptime = new Date(Date.now() - startTime).toISOString().substr(11, 8);

            setTelemetry(prev => {
                const newLogs = [...prev.logs];
                newLogs.push(`TELEMETRY_SYNC: ${newDist}mm | ${newCpu}°C`);
                if (newLogs.length > 30) newLogs.shift();

                return {
                    ...prev,
                    ultra_dist: newDist,
                    cpu_temp: newCpu,
                    uptime: newUptime,
                    logs: newLogs
                };
            });

            setHistory(prev => {
                const newDistHist = [...prev.dist, mapValue(newDist, 0, 300, 40, 0)];
                const newCpuHist = [...prev.cpu, mapValue(newCpu, 30, 70, 40, 0)];
                if (newDistHist.length > 50) newDistHist.shift();
                if (newCpuHist.length > 50) newCpuHist.shift();
                return { dist: newDistHist, cpu: newCpuHist };
            });

            // Scroll logs
            if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
        }, 100);

        return () => {
            clearTimeout(loadTimer);
            clearInterval(dataInterval);
        };
    }, []);

    const mapValue = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
        return (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };

    const getSparklinePaths = (data: number[]) => {
        const points = data.map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            return `${x},${v}`;
        });
        const path = `M ${points.join(' L ')}`;
        const fill = `${path} L 100,40 L 0,40 Z`;
        return { path, fill };
    };

    const distSpark = useMemo(() => getSparklinePaths(history.dist), [history.dist]);
    const cpuSpark = useMemo(() => getSparklinePaths(history.cpu), [history.cpu]);

    return (
        <div className="relative min-h-screen bg-black text-white font-mono uppercase overflow-x-hidden selection:bg-white selection:text-black">

            {/* ATMOSPHERIC OVERLAYS */}
            <div className="overlay scanlines fixed inset-0 z-[100] pointer-events-none opacity-30" />

            {/* LOADING OVERLAY */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="text-xs font-bold tracking-[0.5em] animate-pulse">DECRYPTING_DATA_STREAM...</div>
                        <div className="w-[150px] h-[2px] bg-white/10 mt-5 relative overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 bg-white"
                                style={{ background: "repeating-linear-gradient(90deg, #fff 0, #fff 10px, transparent 10px, transparent 12px)", boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                            />
                        </div>
                        <div className="text-[8px] opacity-40 mt-2 tracking-widest">ANALYZING_TELEMETRY</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 min-h-screen flex flex-col p-6 space-y-6">

                {/* HEADER */}
                <header className="flex-shrink-0 flex justify-between items-start">
                    <div className="flex items-end gap-8">
                        <div className="flex flex-col">
                            <div className="text-[0.5rem] tracking-[1em] opacity-30 mb-1 ml-1">DEEP_DATA_ANALYTICS</div>
                            <h1 className="text-6xl font-black tracking-[-0.05em] leading-none">V1-RG</h1>
                        </div>
                        <div className="h-12 w-[1px] bg-white/10 mb-1" />
                        <div className="space-y-3 mb-1">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black tracking-[0.2em]">DATA_MATRIX</span>
                                <div className="w-12 h-[1px] bg-white/20" />
                            </div>
                        </div>
                    </div>

                    <nav className="flex gap-2 text-white">
                        <Link href="/robots/v1-rg/live" className="status-tag border-white/20 hover:bg-white hover:text-black transition-all">[01: TERMINAL]</Link>
                        <Link href="/robots/v1-rg/data" className="status-tag bg-white text-black border-white">[02: DATA_MATRX]</Link>
                        <Link href="/robots/v1-rg" className="status-tag border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all">[03: SYS_EXIT]</Link>
                    </nav>
                </header>

                {/* MAIN DATA GRID */}
                <main className="flex-grow grid grid-cols-12 gap-6 overflow-hidden">

                    {/* Telemetry Matrix (Left) */}
                    <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">

                        {/* Ultra Distance Card */}
                        <div className="terminal-panel p-6 flex flex-col justify-between h-32 relative group overflow-hidden">
                            <div className="relative z-10 pointer-events-none">
                                <span className="text-[8px] opacity-40 tracking-widest">ULTRA_DISTANCE</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{telemetry.ultra_dist}</span>
                                    <span className="text-[10px] opacity-30">mm</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 top-8 opacity-60">
                                <svg className="w-full h-10 sparkline" preserveAspectRatio="none" viewBox="0 0 100 40">
                                    <defs>
                                        <linearGradient id="grad-dist" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 0.2 }} />
                                            <stop offset="100%" style={{ stopColor: '#fff', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <path d={distSpark.fill} fill="url(#grad-dist)" stroke="none" />
                                    <path d={distSpark.path} fill="none" stroke="#fff" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </div>
                        </div>

                        {/* CPU Temp Card */}
                        <div className="terminal-panel p-6 flex flex-col justify-between h-32 relative group overflow-hidden">
                            <div className="relative z-10 pointer-events-none">
                                <span className="text-[8px] opacity-40 tracking-widest">CPU_TEMP_LOAD</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{telemetry.cpu_temp}</span>
                                    <span className="text-[10px] opacity-30">°C</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 top-8 opacity-60">
                                <svg className="w-full h-10 sparkline" preserveAspectRatio="none" viewBox="0 0 100 40">
                                    <defs>
                                        <linearGradient id="grad-cpu" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 0.2 }} />
                                            <stop offset="100%" style={{ stopColor: '#fff', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <path d={cpuSpark.fill} fill="url(#grad-cpu)" stroke="none" />
                                    <path d={cpuSpark.path} fill="none" stroke="#fff" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </div>
                        </div>

                        {/* Uptime Card */}
                        <div className="terminal-panel p-6 flex flex-col justify-between h-32">
                            <span className="text-[8px] opacity-40 tracking-widest">SYS_UPTIME</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black">{telemetry.uptime}</span>
                            </div>
                            <div className="text-[8px] text-green-500 opacity-60">STATUS: NOMINAL</div>
                        </div>

                        {/* Hardware Specs Table */}
                        <div className="col-span-1 md:col-span-3 terminal-panel p-6">
                            <span className="text-xs font-bold tracking-widest mb-4 block">HARDWARE_SPECS_MATRIX</span>
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="text-left opacity-40">
                                        <th className="border border-white/10 p-2">COMPONENT</th>
                                        <th className="border border-white/10 p-2">VALUE</th>
                                        <th className="border border-white/10 p-2">STATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-white/10 p-2">MCU</td>
                                        <td className="border border-white/10 p-2">ESP32-C3</td>
                                        <td className="border border-white/10 p-2 text-green-500">[ OK ]</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-white/10 p-2">MAIN_PROC</td>
                                        <td className="border border-white/10 p-2">RPi5_4GB</td>
                                        <td className="border border-white/10 p-2 text-green-500">[ OK ]</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-white/10 p-2">LIPO_V</td>
                                        <td className="border border-white/10 p-2">{telemetry.volt}</td>
                                        <td className="border border-white/10 p-2">[ ACTIVE ]</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-white/10 p-2">I/O_GPIO_01</td>
                                        <td className="border border-white/10 p-2">HIGH</td>
                                        <td className="border border-white/10 p-2 text-green-500">[ NOMINAL ]</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Data Stream */}
                        <div className="col-span-1 md:col-span-3 terminal-panel p-6 h-48 flex flex-col">
                            <span className="text-xs font-bold tracking-widest mb-4 block">RAW_DATA_STREAM_TERMINAL</span>
                            <div ref={logContainerRef} className="flex-grow overflow-y-auto font-mono text-[9px] opacity-60 space-y-1 scrollbar-hide">
                                {telemetry.logs.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="opacity-30">{">"}</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Technical Blueprint (Right) */}
                    <div className="col-span-12 lg:col-span-4 terminal-panel relative overflow-hidden flex items-center justify-center bg-white/[0.02] min-h-[400px]">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <video className="w-full h-full object-contain opacity-80 mix-blend-screen" autoPlay muted loop playsInline>
                                <source src="/decoration/hologram_overlay2.mp4" type="video/mp4" />
                            </video>

                            {/* Tactical Corners */}
                            <div className="absolute top-4 left-4 w-6 h-6 border-t font-thin border-l border-white/30" />
                            <div className="absolute top-4 right-4 w-6 h-6 border-t font-thin border-r border-white/30" />
                            <div className="absolute bottom-4 left-4 w-6 h-6 border-b font-thin border-l border-white/30" />
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b font-thin border-r border-white/30" />

                            <div className="absolute bottom-6 text-[8px] tracking-[.5em] opacity-40">TECHNICAL_BLUEPRINT_VIEW</div>
                        </div>
                    </div>
                </main>

                <footer className="flex-shrink-0 border-t border-white/10 pt-4 flex justify-between items-center text-[8px] opacity-30 tracking-widest">
                    <span>UNAUTHORIZED_ACCESS_PROHIBITED</span>
                    <span>PHANTOM_DATA_MATRIX_V1.0</span>
                    <span>{new Date().toISOString()}</span>
                </footer>

            </div>

            <style jsx global>{`
        .scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%);
          background-size: 100% 4px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        .terminal-panel:hover {
          border-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>

        </div>
    );
}
