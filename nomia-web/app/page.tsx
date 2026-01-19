"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, ArrowRight, Activity, Terminal, ShieldAlert, Info, Zap, AlertTriangle, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScrollDecoration from "./components/ScrollDecoration";
import ModeSelector from "./components/ModeSelector";
import dynamic from "next/dynamic";

const FloatingWarpSystem = dynamic(() => import("./components/FloatingWarpSystem"), { ssr: false });
const LoadingScreen = dynamic(() => import("./components/LoadingScreen"), { ssr: false });
const MechaTechSpecs = dynamic(() => import("./components/MechaTechSpecs"), { ssr: false });
const FleetRegistry = dynamic(() => import("./components/FleetRegistry"), { ssr: false });
const TechnicalBlueprint = dynamic(() => import("./components/TechnicalBlueprint"), { ssr: false });



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

        // Safe Check: Reveal Content
        const revealElements = layer.querySelectorAll(".reveal-content");
        if (revealElements.length > 0) {
          gsap.from(revealElements, {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            scrollTrigger: {
              trigger: layer,
              start: "top 80%",
              toggleActions: "play none none reverse",
            }
          });
        }

        // Parallax depth for background elements in layers
        const parallaxBg = layer.querySelector(".parallax-bg");
        if (parallaxBg) {
          gsap.to(parallaxBg, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: layer,
              start: "top bottom",
              end: "bottom top",
              scrub: true, // Direct mapping (no smoothing) to fix jitter
            }
          });
        }
      });

      // L4: CINEMATIC NARRATIVE PARALLAX
      const l4Blocks = layer4Ref.current?.querySelectorAll(".parallax-fragment");
      l4Blocks?.forEach((block, i) => {
        const speed = (i % 2 === 0) ? -50 : 50;
        gsap.to(block, {
          y: speed,
          ease: "none",
          scrollTrigger: {
            trigger: block,
            start: "top bottom",
            end: "bottom top",
            scrub: true, // Direct mapping (no smoothing) to fix jitter
          }
        });
      });

      // L4: Technical Line Growth
      gsap.from(".l4-technical-line", {
        scaleX: 0,
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: layer4Ref.current,
          start: "top 60%",
          end: "top 20%",
          scrub: true, // Direct mapping
        }
      });

      // Special animation for Layer 4 Horizontal Scrolling
      gsap.to(".propaganda-scroll-l4", {
        xPercent: -30,
        scrollTrigger: {
          trigger: layer4Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      // LUNAR HUD: Scroll-Triggered Rotation & Drift
      gsap.to(".moon-asset-parallax", {
        rotation: 2,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: layer5Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Lunar HUD Container: Subtle Scale Pulse
      gsap.to(".lunar-hud-container", {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: layer5Ref.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
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
    <main ref={containerRef} className="relative bg-transparent text-white font-mono selection:bg-white selection:text-black overflow-x-hidden">



      {/* FLOATING WARP SYSTEM (Orchestrated) */}
      <div className="floating-warp-container">
        <FloatingWarpSystem />
      </div>

      {/* LAYER 1: THE CORE (IDENTITY) */}
      {/* LAYER 1: THE CORE (IDENTITY) */}
      <section id="scene-1" ref={layer1Ref} className="layer-border relative z-20 min-h-screen flex flex-col items-center justify-center p-6 border-b border-white/5">
        <div className="reveal-content flex flex-col items-center">
          <div className="hud-tagline mb-8 flex items-center gap-6 opacity-30">
            <span className="h-[1px] w-24 bg-white"></span>
            <span className="text-[12px] tracking-[0.8em] uppercase">NOMIA // CORE_SYSTEM_AUTHENTICATED</span>
            <span className="h-[1px] w-24 bg-white"></span>
          </div>

          <h1
            className="text-9xl md:text-[12vw] font-black leading-none tracking-tighter mix-blend-difference glow-text hud-flicker-main"
          >
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
      {/* LAYER 2: FLEET REGISTRY */}
      <section id="scene-2" ref={layer2Ref} className="relative z-20 py-24 md:py-48 px-6 md:px-20 border-b border-white/5 bg-black/60 backdrop-blur-[20px] backdrop-brightness-50 min-h-screen flex items-center justify-center overflow-hidden">

        {/* L1->L2 VERTICAL UMBILICAL (Connector) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-px bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/20 px-2 py-1 text-[8px] tracking-[0.2em] text-white/50 uppercase">
          Sys_Handshake_Complete
        </div>

        {/* BACKGROUND TEXTURE (Grid) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        {/* CORNER BRACKETS (HUD) */}
        <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-white/30" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-white/30" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-white/30" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-white/30" />

        <FleetRegistry />

        {/* L2->L3 TRANSITION (Marquee) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden py-2 bg-white/5 border-t border-white/10">
          <div className="whitespace-nowrap animate-marquee text-[10px] tracking-[0.5em] text-white/30 font-bold flex gap-8">
            {[...Array(10)].map((_, i) => (
              <span key={i}>WARNING: RESTRICTED_SECTOR // AUTHORIZED_PERS_ONLY // 0xAF92 //</span>
            ))}
          </div>
        </div>
      </section>

      {/* LAYER 3: TECHNICAL BLUEPRINTS */}
      {/* LAYER 3: TECHNICAL BLUEPRINTS */}
      <section id="scene-3" ref={layer3Ref} className="relative z-20 py-24 md:py-48 px-6 border-b border-white/5 bg-transparent">
        <div className="reveal-content max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center space-y-4">
            <div className="inline-block border border-white px-6 py-2 mb-4">
              <span className="text-xs font-bold tracking-[1em] uppercase">TECH_ANALYSIS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
              SYSTEM_ARCHITECTURE <br /> <span className="opacity-50 text-2xl md:text-3xl">EXPLODED_VIEW // V1-RG</span>
            </h2>
          </div>

          <TechnicalBlueprint />
        </div>
      </section>

      {/* LAYER 4: CINEMATIC NARRATIVE OVERHAUL (SYSTEM_DATA_SMOG) */}
      {/* LAYER 4: CINEMATIC NARRATIVE OVERHAUL (SYSTEM_DATA_SMOG) */}
      <section id="scene-4" ref={layer4Ref} className="relative z-20 min-h-screen md:min-h-[220vh] bg-transparent text-black py-24 md:py-48 overflow-hidden flex flex-col">
        {/* Background Narrative Smog (Parallax Numbers) - Senior Designer Touch */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none font-black text-[30vw] leading-none flex flex-wrap gap-20 overflow-hidden">
          <span>09</span><span>21</span><span>88</span><span>00</span><span>44</span><span>12</span><span>67</span>
        </div>

        {/* Top Marquee (Cinematic Speed) */}
        <div className="propaganda-scroll-l4 flex gap-10 md:gap-20 whitespace-nowrap mb-24 md:mb-48 opacity-90 border-y-2 border-black py-4">
          {[...Array(5)].map((_, i) => (
            <h2 key={i} className="text-[6vh] md:text-[8vh] font-black tracking-tighter leading-none">
              NARRATIVE_FRAGMENT_ARCHIVE // NOMIA_CORE // SYSTEM_OVERRIDE // 0X_DATA_BLEED //
            </h2>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-20 space-y-32 md:space-y-96">

          {/* NARRATIVE NODE 01: NEON SMOG */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
            <div className="reveal-content flex flex-col parallax-fragment">
              <div className="text-[6rem] md:text-[12rem] font-black leading-none tracking-tighter opacity-10 -ml-4 md:-ml-12 mb-[-2rem] md:mb-[-6rem]">01</div>
              <div className="max-w-md border-l-4 border-black pl-8 space-y-8">
                <p className="text-xl md:text-2xl font-black leading-tight uppercase">
                  Neon flickers against slick, oil-stained pavement, casting rhythmic shadows over crowds tethered to pulsating wrist-interfaces.
                </p>
                <div className="l4-technical-line h-[1px] w-full bg-black opacity-20" />
                <p className="text-xs md:text-sm font-bold opacity-60 leading-relaxed uppercase">
                  Towering monolithic screens broadcast synthetic smiles and mandatory updates, drowning out the hollow hum of ventilation shafts that circulate recycled, metallic air.
                </p>
              </div>
            </div>

            <div className="reveal-content md:mt-96 max-w-sm parallax-fragment md:ml-auto">
              <div className="p-8 border-2 border-black flex flex-col gap-6">
                <div className="text-xs font-black tracking-[0.5em] bg-black text-white px-3 py-1 self-start">DATA_STREAM_A</div>
                <p className="text-sm md:text-lg font-bold leading-snug uppercase">
                  Data streams bleed into the atmosphere like invisible smog, harvesting every whispered thought and fleeting pulse for the insatiable appetite of the central grid.
                </p>
              </div>
            </div>
          </div>

          {/* NARRATIVE NODE 02: THE VOID */}
          <div className="flex flex-col md:flex-row-reverse gap-12 md:gap-20 items-end">
            <div className="reveal-content flex flex-col items-end text-right parallax-fragment">
              <div className="text-[6rem] md:text-[12rem] font-black leading-none tracking-tighter opacity-10 -mr-4 md:-mr-12 mb-[-2rem] md:mb-[-6rem]">02</div>
              <div className="max-w-md border-r-4 border-black pr-8 space-y-8">
                <p className="text-xl md:text-3xl font-black leading-none tracking-tighter uppercase italic">
                  In this vertical maze of steel and silicon, the distinction between organic life and programmed simulation dissolves into a singular, cold efficiency.
                </p>
                <div className="l4-technical-line h-[1px] w-full bg-black opacity-20 origin-right" />
              </div>
            </div>

            <div className="reveal-content md:mb-64 max-w-md parallax-fragment">
              <div className="space-y-6">
                <ShieldAlert className="w-12 h-12" />
                <p className="text-xl md:text-2xl font-black leading-tight uppercase">
                  Gleaming chrome towers pierce the perpetual haze of a dying sky, casting long, oppressive shadows over the decaying ruins of the old world.
                </p>
              </div>
            </div>
          </div>

          {/* NARRATIVE NODE 03: THE DRONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-32">
            <div className="reveal-content space-y-12 parallax-fragment">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                <span className="text-xs font-black tracking-widest">REALTIME_FEED: RECOVERED_DATA</span>
              </div>
              <p className="text-lg md:text-xl font-bold leading-relaxed opacity-80 uppercase text-justify">
                Below the gleaming surface, tangled webs of frayed wires and leaking conduits hiss with the frantic energy of a civilization sustained by life-support algorithms. Silence is a forgotten relic, replaced by the persistent drone of surveillance drones and the soft chime of credits being deducted for every breath taken.
              </p>
            </div>

            <div className="reveal-content flex flex-col justify-center items-center parallax-fragment">
              <div className="relative p-8 md:p-12 bg-black text-white w-full max-w-sm">
                <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-black" />
                <p className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none italic">
                  Reality is filtered through cracked lenses and flickering holograms...
                </p>
                <p className="mt-8 text-[10px] font-bold tracking-[0.4em] opacity-40">
                  SYSTEM_DISSOLUTION // NOMIA_CORE
                </p>
              </div>
              <p className="mt-6 text-[10px] font-black tracking-[0.2em] max-w-[200px] text-center opacity-40 uppercase">
                Leaving only a sterile, digitized husk where a vibrant world once thrived.
              </p>
            </div>
          </div>

        </div>

        {/* Cinematic Vertical Accents */}
        <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-black/5" />
        <div className="absolute top-0 bottom-0 left-[12%] w-[1px] bg-black/5" />

        {/* Nomia Signature Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none opacity-10">
          <div className="flex justify-between items-start font-black text-[2vw] md:text-[1vw] tracking-[0.5em] md:tracking-[1em]">
            <span className="vertical-text">PHANTOM_OS_ARCHIVE</span>
            <span className="vertical-text">PROTOCOL_DRESSAGE</span>
          </div>
        </div>
      </section>


      {/* LAYER 5: PROPAGANDA II (DENSE QUOTES) */}
      {/* LAYER 5: PROPAGANDA II (DENSE QUOTES) */}
      <section id="scene-5" ref={layer5Ref} className="relative z-20 py-48 bg-transparent overflow-hidden">
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
            {/* TACTICAL LUNAR HUD */}
            <div className="relative group lunar-hud-container mr-4">
              {/* Corner Brackets */}
              <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-white/40" />
              <div className="absolute -top-4 -right-4 w-4 h-4 border-t-2 border-r-2 border-white/40" />
              <div className="absolute -bottom-4 -left-4 w-4 h-4 border-b-2 border-l-2 border-white/40" />
              <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b-2 border-r-2 border-white/40" />

              {/* Orbital Data Overlay - Moved further left for alignment */}
              <div className="absolute -left-40 top-0 flex flex-col items-end gap-1 text-[8px] font-bold tracking-widest opacity-40 uppercase text-right">
                <div className="flex items-center gap-2">
                  <span>Lunar_Pos: 384.4k_km</span>
                  <div className="w-1.5 h-1.5 bg-white animate-pulse" />
                </div>
                <div>Phase: Waxing_Gibbous</div>
                <div>Sync: 99.2%</div>
              </div>

              {/* Main Moon Container with Scroll Resonance */}
              <div className="w-24 h-24 md:w-32 md:h-32 relative overflow-hidden moon-asset-parallax glitch-periodic">
                {/* Rotating HUD Ring */}
                <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow opacity-20" />
                <div className="absolute inset-0 border-t border-white/20 rounded-full animate-spin-slow-reverse" />

                <img
                  src="/decoration/Moon.png"
                  alt="Nomia Moon"
                  className="w-full h-full object-contain grayscale brightness-125 contrast-125 opacity-70 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                />

                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
              </div>
            </div>
            <h3 className="text-6xl font-black tracking-tighter leading-none">FLY ME <br />TO THE MOON</h3>
            <div className="h-2 w-full bg-white/30" />
            <p className="text-xs uppercase tracking-[1em] opacity-40">Everything Return To Nothingness</p>
          </div>
        </div>
      </section>

      {/* LAYER 6: FOOTER SYSTEM (GATEWAY) */}
      {/* LAYER 6: FOOTER SYSTEM (GATEWAY) */}
      <section id="scene-6" ref={layer6Ref} className="relative z-20 min-h-screen flex flex-col items-center justify-center bg-transparent text-black p-12 overflow-hidden">
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
            <button onClick={navigateToTerminal} className="border-[3px] border-black px-8 py-4 text-sm font-black tracking-widest hover:bg-black hover:text-white transition-all invert-logic" data-cursor="PRESS">
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
        /* MASTER PROMPT: HARDWARE ACCELERATION */
        .gpu-accelerate {
          transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>

    </main >
  );
}

