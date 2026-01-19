"use client";

import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { Activity, Wifi, MapPin, Disc } from "lucide-react";

export default function FixedHUD() {
    // 1. MOUSE PARALLAX (VISOR EFFECT)
    const x = useSpring(0, { stiffness: 40, damping: 15 });
    const y = useSpring(0, { stiffness: 40, damping: 15 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const cx = innerWidth / 2;
            const cy = innerHeight / 2;

            // Normalized values (-1 to 1)
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            // Shift HUD slightly opposite to mouse (Inverse Parallax)
            // Max shift: 15px
            x.set(-dx * 15);
            y.set(-dy * 15);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [x, y]);

    // 2. SYSTEM UPTIME LOGIC
    const [time, setTime] = useState({ h: 99, m: 21, s: 44, ms: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => {
                let { h, m, s, ms } = prev;
                ms += 4; // Fast tick
                if (ms >= 100) { ms = 0; s++; }
                if (s >= 60) { s = 0; m++; }
                if (m >= 60) { m = 0; h++; }
                return { h, m, s, ms };
            });
        }, 40);
        return () => clearInterval(interval);
    }, []);

    // Format helper
    const fmt = (n: number) => n.toString().padStart(2, '0');

    // 3. NETWORK LATENCY SIMULATION
    const [latency, setLatency] = useState(12);
    useEffect(() => {
        const interval = setInterval(() => {
            // Random fluctuate between 10ms and 24ms
            setLatency(Math.floor(Math.random() * (24 - 10 + 1) + 10));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* TOP LEFT: UPTIME */}
            <motion.div
                style={{ x, y }}
                className="fixed top-8 left-8 z-[60] mix-blend-difference pointer-events-none opacity-50 flex items-center gap-4"
            >
                <div className="w-1 h-1 bg-white animate-pulse" />
                <div className="text-[8px] tracking-[0.2em] font-mono">
                    SYS_UPTIME <span className="font-bold">{fmt(time.h)}:{fmt(time.m)}:{fmt(time.s)}:{fmt(time.ms)}</span>
                </div>
            </motion.div>

            {/* TOP RIGHT: NETWORK STATUS */}
            <motion.div
                style={{ x, y }}
                className="fixed top-8 right-8 z-[60] mix-blend-difference pointer-events-none opacity-50 text-right flex flex-col items-end gap-1"
            >
                <div className="flex items-center gap-2 text-[8px] tracking-[0.2em] font-mono">
                    <Wifi className="w-3 h-3" />
                    <span>NET_LAT: {latency}ms</span>
                </div>
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-1 h-3 ${i <= 3 ? 'bg-white' : 'bg-white/20'}`} />
                    ))}
                </div>
            </motion.div>

            {/* BOTTOM LEFT: COORDINATES */}
            <motion.div
                style={{ x, y }}
                className="fixed bottom-8 left-8 z-[60] mix-blend-difference pointer-events-none opacity-50 flex items-end gap-4"
            >
                <MapPin className="w-3 h-3 mb-0.5" />
                <div className="text-[8px] tracking-[0.2em] font-mono leading-tight">
                    LAT: 35.6895 <br />
                    LON: 139.6917
                </div>
            </motion.div>

            {/* BOTTOM RIGHT: AUDIO VISUALIZER / MEMORY */}
            <motion.div
                style={{ x, y }}
                className="fixed bottom-8 right-8 z-[60] mix-blend-difference pointer-events-none opacity-50 flex items-end gap-2"
            >
                <div className="text-[8px] tracking-[0.2em] font-mono mb-1 mr-2 text-right">
                    AUDIO_V7<br />ACTIVE
                </div>
                <div className="flex items-end gap-[2px] h-8">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-white"
                            animate={{ height: ["20%", "80%", "40%"] }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
                <Disc className="w-4 h-4 animate-spin-slow ml-2" />
            </motion.div>
        </>
    );
}
