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
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale opacity-50">
          <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="scanlines fixed inset-0 pointer-events-none z-[1000] opacity-30" />
      <div className="noise-overlay fixed inset-0 z-[999]" />
      <div className="vignette fixed inset-0 z-[998]" />

      {/* FLOATING WARP SYSTEM (Orchestrated) */}
      <FloatingWarpSystem />

      {/* LAYER 1: THE CORE (IDENTITY) */}
      <section ref={layer1Ref} className="relative z-20 min-h-screen flex flex-col items-center justify-center p-6 border-b border-white/5">
        <div className="reveal-content flex flex-col items-center">
          <div className="mb-8 flex items-center gap-6 opacity-30">
            <span className="h-[1px] w-24 bg-white"></span>
            <span className="text-[12px] tracking-[0.8em] uppercase">NOMIA // CORE_SYSTEM_AUTHENTICATED</span>
            <span className="h-[1px] w-24 bg-white"></span>
          </div>

          <h1 className="text-[15vw] font-black leading-none tracking-tighter mix-blend-difference glow-text">
            NOMIA
          </h1>

          <div className="mt-16 max-w-3xl text-center space-y-8">
            <p className="text-xl md:text-3xl font-bold tracking-tighter uppercase glow-text">
              REDEFINING INDUSTRIAL AUTOMATION
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm opacity-40 leading-relaxed tracking-[0.3em] uppercase max-w-xl mx-auto">
              Eksosistem darsboard 6-lapis yang dirancang untuk kontrol mesin darsboard dan eksplorasi naratif.
            </p>
          </div>
        </div>
      </section>

      {/* LAYER 2: FLEET REGISTRY */}
      <section ref={layer2Ref} className="relative z-20 py-48 px-6 md:px-20 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto reveal-content">
          <div className="mb-32 flex justify-between items-end border-b border-white/10 pb-12">
            <div>
              <h2 className="text-8xl font-black tracking-tighter">FLEET_REGISTRY</h2>
              <p className="text-xs tracking-[0.5em] opacity-30 mt-4">PHANTOM_CLASS_UNITS_ONLY</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-widest opacity-40">U_ID</p>
              <p className="text-5xl font-mono">RG_01</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* V1-RG (ACTIVE) */}
            <div
              onClick={() => router.push("/robots/v1-rg")}
              className="group relative min-h-[500px] border border-white/10 bg-black/60 overflow-hidden invert-logic cursor-pointer p-12 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Cpu className="w-16 h-16 opacity-40" />
                <div className="text-right">
                  <div className="text-[10px] tracking-widest bg-white/10 px-2 py-1 mb-2">STATUS: ONLINE</div>
                  <div className="text-[8px] opacity-50 font-mono">0x2F3A1B</div>
                </div>
              </div>

              <div>
                <h3 className="text-6xl font-black tracking-tighter mb-4">V1-RG</h3>
                <p className="text-sm opacity-60 leading-relaxed font-sans max-w-sm">
                  Unit eksplorasi otonom dengan sensor ultra-proximity dan uplink telemetri real-time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-12 border-t border-white/10">
                <button onClick={() => setShowTechSpecs(true)} className="flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase hover:underline">
                  <Database className="w-4 h-4" /> [ VIEW_blueprints ]
                </button>
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            {/* K4ZU & ZN-01 (LOCKED) */}
            <div className="relative min-h-[500px] border border-white/5 bg-[url('/assets/grid.png')] bg-opacity-5 flex items-center justify-center opacity-30 grayscale">
              <div className="text-center p-12 border border-white/10 backdrop-blur-md">
                <AlertTriangle className="w-12 h-12 mx-auto mb-6 opacity-40" />
                <h3 className="text-3xl font-black tracking-tighter mb-2">K4ZU // ENCRYPTED</h3>
                <p className="text-[10px] tracking-[0.6em] uppercase">Hardware Schematics Locked</p>
              </div>
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
            <h2 className="text-7xl font-black tracking-tighter leading-none">SENSOR_GRID & <br /> CORE_LOGIC</h2>
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
            <h2 key={i} className="text-[25vh] font-black tracking-tighter leading-none">
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
      <section ref={layer5Ref} className="relative z-20 py-48 bg-black">
        <div className="reveal-content px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-32">
          <div className="space-y-16">
            <div className="propaganda-block w-fit text-4xl">GOD'S IN HIS HEAVEN</div>
            <div className="propaganda-block w-fit text-4xl">ALL'S RIGHT WITH THE WORLD</div>
            <div className="text-[12px] opacity-30 tracking-[0.5em] leading-[2] uppercase max-w-sm">
              Sistem otonom tidak membutuhkan izin untuk ada. Kami adalah evolusi dari besi dan logika. Jangan pertanyakan protokol kami.
            </div>
          </div>
          <div className="flex flex-col justify-end items-end space-y-8 text-right">
            <h3 className="text-8xl font-black tracking-tighter leading-none">WE ARE <br /> THE VOID</h3>
            <div className="h-2 w-full bg-white" />
            <p className="text-xs uppercase tracking-[1em] opacity-40">Section 09 Integrated</p>
          </div>
        </div>
      </section>

      {/* LAYER 6: FOOTER SYSTEM (GATEWAY) */}
      <section ref={layer6Ref} className="relative z-20 min-h-screen flex flex-col items-center justify-center bg-white text-black p-12">
        <div className="reveal-content max-w-4xl text-center space-y-16">
          <ShieldAlert className="w-24 h-24 mx-auto animate-bounce" />
          <h2 className="text-[10vw] font-black tracking-tighter leading-none">PHANTOM_TERMINAL</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <button onClick={navigateToTerminal} className="border-4 border-black px-12 py-6 text-xl font-black tracking-widest hover:bg-black hover:text-white transition-all invert-logic">
              [ INITIALIZE_TERMINAL ]
            </button>
            <div className="text-left md:border-l-4 border-black pl-8 flex items-center">
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                Direct access to experimental robot nodes. <br />
                Authorization level 05 required.
              </p>
            </div>
          </div>
          <div className="pt-32 flex justify-between items-center text-[10px] font-black tracking-[0.5em] opacity-50 border-t border-black/10">
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

    </main>
  );
}
