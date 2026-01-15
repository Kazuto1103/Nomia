"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, ArrowRight, Activity, Terminal, ShieldAlert, Info, Zap, AlertTriangle, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechaTechSpecs from "./components/MechaTechSpecs";
import ScrollDecoration from "./components/ScrollDecoration";
import ModeSelector from "./components/ModeSelector";
import dynamic from "next/dynamic";

const FloatingWarpSystem = dynamic(() => import("./components/FloatingWarpSystem"), { ssr: false });
const LoadingScreen = dynamic(() => import("./components/LoadingScreen"), { ssr: false });
import Lenis from "lenis";

// Register GSAP Plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NomiaLanding() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [handshakeComplete, setHandshakeComplete] = useState(false);

  // References for the 6 layers
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  const layer5Ref = useRef<HTMLDivElement>(null);
  const layer6Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handshakeComplete) return;

    const ctx = gsap.context(() => {
      // SCROLL-BOUND LAYERING (SCROLLYTELLING)
      const layers = [layer1Ref.current, layer2Ref.current, layer3Ref.current, layer4Ref.current, layer5Ref.current, layer6Ref.current];

      layers.forEach((layer, i) => {
        if (!layer) return;

        // Staggered reveal for each layer
        gsap.from(layer.querySelectorAll(".reveal-content"), {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          scrollTrigger: {
            trigger: layer,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        });

        // Parallax depth for background elements in layers
        gsap.to(layer.querySelector(".parallax-bg"), {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });

      // Special animation for Layer 4 & 5 (Propaganda)
      gsap.to(".propaganda-scroll", {
        xPercent: -20,
        scrollTrigger: {
          trigger: layer4Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      // ENTRY SEQUENCE (MODULAR REVEAL)
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      // 1. Initial State: Hide everything except NOMIA title
      gsap.set(".atmospheric-bg, .hud-tagline, .floating-warp-container, .layer-border", { opacity: 0 });

      // 2. NOMIA Title Flicker (Anchor)
      tl.to(".hud-flicker-main", {
        opacity: 0,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "none"
      });

      // 3. Staggered "Boot-up" Flicker for components (Smoother overlap)
      tl.to(".atmospheric-bg", {
        opacity: 0.4, // Persistent visibility
        duration: 0.1,
        repeat: 4,
        yoyo: true,
        ease: "none",
        onComplete: () => {
          gsap.to(".atmospheric-bg", { opacity: 0.4, duration: 1 });
        }
      }, "-=0.2"); // Overlap with title flicker

      tl.to(".hud-tagline, .layer-border", {
        opacity: 1,
        duration: 0.05,
        stagger: {
          each: 0.1,
          from: "random"
        },
        repeat: 1,
        yoyo: true,
        ease: "none",
        onComplete: () => {
          gsap.to(".hud-tagline, .layer-border", { opacity: 1, duration: 0.5 });
        }
      }, "-=0.3");

      tl.to(".floating-warp-container", {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      }, "-=0.8");

    }, containerRef);


    return () => ctx.revert();
  }, [handshakeComplete]);

  useEffect(() => {
    if (!handshakeComplete) return;

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    ScrollTrigger.refresh();
    return () => lenis.destroy();
  }, [handshakeComplete]);

  const navigateToTerminal = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/robots/v1-rg");
    }, 500);
  };

  if (!handshakeComplete) {
    return <LoadingScreen onComplete={() => setHandshakeComplete(true)} />;
  }

  return (
    <main ref={containerRef} className="relative bg-black text-white font-mono selection:bg-white selection:text-black overflow-x-hidden">

      {/* GLOBAL ATMOSPHERIC LAYERS */}
      <div className="atmospheric-bg fixed inset-0 z-0 pointer-events-none opacity-30 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale opacity-80">
          <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="scanlines fixed inset-0 pointer-events-none z-[1000] opacity-30" />
      <div className="noise-overlay fixed inset-0 z-[999]" />
      <div className="vignette fixed inset-0 z-[998]" />


      {/* FLOATING WARP SYSTEM (Orchestrated) */}
      <div className="floating-warp-container">
        <FloatingWarpSystem />
      </div>

      {/* LAYER 1: THE CORE (IDENTITY) */}
      <section ref={layer1Ref} className="layer-border relative z-20 min-h-screen flex flex-col items-center justify-center p-6 border-b border-white/5">
        <div className="reveal-content flex flex-col items-center">
          <div className="hud-tagline mb-8 flex items-center gap-6 opacity-30">
            <span className="h-[1px] w-24 bg-white"></span>
            <span className="text-[12px] tracking-[0.8em] uppercase">NOMIA // CORE_SYSTEM_AUTHENTICATED</span>
            <span className="h-[1px] w-24 bg-white"></span>
          </div>

          <h1 className="text-9xl md:text-[12vw] font-black leading-none tracking-tighter mix-blend-difference glow-text hud-flicker-main">
            NOMIA
          </h1>

          <div className="hud-tagline mt-16 max-w-3xl text-center space-y-8 hud-flicker">

            <p className="text-lg md:text-2xl font-bold tracking-tighter uppercase glow-text">
              UNMANNED EFFICIENCY.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-xs opacity-40 leading-relaxed tracking-[0.3em] uppercase max-w-xl mx-auto">
              As long as the Sun, the Moon, and the Earth exist, everything will be fine.
            </p>
          </div>
        </div>
      </section>

      {/* LAYER 2: FLEET REGISTRY */}
      <section ref={layer2Ref} className="relative z-20 py-48 px-6 md:px-20 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto reveal-content">
          <div className="mb-32 flex justify-between items-end border-b border-white/10 pb-12">
            <div>
              <h2 className="text-6xl font-black tracking-tighter">FLEET_REGISTRY</h2>
              <p className="text-xs tracking-[0.5em] opacity-30 mt-4">PHANTOM_CLASS_UNITS_ONLY</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-widest opacity-40">U_ID</p>
              <p className="text-4xl font-mono">RG_TOTAL</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* V1-RG (ACTIVE) */}
            <div
              onClick={() => router.push("/robots/v1-rg")}
              className="group relative min-h-[400px] border border-white/10 bg-black/60 overflow-hidden invert-logic cursor-pointer p-8 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Cpu className="w-12 h-12 opacity-40" />
                <div className="text-right">
                  <div className="text-[10px] tracking-widest bg-white/10 px-2 py-1 mb-2">STATUS: ONLINE</div>
                  <div className="text-[8px] opacity-50 font-mono">0x2F3A1B</div>
                </div>
              </div>

              <div>
                <h3 className="text-4xl font-black tracking-tighter mb-4">V1-RG</h3>
                <p className="text-[10px] opacity-60 leading-relaxed font-sans max-w-sm uppercase">
                  Autonomous exploration unit with ultra-proximity sensors and real-time telemetry uplink.
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <button onClick={(e) => { e.stopPropagation(); setShowTechSpecs(true); }} className="flex items-center gap-3 text-[8px] tracking-[0.4em] uppercase hover:underline">
                  <Database className="w-4 h-4" /> [ VIEW_blueprints ]
                </button>
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* K4ZU Variation */}
            <div className="relative min-h-[400px] border border-white/5 bg-black/20 p-8 flex flex-col justify-between opacity-40 grayscale group hover:opacity-100 transition-all border-dashed">
              <div className="flex justify-between items-start">
                <ShieldAlert className="w-12 h-12 opacity-20" />
                <div className="text-right text-[8px] opacity-50 font-mono">ENC_SYS_0X1</div>
              </div>
              <div className="text-center py-12">
                <h3 className="text-3xl font-black tracking-tighter mb-2">K4ZU</h3>
                <p className="text-[8px] tracking-[0.6em] uppercase opacity-40">Heavy Combat Variation</p>
                <div className="mt-4 inline-block px-3 py-1 border border-white/20 text-[8px]">ENCRYPTED</div>
              </div>
              <div className="pt-8 border-t border-white/5 text-[8px] tracking-widest opacity-20">ACCESS_DENIED</div>
            </div>

            {/* ZN-01 Variation */}
            <div className="relative min-h-[400px] border border-white/5 bg-black/20 p-8 flex flex-col justify-between opacity-40 grayscale group hover:opacity-100 transition-all border-dashed">
              <div className="flex justify-between items-start">
                <Activity className="w-12 h-12 opacity-20" />
                <div className="text-right text-[8px] opacity-50 font-mono">ENC_SYS_0X2</div>
              </div>
              <div className="text-center py-12">
                <h3 className="text-3xl font-black tracking-tighter mb-2">ZN-01</h3>
                <p className="text-[8px] tracking-[0.6em] uppercase opacity-40">Stealth Recon Unit</p>
                <div className="mt-4 inline-block px-3 py-1 border border-white/20 text-[8px]">WAIT_LIST</div>
              </div>
              <div className="pt-8 border-t border-white/5 text-[8px] tracking-widest opacity-20">ACCESS_DENIED</div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 3: TECHNICAL BLUEPRINTS */}
      <section ref={layer3Ref} className="relative z-20 py-48 px-6 border-b border-white/5 bg-black">
        <div className="reveal-content max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -inset-10 bg-white/5 blur-3xl rounded-full" />
            <div className="relative border border-white/20 p-4 aspect-square flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/decoration/hologram_overlay2.mp4')] opacity-20 mix-blend-screen" />
              <Zap className="w-64 h-64 text-white opacity-10 animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full border border-white/5 grid grid-cols-12 grid-rows-12">
                {[...Array(144)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/5" />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-12">
            <div className="inline-block border border-white px-6 py-2">
              <span className="text-xs font-bold tracking-[1em] uppercase">TECH_ANALYSIS</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none">SENSOR_GRID & <br /> CORE_LOGIC</h2>
            <div className="grid grid-cols-2 gap-8 text-[10px] font-mono opacity-50">
              <div className="space-y-4">
                <p>LIDAR: ENABLED [360deg]</p>
                <p>PROXIMITY: SONY_PX90</p>
                <p>UPLINK: 400.2MHz</p>
              </div>
              <div className="space-y-4">
                <p>OS: NOMIA_V3_DEV</p>
                <p>KERNEL: 0x99281</p>
                <p>THREADS: OPTIMIZED</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 4: PROPAGANDA I */}
      <section ref={layer4Ref} className="relative z-20 py-64 h-screen overflow-hidden bg-white text-black flex items-center">
        <div className="propaganda-scroll flex gap-20 whitespace-nowrap">
          {[...Array(5)].map((_, i) => (
            <h2 key={i} className="text-[18vh] font-black tracking-tighter leading-none">
              NOMIA // DANGER // PROTOCOL // Dystopian.Industrial.Automated. //
            </h2>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none">
          <div className="flex justify-between uppercase font-black text-4xl">
            <span className="vertical-text">WARNING_SYSTEM</span>
            <span className="vertical-text">DATA_CORRUPTION</span>
          </div>
          <div className="flex justify-between uppercase font-black text-4xl">
            <span className="vertical-text">REPLICANT_DETECTED</span>
            <span className="vertical-text">CORE_STABILITY_0X00</span>
          </div>
        </div>
      </section>

      {/* LAYER 5: PROPAGANDA II (DENSE QUOTES) */}
      <section ref={layer5Ref} className="relative z-20 py-48 bg-black overflow-hidden">
        {/* Layer 5 Background Decoration - Mirrored & Right Aligned */}
        <div className="absolute -top-[10%] -bottom-[10%] inset-x-0 z-0 pointer-events-none opacity-20 parallax-bg overflow-hidden">
          <img
            src="/decoration/bg_decoration_eva.jpeg"
            alt="EVA Decoration"
            className="w-full h-full object-cover grayscale dim-glow-animation scale-x-[-1] object-right"
          />
        </div>

        <div className="reveal-content px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-32 relative z-10">
          <div className="space-y-12">
            <div className="propaganda-block w-fit text-2xl md:text-3xl whitespace-nowrap">SLAY. SCAVANGE. SURVIVE</div>
            <div className="propaganda-block w-fit text-2xl md:text-3xl whitespace-nowrap">THE STARLESS EMPTINESS YOU FEEL</div>
            <div className="text-[10px] opacity-30 tracking-[0.5em] leading-[2] uppercase max-w-sm">
              The boy wished to his death. The other one fulfilled this wish. And the final angel perished.
            </div>
          </div>
          <div className="flex flex-col justify-end items-end space-y-8 text-right">
            {/* Moon Hologram with Parallax Resonance */}
            <div className="w-32 h-32 md:w-48 md:h-48 relative overflow-hidden parallax-bg">
              <img
                src="/decoration/hologram_moon.gif"
                alt="Moon Hologram"
                className="w-full h-full object-contain grayscale opacity-60 dim-glow-animation"
              />
            </div>
            <h3 className="text-6xl font-black tracking-tighter leading-none">FLY ME <br />TO THE MOON</h3>
            <div className="h-2 w-full bg-white/30" />
            <p className="text-xs uppercase tracking-[1em] opacity-40">Everything Return To Nothingness</p>
          </div>
        </div>
      </section>

      {/* LAYER 6: FOOTER SYSTEM (GATEWAY) */}
      <section ref={layer6Ref} className="relative z-20 min-h-screen flex flex-col items-center justify-center bg-white text-black p-12 overflow-hidden">
        {/* Layer 6 Background Inverted */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden grayscale invert">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-none"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0,0,0)',
              perspective: '1000px'
            }}
          >
            <source src="/decoration/hologram_overlay.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="reveal-content max-w-4xl text-center space-y-10 relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <ShieldAlert className="w-12 h-12 mx-auto" />
          <h2 className="text-[6vw] font-black tracking-tighter leading-none">PHANTOM_TERMINAL</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button onClick={navigateToTerminal} className="border-[3px] border-black px-8 py-4 text-sm font-black tracking-widest hover:bg-black hover:text-white transition-all invert-logic">
              [ INITIALIZE_TERMINAL ]
            </button>
            <div className="text-left md:border-l-[3px] border-black pl-8 flex items-center">
              <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
                Direct access to experimental robot nodes. <br />
                Authorization level 05 required.
              </p>
            </div>
          </div>
          <div className="pt-24 flex justify-between items-center text-[9px] font-black tracking-[0.4em] opacity-40 border-t border-black/10">
            <span>NOMIA // HUB // V2.0</span>
            <span>© KAZUTO // 2026</span>
          </div>
        </div>
      </section>

      {/* FIXED HUD COMPONENTS */}
      <div className="fixed top-8 left-8 z-[60] mix-blend-difference pointer-events-none opacity-50">
        <div className="text-[8px] tracking-[1em]">SYSTEM_UPTIME: 99:21:44</div>
      </div>
      <div className="fixed bottom-8 left-8 z-[60] mix-blend-difference pointer-events-none opacity-50">
        <div className="text-[8px] tracking-[1em]">LAT: 35.6895 LON: 139.6917</div>
      </div>

      {/* POPUPS & DECORATIONS */}
      <MechaTechSpecs isOpen={showTechSpecs} onClose={() => setShowTechSpecs(false)} />
      <ScrollDecoration />
      <ModeSelector isOpen={showModeSelector} onClose={() => setShowModeSelector(false)} />

      {/* NAVIGATION GLITCH OVERLAY */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-white pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uWU0WMrQmURwEc/giphy.gif')] opacity-50 mix-blend-difference bg-repeat" />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes hud-flicker {
          0% { opacity: 0.1; }
          4% { opacity: 0.8; }
          8% { opacity: 0.2; }
          12% { opacity: 0.9; }
          16% { opacity: 0.3; }
          20% { opacity: 1; }
          100% { opacity: 1; }
        }
        .hud-flicker {
          animation: hud-flicker 0.8s ease-in-out forwards;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        @keyframes dim-glow {
          0% { filter: brightness(0.5) contrast(1.2); opacity: 0.3; }
          50% { filter: brightness(1.0) contrast(1.4); opacity: 0.6; }
          100% { filter: brightness(0.5) contrast(1.2); opacity: 0.3; }
        }
        .dim-glow-animation {
          animation: dim-glow 4s ease-in-out infinite;
        }
      `}</style>

    </main>
  );
}
