import { useEffect, useState } from "react";

function FloatingParticles() {
  const particles = Array.from({ length: 8 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      {particles.map((_, i) => {
        const left = (i * 23.7) % 100;
        const delay = (i * 1.5) % 8;
        const duration = 12 + (i % 4) * 3;
        return (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#F2A541]/60 blur-[0.5px]"
            style={{
              left: `${left}%`,
              bottom: "-10px",
              animation: `bioRise ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Footer() {
  const [gen, setGen] = useState(1284);

  useEffect(() => {
    const id = setInterval(() => setGen((g) => g + 1), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="relative w-full overflow-hidden bg-[#07090e] pt-16 pb-8 text-[#e2e8f0] font-sans border-t border-white/5">
      <style>{`
        @keyframes bioRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-300px) scale(1.4); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
        .royal-gradient-text {
          background: linear-gradient(135deg, #FFF 0%, #F2A541 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* Ambient Subtle Background Glows */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full bg-[#F2A541]/10 blur-[130px]"
        style={{ animation: "pulseGlow 8s ease-in-out infinite" }}
      />
      <FloatingParticles />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Top Hero-Style Floating Container */}
        <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 p-8 md:p-12 backdrop-blur-xl mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            {/* Left: Brand Identity & Active Live Indicator */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#F2A541]/10 border border-[#F2A541]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2A541] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F2A541]"></span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#F2A541] uppercase font-semibold">
                  Generation {gen.toLocaleString()} Active
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
                Microbial Evolution <span className="royal-gradient-text font-normal">Simulator</span>
              </h2>

              <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-light">
                Modeling spatiotemporal bacterial adaptation and resistance dynamics under selective antibiotic pressure.
              </p>
            </div>

            {/* Right: Modern Action CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a
                href="#laboratory"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#F2A541] to-[#d48c28] px-8 py-3.5 text-xs font-semibold tracking-widest text-[#07090e] transition-all duration-300 hover:shadow-[0_0_30px_rgba(242,165,65,0.4)] hover:scale-[1.02]"
              >
                <span className="relative z-10 uppercase tracking-[0.2em]">Launch Laboratory</span>
              </a>
            </div>
          </div>

          {/* Minimal Divider */}
          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Key Metadata Stats Line */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Focus Strains</p>
              <p className="text-sm font-medium text-slate-200 mt-1">MRSA & E. coli</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Architecture</p>
              <p className="text-sm font-medium text-slate-200 mt-1">Agent-Based Grid</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Department</p>
              <p className="text-sm font-medium text-slate-200 mt-1">Information Science & Eng.</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Academic Session</p>
              <p className="text-sm font-medium text-slate-200 mt-1">2025 – 2026</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Clean Minimal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-light pt-2">
          <p>© {new Date().getFullYear()} Microbial Evolution Simulator. All rights reserved.</p>
          
          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
            <a href="#about" className="hover:text-[#F2A541] transition-colors">Documentation</a>
            <span className="text-slate-800">•</span>
            <a href="#research" className="hover:text-[#F2A541] transition-colors">Research Paper</a>
            <span className="text-slate-800">•</span>
            <a href="#github" className="hover:text-[#F2A541] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}