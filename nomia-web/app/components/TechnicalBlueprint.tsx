"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FrameCorners } from "@arwes/react";
import { Zap, Activity, Cpu, Database, Scan, Disc } from "lucide-react";
import { useScrambleText } from "@/app/hooks/useScrambleText";

// --- Sub-component: Live Data Stream ---
const DataStream = ({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) => {
    const scrambledValue = useScrambleText(value, 1500); // Continuous updates if we re-trigger? 
    // Actually useScrambleText runs once. For "Live" feel, we might want a loop, but let's stick to initial scramble + pulsing for now to save perf.

    return (
        <div className="flex justify-between items-center text-[9px] font-mono tracking-[0.2em] border-b border-white/10 py-1">
            <span className="opacity-50">{label}</span>
            <span className={`${color} font-bold`}>{scrambledValue}</span>
        </div>
    );
};

// --- Hotspot Data ---
const HOTSPOTS = [
    { id: 1, x: 30, y: 30, label: "NEURAL_ENGINE", value: "V4.02", desc: "Synaptic weighting efficiency at 99.8%." },
    { id: 2, x: 70, y: 40, label: "QUANTUM_CORE", value: "STABLE", desc: "Zero-point energy extraction nominal." },
    { id: 3, x: 40, y: 70, label: "OPTIC_MATRIX", value: "ONLINE", desc: "LIDAR array active. Range: 400m." },
    { id: 4, x: 60, y: 60, label: "COOLING_SYS", value: "-240°C", desc: "Liquid helium circulation optimal." },
];

export default function TechnicalBlueprint() {
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

    return (
        <div className="w-full relative min-h-[600px] flex items-center justify-center p-4">

            {/* BACKGROUND GRID (Blueprint Paper) */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* MAIN CONTAINER: Asymmetrical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8 w-full max-w-7xl items-center relative z-10">

                {/* LEFT DATA COLUMN */}
                <div className="hidden lg:flex flex-col gap-8 items-end text-right">
                    <div className="space-y-1 w-full">
                        <h4 className="text-xs font-black tracking-[0.4em] mb-4 border-b-2 border-white/20 pb-2">SYS_TELEMETRY</h4>
                        <DataStream label="CPU_TEMP" value="42.5°C" />
                        <DataStream label="MEM_HEAP" value="12.4GB" />
                        <DataStream label="UPTIME" value="99.9%" color="text-green-400" />
                        <DataStream label="NET_LAT" value="12ms" />
                    </div>

                    <div className="relative p-4 border border-white/10 w-full mt-8">
                        <div className="absolute top-0 right-0 p-1 bg-white text-black text-[8px] font-bold">LIVE</div>
                        <Activity className="w-full h-12 text-white/20 animate-pulse" />
                    </div>
                </div>

                {/* CENTER: EXPLODED SCHEMATIC */}
                <div className="relative flex items-center justify-center py-12 lg:py-0">
                    {/* Arwes Frame Wrapper */}
                    <div className="absolute inset-0 z-0 opacity-30">
                        {/* Note: FrameSVGCorners needs width/height/element logic usually, but we can position it absolutely if container has size */}
                        <FrameCorners strokeWidth={1} />
                    </div>

                    {/* CORE ASSET */}
                    <div className="relative w-64 h-64 md:w-96 md:h-96">
                        {/* Rotating Rings (Cosmetic) */}
                        <div className="absolute inset-0 border border-dotted border-white/20 rounded-full animate-spin-slow pointer-events-none" />
                        <div className="absolute inset-[10%] border border-dashed border-white/20 rounded-full animate-spin-slow-reverse pointer-events-none" />

                        {/* HOVER IMAGE */}
                        <div className="relative w-full h-full flex items-center justify-center group">
                            {/* Glow Behind */}
                            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                            <img
                                src="/decoration/hologram_rubik.gif"
                                alt="Core Logic"
                                className="w-4/5 h-4/5 object-contain grayscale contrast-125 opacity-80 mix-blend-lighten transition-all duration-500 group-hover:scale-105 group-hover:brightness-125"
                            />

                            {/* HOTSPOTS LAYER */}
                            {HOTSPOTS.map((spot) => (
                                <div
                                    key={spot.id}
                                    className="absolute w-4 h-4 cursor-pointer z-50 group/spot"
                                    style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                    onMouseEnter={() => setActiveHotspot(spot.id)}
                                    onMouseLeave={() => setActiveHotspot(null)}
                                    data-cursor="ANALYZE"
                                >
                                    {/* Pulsing Dot */}
                                    <div className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping" />
                                    <div className="absolute inset-1 bg-white rounded-full shadow-[0_0_10px_white]" />

                                    {/* Line & Details (Absolute relative to spot) */}
                                    <AnimatePresence>
                                        {activeHotspot === spot.id && (
                                            <>
                                                {/* Connector Line (SVG) */}
                                                <motion.svg
                                                    className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{ width: '200px', height: '2px' }}
                                                >
                                                    {/* Draw line to the right or left based on x position? Let's just go Right for simplicity or dynamic */}
                                                    <motion.line
                                                        x1="0" y1="0" x2={spot.x > 50 ? "-100" : "100"} y2="0"
                                                        stroke="white"
                                                        strokeWidth="1"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                    <motion.circle cx={spot.x > 50 ? "-100" : "100"} cy="0" r="2" fill="white" />
                                                </motion.svg>

                                                {/* Details Box */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: spot.x > 50 ? -20 : 20 }}
                                                    animate={{ opacity: 1, x: spot.x > 50 ? -110 : 110 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`
                                                        absolute top-1/2 -translate-y-1/2 w-48 
                                                        bg-black/90 border border-white/40 p-3 
                                                        backdrop-blur-md text-left
                                                        ${spot.x > 50 ? 'right-0' : 'left-0'}
                                                    `}
                                                    style={{ zIndex: 100 }}
                                                >
                                                    <h5 className="text-[10px] font-black tracking-widest text-white mb-1">{spot.label}</h5>
                                                    <div className="text-[9px] text-white/70 font-mono mb-2">STATUS: <span className="text-green-400">{spot.value}</span></div>
                                                    <p className="text-[8px] leading-relaxed opacity-50 uppercase">{spot.desc}</p>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT DATA COLUMN */}
                <div className="hidden lg:flex flex-col gap-8 justify-start">
                    <div className="space-y-1 w-full">
                        <h4 className="text-xs font-black tracking-[0.4em] mb-4 border-b-2 border-white/20 pb-2">MODULE_STATUS</h4>
                        <DataStream label="GYRO_X" value="+0.002" />
                        <DataStream label="GYRO_Y" value="-0.041" />
                        <DataStream label="GYRO_Z" value="+1.102" />
                        <DataStream label="POWER" value="NOMINAL" />
                    </div>

                    {/* Scan Graphic */}
                    <div className="mt-8 border border-white/10 p-4 flex flex-col items-center gap-2">
                        <Scan className="w-8 h-8 text-white/40 animate-pulse" />
                        <span className="text-[8px] tracking-[0.3em] uppercase opacity-50 text-center">Scanning Pattern Alpha</span>
                    </div>
                </div>

            </div>

            {/* Mobile simplified view label */}
            <div className="lg:hidden absolute bottom-4 text-[9px] tracking-[0.2em] opacity-50">
                TAP POINTS TO ANALYZE
            </div>
        </div>
    );
}
