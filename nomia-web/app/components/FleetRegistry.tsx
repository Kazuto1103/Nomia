"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Cpu, ShieldAlert, Activity, ArrowRight, CornerDownLeft, MousePointer2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Robot Data Config
const ROBOTS = [
    {
        id: "V1-RG",
        name: "V1-RG",
        status: "ONLINE",
        class: "EXPLORER",
        desc: "Autonomous exploration unit with ultra-proximity sensors.",
        icon: Cpu,
        color: "text-blue-400"
    },
    {
        id: "K4ZU",
        name: "K4ZU",
        status: "ENCRYPTED",
        class: "HEAVY_COMBAT",
        desc: "Heavy assault unit. Security clearance level 5 required.",
        icon: ShieldAlert,
        color: "text-red-400"
    },
    {
        id: "ZN-01",
        name: "ZN-01",
        status: "WAIT_LIST",
        class: "STEALTH",
        desc: "Advanced reconnaissance and stealth operations unit.",
        icon: Activity,
        color: "text-emerald-400"
    }
];

export default function FleetRegistry() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Physics State (Refs for performance/loop)
    const state = useRef({
        position: 0,
        target: 0,
        velocity: 0,
        isDragging: false,
        startX: 0,
        lastX: 0
    });

    const [activeIndex, setActiveIndex] = useState(0);

    // Animation Loop
    useEffect(() => {
        let rAF = 0;

        const update = () => {
            const s = state.current;

            // 1. Physics: Spring/Lerp Position to Target
            if (!s.isDragging) {
                // ROULETTE PHYSICS (Balanced)
                // 0.95 provides a smooth glide that settles predictably
                s.velocity *= 0.95;
                s.target += s.velocity;

                // 2. Snap-to-Center (Magnetism)
                // Engage when momentum slows down to ensure we land ON a card
                if (Math.abs(s.velocity) < 0.05) {
                    const snapTarget = Math.round(s.target);
                    const dist = snapTarget - s.target;

                    // Smooth visual landing
                    s.target += dist * 0.1;

                    // Kill residual velocity if very close
                    if (Math.abs(dist) < 0.001) s.velocity = 0;
                }
            }

            // Lerp actual position to target (smooth follower)
            s.position += (s.target - s.position) * 0.1;

            // 2. Render Cards
            const total = ROBOTS.length;

            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Circular Buffer Logic
                // We want i to be centered when position is i.
                // relativePos = i - position
                let relativePos = (i - s.position);

                // Wrap around logic for infinite scroll
                // If relativePos is too far right (> total/2), shift it left (subtract total)
                while (relativePos > total / 2) relativePos -= total;
                while (relativePos < -total / 2) relativePos += total;

                // Visual Transforms
                const xPos = relativePos * 350; // Horizontal spread
                const absPos = Math.abs(relativePos);

                // Opacity/Scale/Z-Index curve
                const scale = Math.max(0, 1 - absPos * 0.15); // Slight shrink
                const opacity = 1 - Math.pow(absPos, 1.5) * 0.35; // Fade out sides
                const zIndex = 100 - Math.round(absPos * 10);
                const rotateY = relativePos * -25; // Rotate inward to face center
                const blur = Math.max(0, absPos * 5); // Blur distant cards

                // Apply
                card.style.transform = `translate3d(${xPos}px, 0, ${-absPos * 150}px) rotateY(${rotateY}deg) scale(${scale})`;
                card.style.opacity = `${Math.max(0, opacity)}`;
                card.style.zIndex = `${zIndex}`;
                card.style.filter = `blur(${blur}px)`;

                // Highlight border if center
                if (absPos < 0.5) {
                    card.classList.add('border-white/80', 'shadow-[0_0_50px_rgba(255,255,255,0.2)]');
                    card.classList.remove('border-white/20');
                    const spinner = document.getElementById(`spinner-${i}`);
                    if (spinner) spinner.classList.add('animate-spin-slow');
                } else {
                    card.classList.remove('border-white/80', 'shadow-[0_0_50px_rgba(255,255,255,0.2)]');
                    card.classList.add('border-white/20');
                    const spinner = document.getElementById(`spinner-${i}`);
                    if (spinner) spinner.classList.remove('animate-spin-slow');
                }
            });

            rAF = requestAnimationFrame(update);
        };

        update();
        return () => cancelAnimationFrame(rAF);
    }, []);

    // Interaction Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        state.current.isDragging = true;
        state.current.startX = e.clientX;
        state.current.lastX = e.clientX;
        state.current.velocity = 0;
        // Capture pointer to handle dragging outside container
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!state.current.isDragging) return;

        const deltaX = e.clientX - state.current.lastX;
        state.current.lastX = e.clientX;

        // Convert pixel delta to position delta
        const moveScale = 0.003;
        state.current.target -= deltaX * moveScale * 1.5;

        state.current.position = state.current.target; // Direct tracking during drag

        // MOMENTUM TRANSFER:
        // Huge multiplier for heavy flywheel feel
        state.current.velocity = -deltaX * moveScale * 2.5;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        state.current.isDragging = false;
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    // Wheel Handler
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // IGNORE Vertical Scroll (Let the page scroll naturally)
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

            // Handle Horizontal Scroll / Swipe
            e.preventDefault();

            const wheelScale = 0.003;
            state.current.target += e.deltaX * wheelScale;
            state.current.velocity += e.deltaX * wheelScale * 0.1;
        };

        const leftPanel = container.querySelector(".holo-interact-zone");
        if (leftPanel) {
            leftPanel.addEventListener("wheel", handleWheel as any, { passive: false });
            return () => leftPanel.removeEventListener("wheel", handleWheel as any);
        }
    }, []);

    // Sync active ID to Input (Debounced by loop visuals, but we need exact ID)
    useEffect(() => {
        const interval = setInterval(() => {
            const s = state.current;
            const total = ROBOTS.length;
            let idx = Math.round(s.position) % total;
            if (idx < 0) idx += total;
            if (idx !== activeIndex) setActiveIndex(idx);
        }, 200); // Polling for React state sync (low cost)
        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleDeploy = () => {
        const robot = ROBOTS[activeIndex];
        if (robot) router.push(`/robots/${robot.id.toLowerCase()}`);
    };

    return (
        <div
            className="flex flex-col md:flex-row min-h-[80vh] w-full max-w-7xl mx-auto items-center justify-center relative z-10"
            ref={containerRef}
        >
            {/* LEFT: HOLO-DECK (Physics Carousel) */}
            <div
                className="holo-interact-zone w-full md:w-1/2 h-[600px] relative perspective-1000 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Luminescent Glow for Background Atmosphere */}
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

                <div className="relative w-full h-full flex items-center justify-center preserve-3d">
                    {ROBOTS.map((robot, i) => {
                        const Icon = robot.icon;
                        return (
                            <div
                                key={robot.id}
                                ref={(el: HTMLDivElement | null) => { cardsRef.current[i] = el; }}
                                className={`
                                    absolute w-[320px] h-[450px]
                                    bg-black border border-white/20
                                    flex flex-col justify-between p-8
                                    select-none pointer-events-none
                                    backdrop-blur-md will-change-transform
                                `}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Holographic Header */}
                                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                    <Icon className={`w-8 h-8 ${robot.color} opacity-80`} />
                                    <div className="text-[10px] text-right space-y-1">
                                        <div className="tracking-widest opacity-50">CLASS: {robot.class}</div>
                                        <div className={`font-bold tracking-widest ${robot.status === 'ONLINE' ? 'text-green-500' : 'text-white/40'}`}>
                                            [{robot.status}]
                                        </div>
                                    </div>
                                </div>

                                {/* Wireframe Model Placeholder */}
                                <div className="flex-1 flex items-center justify-center my-4 opacity-60">
                                    <div id={`spinner-${i}`} className={`w-32 h-32 border border-dashed text-white/20 rounded-full flex items-center justify-center transition-all duration-500`}>
                                        <div className="w-20 h-20 border border-dotted border-white/40 rounded-full" />
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div>
                                    <h3 className="text-4xl font-black tracking-tighter mb-2">{robot.name}</h3>
                                    <p className="text-[9px] uppercase tracking-widest opacity-50 leading-relaxed">
                                        {robot.desc}
                                    </p>
                                    <div className="mt-4 flex justify-between items-center text-[8px] opacity-30">
                                        <span>ID: {robot.id}_SYS</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Horizontal Scroll Hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] text-white/30 tracking-[0.2em] animate-pulse pointer-events-none">
                    <MousePointer2 className="w-4 h-4" />
                    <span>DRAG_TO_ROTATE_SYSTEM</span>
                </div>
            </div>

            {/* RIGHT: COMMAND TERMINAL */}
            <div className="w-full md:w-1/2 p-8 md:pl-20 flex flex-col justify-center h-full relative z-20 pointer-events-auto">
                <div className="space-y-12">
                    <div className="border-l-2 border-white/20 pl-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-2">
                            FLEET<br />REGISTRY
                        </h2>
                        <p className="text-xs tracking-[0.4em] opacity-40 uppercase">
                            Phantom_OS // System_Call
                        </p>
                    </div>

                    {/* Input System */}
                    <div className="relative group">
                        <label className="text-[10px] tracking-[0.2em] text-white/40 block mb-4">
                             // TARGET_LOCKED_ON
                        </label>

                        <div className="relative flex items-center">
                            <span className="text-4xl md:text-5xl font-mono text-white/30 mr-4">{">"}</span>
                            <div className="text-4xl md:text-6xl font-black tracking-tighter text-white font-mono uppercase">
                                {ROBOTS[activeIndex]?.id || "SEARCHING..."}
                            </div>
                            <div className="absolute right-0 bottom-4 animate-pulse opacity-50">
                                <CornerDownLeft className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Dynamic Feedback */}
                        <div className="mt-4 h-8">
                            <div className="text-green-500 text-[10px] tracking-[0.3em] flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                UNIT_SYNCED // READY_TO_DEPLOY
                            </div>
                        </div>
                    </div>

                    {/* Deployment Action */}
                    <button
                        onClick={handleDeploy}
                        className="mt-8 border border-white px-8 py-4 text-sm font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all uppercase flex items-center gap-4 group w-fit"
                    >
                        [ DEPLOY_UNIT ]
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
            `}</style>
        </div>
    );
}
