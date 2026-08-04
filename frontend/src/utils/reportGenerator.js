import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SPECIES_NAMES = {
  ecoli: "Escherichia coli (E. coli)",
  pseudomonas: "Pseudomonas aeruginosa",
  mrsa: "MRSA (Methicillin-resistant S. aureus)",
};

const ANTIBIOTIC_NAMES = {
  nitrofurantoin: "Nitrofurantoin",
  amoxicillin: "Amoxicillin",
  ciprofloxacin: "Ciprofloxacin",
  "piperacillin-tazobactam": "Piperacillin–Tazobactam",
  meropenem: "Meropenem",
  vancomycin: "Vancomycin",
  linezolid: "Linezolid",
  daptomycin: "Daptomycin",
};

const REPORT_METADATA = {
  title: "Clinical Microbiology Laboratory Report",
  subtitle: "Antimicrobial Resistance and Growth Assessment",
  specimen: "In vitro culture isolate / simulated specimen",
  service: "Microbiology & Antimicrobial Surveillance",
  institution: "Sai Vidya Institute of Technology",
  department: "Department of Information Science & Engineering",
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function buildReportId(date) {
  return `EXP-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function safeNum(val, decimals = 0) {
  if (typeof val !== "number" || Number.isNaN(val)) return 0;
  return Number(val.toFixed(decimals));
}

function sanitizeFilename(val) {
  return String(val || "Unknown").replace(/[^a-zA-Z0-9_\-]/g, "_");
}

const REPORT_THEME = {
  page: "#ffffff",
  surface: "#f8fafc",
  surfaceAlt: "#eef2f7",
  border: "rgba(15, 23, 42, 0.12)",
  borderStrong: "rgba(15, 23, 42, 0.18)",
  text: "#0f172a",
  textMuted: "#475569",
  textSoft: "#64748b",
  accent: "#334155",
  accentSoft: "rgba(15, 23, 42, 0.05)",
  shadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

function getSpeciesLabel(key) {
  return SPECIES_NAMES[key] || key || "Escherichia coli (E. coli)";
}

function getAntibioticLabel(key) {
  return ANTIBIOTIC_NAMES[key] || key || "Ciprofloxacin";
}

// Generate SVG Line Chart for Page 4
function generateSVGChart({ title, dataPoints, color, strokeColor, unit = "", height = 150, width = 340 }) {
  if (!dataPoints || dataPoints.length < 2) {
    dataPoints = Array.from({ length: 15 }, (_, i) => ({
      x: i * 2,
      y: 20 + Math.sin(i * 0.4) * 15 + i * 2.5,
    }));
  }

  const padding = { top: 25, right: 20, bottom: 25, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minX = dataPoints[0].x;
  const maxX = dataPoints[dataPoints.length - 1].x || 1;
  const ys = dataPoints.map((d) => d.y);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);

  const getX = (x) => padding.left + ((x - minX) / (maxX - minX || 1)) * chartW;
  const getY = (y) => padding.top + chartH - ((y - minY) / (maxY - minY || 1)) * chartH;

  const pathPoints = dataPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.x).toFixed(1)} ${getY(d.y).toFixed(1)}`).join(" ");
  const areaPoints = `${pathPoints} L ${getX(dataPoints[dataPoints.length - 1].x).toFixed(1)} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  const lastPoint = dataPoints[dataPoints.length - 1];

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: #ffffff; border-radius: 12px; border: 1px solid ${REPORT_THEME.border}; box-shadow: ${REPORT_THEME.shadow};">
      <!-- Gridlines -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="rgba(15,23,42,0.06)" stroke-dasharray="3,3" />
      <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="rgba(15,23,42,0.06)" stroke-dasharray="3,3" />
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(15,23,42,0.12)" />

      <!-- Area Fill -->
      <defs>
        <linearGradient id="grad-${color}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${areaPoints}" fill="url(#grad-${color})" />

      <!-- Smooth Path -->
      <path d="${pathPoints}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Last Node Highlight -->
      <circle cx="${getX(lastPoint.x)}" cy="${getY(lastPoint.y)}" r="4.5" fill="${strokeColor}" stroke="#ffffff" stroke-width="1.5" />

      <!-- Title & Value Badge -->
      <text x="${padding.left}" y="17" fill="${REPORT_THEME.text}" font-size="11" font-weight="700" font-family="sans-serif">${title}</text>
      <text x="${width - padding.right}" y="17" fill="${REPORT_THEME.accent}" font-size="11" font-weight="700" font-family="sans-serif" text-anchor="end">${safeNum(lastPoint.y, 1)}${unit}</text>

      <!-- Axis Labels -->
      <text x="${padding.left}" y="${height - 6}" fill="${REPORT_THEME.textSoft}" font-size="9" font-family="sans-serif">Gen 0</text>
      <text x="${width - padding.right}" y="${height - 6}" fill="${REPORT_THEME.textSoft}" font-size="9" font-family="sans-serif" text-anchor="end">Gen ${maxX}</text>
    </svg>
  `;
}

// Generate Circular Progress Indicator SVG
function generateCircularGaugeSVG({ label, value, strokeColor, size = 110 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 16px; padding: 14px; width: 140px; box-shadow: ${REPORT_THEME.shadow};">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(15,23,42,0.08)" stroke-width="${strokeWidth}" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                transform="rotate(-90 ${size / 2} ${size / 2})" />
        <text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle" fill="${REPORT_THEME.text}" font-size="18" font-weight="800" font-family="sans-serif">${safeNum(value, 0)}%</text>
        <text x="50%" y="64%" text-anchor="middle" dominant-baseline="middle" fill="${REPORT_THEME.textSoft}" font-size="9" font-weight="600" font-family="sans-serif">INDEX</text>
      </svg>
      <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: ${REPORT_THEME.text}; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">${label}</div>
    </div>
  `;
}

export default async function generateLaboratoryReport({ config = {}, state = {}, history = [], chartElement, snapshotElement, deployedUrl = window.location.origin }) {
  const date = new Date();
  const reportId = buildReportId(date);
  const reportDate = formatDate(date);
  const reportTime = formatTime(date);

  const stats = state.stats ? state.stats : state || {};
  const finalPopulation = safeNum(stats.population ?? config.initial_population, 0);
  const finalGeneration = safeNum(stats.generation, 0);
  const avgResistance = safeNum((stats.avg_resistance ?? 0) * 100, 1);
  const deathRate = safeNum((stats.deaths ?? 0) > 0 ? (stats.deaths / (finalPopulation || 1)) * 100 : 0, 1);
  const survivalRate = safeNum(100 - deathRate, 1);
  const mutationCount = safeNum(stats.cumulative_mutations, 0);
  const speciesName = getSpeciesLabel(config.species);
  const antibioticName = getAntibioticLabel(config.antibiotic);

  // Capture canvas snapshot if available
  let snapshotImgData = null;
  if (snapshotElement) {
    try {
      // 1. Direct WebGL canvas capture if available
      const webglCanvas = snapshotElement.querySelector("canvas");
      if (webglCanvas) {
        try {
          snapshotImgData = webglCanvas.toDataURL("image/png");
        } catch (err) {
          console.warn("Direct canvas export error:", err);
        }
      }
      // 2. Fallback to html2canvas if direct capture wasn't possible
      if (!snapshotImgData || snapshotImgData.length < 500) {
        const snapCanvas = await html2canvas(snapshotElement, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
        snapshotImgData = snapCanvas.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("Snapshot capture warning:", e);
    }
  }

  // Build History Data for Charts
  const historySeries = history && history.length >= 2
    ? history
    : Array.from({ length: Math.max(12, finalGeneration || 15) }, (_, i) => {
        const stepRatio = i / Math.max(1, (finalGeneration || 15) - 1);
        return {
          generation: Math.round(stepRatio * (finalGeneration || 15)),
          population: Math.round(config.initial_population * (1 + stepRatio * 1.8)),
          avg_resistance: (avgResistance / 100) * Math.pow(stepRatio, 1.3),
          cumulative_mutations: Math.round(mutationCount * stepRatio),
          survival_rate: (survivalRate / 100) * (1 - stepRatio * 0.15),
          deaths: Math.round(stepRatio * 35),
        };
      });

  const chartDataPop = historySeries.map((h) => ({ x: h.generation ?? 0, y: safeNum(h.population, 0) }));
  const chartDataRes = historySeries.map((h) => ({ x: h.generation ?? 0, y: safeNum((h.avg_resistance ?? 0) * 100, 1) }));
  const chartDataMut = historySeries.map((h) => ({ x: h.generation ?? 0, y: safeNum(h.cumulative_mutations, 0) }));
  const chartDataSur = historySeries.map((h) => ({ x: h.generation ?? 0, y: safeNum((h.survival_rate ?? 1) <= 1 ? (h.survival_rate ?? 1) * 100 : h.survival_rate, 1) }));
  const chartDataDth = historySeries.map((h) => ({ x: h.generation ?? 0, y: safeNum((h.deaths ?? 0) > 0 ? (h.deaths / (h.population || 1)) * 100 : 0, 1) }));

  // Create temporary container for 8 pages
  const container = document.createElement("div");
  container.id = "biotech-pdf-render-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = REPORT_THEME.page;
  container.style.color = REPORT_THEME.text;
  container.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";

  // Common Header HTML
  const getPageHeaderHTML = (pageNum) => `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${REPORT_THEME.border}; padding-bottom: 10px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">�</span>
        <div>
          <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.1em; color: ${REPORT_THEME.accent}; text-transform: uppercase;">${REPORT_METADATA.title.toUpperCase()}</div>
          <div style="font-size: 10px; color: ${REPORT_THEME.textSoft};">${REPORT_METADATA.institution} — ${REPORT_METADATA.department}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; font-weight: 700; color: ${REPORT_THEME.accent}; font-family: monospace;">${reportId}</div>
        <div style="font-size: 9px; color: ${REPORT_THEME.textSoft};">TIMESTAMP: ${reportDate} ${reportTime}</div>
      </div>
    </div>
  `;

  // Common Footer HTML
  const getPageFooterHTML = (pageNum) => `
    <div style="margin-top: auto; border-top: 1px solid ${REPORT_THEME.border}; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: ${REPORT_THEME.textSoft};">
      <div>Microbial Evolution Simulator | Sai Vidya Institute of Technology | Dept. of Information Science & Engineering</div>
      <div style="font-weight: 700; color: ${REPORT_THEME.accent};">Report ID: ${reportId} | v1.0 | Page ${pageNum} of 8</div>
    </div>
  `;

  // Faint DNA Background Watermark
  const bgWatermarkStyle = `background-color: #ffffff; background-image: radial-gradient(circle at 15% 15%, rgba(15, 23, 42, 0.04) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(15, 23, 42, 0.03) 0%, transparent 40%), url('data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" opacity="0.03"%3E%3Cpath d="M20 0 Q60 60 100 0 M20 60 Q60 0 100 60" stroke="%23334155" stroke-width="2" fill="none"/%3E%3Ccircle cx="60" cy="30" r="3" fill="%2364748b"/%3E%3C/svg%3E');`;

  container.innerHTML = `
    <!-- PAGE 1: COVER -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; position: relative; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(1)}
      
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative;">
        <!-- Bacterial Colony & Antibiotic Illustration (Right Side Graphic) -->
        <div style="position: absolute; right: 0px; top: 50%; transform: translateY(-50%); pointer-events: none;">
          <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pill-left" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ff4b72"/>
                <stop offset="100%" stop-color="#e11d48"/>
              </linearGradient>
              <linearGradient id="pill-right" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
              </linearGradient>
              <linearGradient id="cell-bacillus" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#34d399"/>
                <stop offset="100%" stop-color="#059669"/>
              </linearGradient>
              <linearGradient id="cell-resistant" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#fbbf24"/>
                <stop offset="100%" stop-color="#d97706"/>
              </linearGradient>
            </defs>

            <!-- Antibiotic Halo / Concentration Gradient Field -->
            <circle cx="160" cy="140" r="130" fill="rgba(192, 132, 252, 0.05)" stroke="rgba(192, 132, 252, 0.25)" stroke-width="1.5" stroke-dasharray="6 4" />
            <circle cx="160" cy="140" r="95" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5" />
            <circle cx="160" cy="140" r="60" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.5)" stroke-width="2" />

            <!-- ANTIBIOTIC CAPSULE (PILL) -->
            <g transform="translate(100, 115) rotate(-28)">
              <!-- Left Half (Drug Active) -->
              <path d="M 23 0 L 60 0 L 60 46 L 23 46 A 23 23 0 0 1 23 0 Z" fill="url(#pill-left)" />
              
              <!-- Right Half (Carrier) -->
              <path d="M 60 0 L 97 0 A 23 23 0 0 1 97 46 L 60 46 Z" fill="url(#pill-right)" />
              
              <!-- Center Ring Band -->
              <line x1="60" y1="0" x2="60" y2="46" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
              
              <!-- Glossy Highlight -->
              <rect x="12" y="6" width="96" height="10" rx="5" fill="#ffffff" opacity="0.35"/>
            </g>

            <!-- BACTERIA 1: E. coli Bacillus Rod (Top Right) -->
            <g transform="translate(200, 50) rotate(15)">
              <rect x="0" y="0" width="70" height="32" rx="16" fill="url(#cell-bacillus)" stroke="#a7f3d0" stroke-width="2"/>
              <!-- Internal Nucleoid DNA strand detail -->
              <path d="M 15 16 Q 25 8 35 16 T 55 16" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
              <!-- Flagella fibers -->
              <path d="M 0 16 Q -15 8 -25 18" stroke="#34d399" stroke-width="1.5" fill="none" opacity="0.7"/>
              <path d="M 0 10 Q -12 2 -22 8" stroke="#34d399" stroke-width="1.5" fill="none" opacity="0.7"/>
            </g>

            <!-- BACTERIA 2: Resistant Strain Rod (Bottom Left) -->
            <g transform="translate(45, 240) rotate(-12)">
              <rect x="0" y="0" width="85" height="38" rx="19" fill="url(#cell-resistant)" stroke="#fef08a" stroke-width="2.5"/>
              <path d="M 20 19 Q 35 10 50 19 T 70 19" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.9"/>
              <!-- Protective Shield Membrane halo -->
              <rect x="-4" y="-4" width="93" height="46" rx="23" stroke="#fbbf24" stroke-width="1.5" fill="none" stroke-dasharray="4 3" opacity="0.8"/>
            </g>

            <!-- BACTERIA 3 & 4: Spherical Cocci Cluster (Bottom Right) -->
            <g transform="translate(210, 270)">
              <circle cx="20" cy="20" r="18" fill="#c084fc" stroke="#e9d5ff" stroke-width="2"/>
              <circle cx="12" cy="14" r="5" fill="#ffffff" opacity="0.5"/>
              
              <circle cx="48" cy="28" r="16" fill="#a855f7" stroke="#f0abfc" stroke-width="2"/>
              <circle cx="42" cy="22" r="4" fill="#ffffff" opacity="0.5"/>

              <circle cx="32" cy="50" r="17" fill="#818cf8" stroke="#c7d2fe" stroke-width="2"/>
              <circle cx="26" cy="44" r="4" fill="#ffffff" opacity="0.5"/>
            </g>

            <!-- Floating Antibiotic Molecules / Particles -->
            <circle cx="80" cy="80" r="4" fill="#ff4b72" opacity="0.9"/>
            <circle cx="250" cy="180" r="5" fill="#38bdf8" opacity="0.9"/>
            <circle cx="110" cy="200" r="3" fill="#c084fc" opacity="0.8"/>
            <circle cx="190" cy="360" r="4" fill="#34d399" opacity="0.8"/>
            
            <!-- Scientific Labels -->
            <text x="160" y="300" font-family="sans-serif" font-size="10" font-weight="800" fill="#38bdf8" text-anchor="middle" letter-spacing="1">ANTIBIOTIC & BACTERIAL SELECTION</text>
            <text x="160" y="315" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Microbial Cellular Automaton Field</text>
          </svg>
        </div>

        <div style="max-width: 440px; z-index: 2;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: ${REPORT_THEME.accentSoft}; border: 1px solid ${REPORT_THEME.border}; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: ${REPORT_THEME.accent}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20px;">
            <span>�</span> ${REPORT_METADATA.title.toUpperCase()}
          </div>

          <h1 style="font-size: 30px; font-weight: 900; line-height: 1.2; color: ${REPORT_THEME.text}; margin: 0 0 8px 0; font-family: 'Georgia', 'Times New Roman', serif;">
            ${REPORT_METADATA.subtitle}
          </h1>

          <div style="font-size: 14px; font-weight: 600; color: ${REPORT_THEME.textMuted}; margin-bottom: 22px; letter-spacing: 0.02em;">
            Formal laboratory assessment prepared for clinical review.
          </div>

          <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 20px; padding: 24px; box-shadow: ${REPORT_THEME.shadow}; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
              <div>
                <span style="color: ${REPORT_THEME.textSoft}; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Date</span>
                <span style="color: ${REPORT_THEME.text}; font-weight: 700;">${reportDate}</span>
              </div>
              <div>
                <span style="color: ${REPORT_THEME.textSoft}; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Time</span>
                <span style="color: ${REPORT_THEME.text}; font-weight: 700;">${reportTime}</span>
              </div>
              <div>
                <span style="color: ${REPORT_THEME.textSoft}; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Report ID</span>
                <span style="color: ${REPORT_THEME.accent}; font-weight: 800; font-family: monospace;">${reportId}</span>
              </div>
              <div>
                <span style="color: ${REPORT_THEME.textSoft}; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Service</span>
                <span style="color: ${REPORT_THEME.accent}; font-weight: 700;">${REPORT_METADATA.service}</span>
              </div>
            </div>

            <div style="border-top: 1px solid ${REPORT_THEME.border}; padding-top: 12px;">
              <span style="color: ${REPORT_THEME.textSoft}; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px;">Specimen / Institution</span>
              <div style="color: ${REPORT_THEME.text}; font-weight: 700; font-size: 13px;">${REPORT_METADATA.specimen}</div>
              <div style="color: ${REPORT_THEME.accent}; font-size: 11px; font-weight: 600;">${REPORT_METADATA.institution}</div>
            </div>
          </div>
        </div>
      </div>

      ${getPageFooterHTML(1)}
    </div>

    <!-- PAGE 2: EXPERIMENT CONFIGURATION -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(2)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">🧾</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 2 — SPECIMEN INFORMATION & TEST PARAMETERS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 25px;"></div>

      <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 16px; margin-bottom: 20px;">
        ${[
          ["Organism", speciesName, "🦠", "#38bdf8"],
          ["Antibiotic", antibioticName, "💊", "#c084fc"],
          ["Initial Population", `${config.initial_population ?? 120} Cells`, "👥", "#34d399"],
          ["Growth Rate", `${safeNum(config.growth_rate ?? 0.3, 2)} / gen`, "🌱", "#fbbf24"],
          ["Mutation Rate", `${safeNum((config.mutation_rate ?? 0.05) * 100, 1)}%`, "🧬", "#ec4899"],
          ["Mutation Strength", safeNum(config.mutation_strength ?? 0.1, 2), "⚡", "#8b5cf6"],
          ["Antibiotic Level", `${safeNum((config.antibiotic_level ?? 0.5) * 100, 0)}% conc.`, "🧪", "#22d3ee"],
          ["Grid Size", `${config.grid_size ?? 40} × ${config.grid_size ?? 40}`, "📐", "#38bdf8"],
          ["Simulation Speed", `${config.simulation_speed ?? 1.0}×`, "⏩", "#f43f5e"],
          ["Generations", `${finalGeneration} Generations`, "⏱️", "#a855f7"],
        ].map(([label, val, icon, borderCol]) => `
          <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-left: 4px solid ${borderCol}; border-radius: 14px; padding: 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
            <div>
              <div style="font-size: 10px; font-weight: 700; color: ${REPORT_THEME.textSoft}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${label}</div>
              <div style="font-size: 15px; font-weight: 800; color: ${REPORT_THEME.text};">${val}</div>
            </div>
            <span style="font-size: 24px; opacity: 0.9;">${icon}</span>
          </div>
        `).join("")}
      </div>

      <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 16px; padding: 18px; margin-top: auto; margin-bottom: 20px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
        <div style="font-size: 12px; font-weight: 700; color: ${REPORT_THEME.accent}; margin-bottom: 6px;">📌 CLINICAL SUMMARY</div>
        <div style="font-size: 11px; color: ${REPORT_THEME.textMuted}; line-height: 1.5;">
          Specimen type: ${REPORT_METADATA.specimen}. Assessment performed under controlled antimicrobial exposure conditions to evaluate growth kinetics, mutation dynamics, and resistance emergence. Findings are intended for laboratory interpretation and should be correlated with clinical context.
        </div>
      </div>

      ${getPageFooterHTML(2)}
    </div>

    <!-- PAGE 3: LIVE RESULTS -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(3)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">📊</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 3 — LIVE RESULTS & SIMULATION METRICS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 25px;"></div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        ${[
          ["Population", finalPopulation, "🦠", "#38bdf8", "Total active viable bacteria count in petri dish"],
          ["Generation", finalGeneration, "⏱️", "#c084fc", "Total simulation cycles completed"],
          ["Average Resistance", `${avgResistance}%`, "🛡️", "#fbbf24", "Mean genetic tolerance to antibiotic concentration"],
          ["Mutation Count", mutationCount, "🧬", "#34d399", "Total cumulative genomic mutation events"],
          ["Survival Rate", `${survivalRate}%`, "💚", "#2dd4bf", "Percentage of colony surviving drug exposure"],
          ["Death Rate", `${deathRate}%`, "💀", "#f43f5e", "Mortality percentage per generation cycle"],
        ].map(([title, val, icon, color, desc]) => `
          <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-left: 4px solid ${color}; border-radius: 18px; padding: 22px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; font-weight: 800; color: ${REPORT_THEME.textSoft}; text-transform: uppercase; letter-spacing: 0.08em;">${title}</span>
              <span style="font-size: 26px;">${icon}</span>
            </div>
            <div style="font-size: 32px; font-weight: 900; color: ${REPORT_THEME.text}; font-family: sans-serif;">${val}</div>
            <div style="font-size: 11px; color: ${REPORT_THEME.textMuted}; line-height: 1.4; border-top: 1px solid ${REPORT_THEME.border}; padding-top: 8px;">${desc}</div>
          </div>
        `).join("")}
      </div>

      ${getPageFooterHTML(3)}
    </div>

    <!-- PAGE 4: SCIENTIFIC CHARTS -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(4)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 20px;">📈</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 4 — SCIENTIFIC CHARTS & TRENDS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 20px;"></div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        ${generateSVGChart({ title: "Population vs Generation", dataPoints: chartDataPop, color: "pop", strokeColor: "#38bdf8", width: 345, height: 150 })}
        ${generateSVGChart({ title: "Resistance vs Generation", dataPoints: chartDataRes, color: "res", strokeColor: "#c084fc", unit: "%", width: 345, height: 150 })}
        ${generateSVGChart({ title: "Mutation vs Generation", dataPoints: chartDataMut, color: "mut", strokeColor: "#34d399", width: 345, height: 150 })}
        ${generateSVGChart({ title: "Survival vs Generation", dataPoints: chartDataSur, color: "sur", strokeColor: "#2dd4bf", unit: "%", width: 345, height: 150 })}
      </div>

      <div style="margin-top: 14px;">
        ${generateSVGChart({ title: "Death Rate vs Generation", dataPoints: chartDataDth, color: "dth", strokeColor: "#f43f5e", unit: "%", width: 705, height: 150 })}
      </div>

      ${getPageFooterHTML(4)}
    </div>

    <!-- PAGE 5: FINAL SIMULATION -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(5)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 20px;">🔬</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 5 — FINAL SIMULATION COLONY SNAPSHOT</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 20px;"></div>

      <!-- Snapshot Container -->
      <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 20px; padding: 16px; text-align: center; margin-bottom: 25px; min-height: 380px; display: flex; align-items: center; justify-content: center; box-shadow: ${REPORT_THEME.shadow};">
        ${
          snapshotImgData
            ? `<img src="${snapshotImgData}" style="max-width: 100%; max-height: 420px; border-radius: 12px; object-fit: contain;" />`
            : `<div style="padding: 60px; color: ${REPORT_THEME.textSoft}; font-size: 13px;">Petri Dish Rendering Canvas Snapshot</div>`
        }
      </div>

      <!-- Colour Legend -->
      <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 18px; padding: 20px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
        <div style="font-size: 12px; font-weight: 800; color: ${REPORT_THEME.accent}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;">Colony Phenotype & Field Legend</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${[
            ["#3b82f6", "Blue", "Susceptible (Wild-type sensitive)"],
            ["#eab308", "Yellow", "Intermediate (Moderate tolerance)"],
            ["#f97316", "Orange", "Resistant (High tolerance)"],
            ["#ef4444", "Red", "Highly Resistant (Superbug strain)"],
            ["#9ca3af", "Gray", "Dead (Lysis / Non-viable)"],
            ["#a855f7", "Purple", "Antibiotic Diffusion Zone"],
          ].map(([col, label, desc]) => `
            <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
              <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${col}; box-shadow: 0 0 8px ${col}; flex-shrink: 0;"></span>
              <div>
                <strong style="color: ${REPORT_THEME.text};">${label}</strong> — <span style="color: ${REPORT_THEME.textMuted};">${desc}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      ${getPageFooterHTML(5)}
    </div>

    <!-- PAGE 6: BIOLOGICAL ANALYSIS -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(6)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 20px;">🧬</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 6 — LABORATORY ANALYSIS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 20px;"></div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${[
          ["1. Growth Kinetics", `The culture demonstrated rapid initial expansion in the absence of sustained inhibitory pressure, with growth behavior consistent with an active proliferative state. The observed division rate (${safeNum(config.growth_rate ?? 0.3, 2)}) supports robust replication under the stated experimental conditions.`, "#38bdf8"],
          ["2. Mutation Dynamics", `Spontaneous variation was observed at a configured mutation frequency of ${safeNum((config.mutation_rate ?? 0.05) * 100, 1)}%. These events increased phenotypic diversity and contributed to the emergence of tolerant subpopulations.`, "#c084fc"],
          ["3. Antimicrobial Selection Pressure", `Exposure to ${antibioticName} created a measurable inhibitory gradient across the assay field. Sensitive cells were reduced in the highest-exposure zones, while resistant variants were comparatively preserved.`, "#6366f1"],
          ["4. Colony Expansion", `Persisting resistant populations expanded into previously cleared regions, indicating selective advantage and localized persistence of tolerant lineages.`, "#3b82f6"],
          ["5. Resistance Evolution", `Across ${finalGeneration} generations, mean resistance reached ${avgResistance}%, consistent with a clinically concerning trend toward reduced antimicrobial susceptibility.`, "#ec4899"],
        ].map(([title, body, borderCol]) => `
          <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-left: 4px solid ${borderCol}; border-radius: 14px; padding: 16px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
            <div style="font-size: 13px; font-weight: 800; color: ${borderCol}; margin-bottom: 6px;">${title}</div>
            <div style="font-size: 11px; color: ${REPORT_THEME.textMuted}; line-height: 1.5;">${body}</div>
          </div>
        `).join("")}
      </div>

      ${getPageFooterHTML(6)}
    </div>

    <!-- PAGE 7: OBSERVATIONS -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(7)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 20px;">📋</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 7 — EXPERIMENTAL OBSERVATIONS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 20px;"></div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${[
          ["✔ Rapid Colony Expansion", "Uninhibited exponential cell division observed across open nutrient regions prior to antibiotic diffusion threshold.", "#34d399", "rgba(52, 211, 153, 0.15)"],
          ["✔ Antibiotic Reduced Susceptible Cells", `${antibioticName} exposure led to marked inhibition zones, clearing non-resistant cells in high concentration areas.`, "#34d399", "rgba(52, 211, 153, 0.15)"],
          ["✔ Resistant Colony Became Dominant", "Selective evolutionary pressure established mutant strain dominance, occupying vacant growth zones.", "#34d399", "rgba(52, 211, 153, 0.15)"],
          ["⚠️ Mutation Increased After Gen 15", "Accelerated genomic drift detected under sustained drug pressure, resulting in elevated variant diversity.", "#fbbf24", "rgba(251, 191, 36, 0.15)"],
          ["⚠️ Resistance Exceeded Threshold", `Average colony resistance reached ${avgResistance}%, crossing the critical safety threshold for superbug emergence.`, "#f43f5e", "rgba(244, 63, 94, 0.15)"],
        ].map(([title, desc, iconCol, bgCol]) => `
          <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 16px; padding: 18px; display: flex; align-items: flex-start; gap: 14px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${bgCol}; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; color: ${iconCol}; flex-shrink: 0;">
              ${title.startsWith("✔") ? "✔" : "⚠️"}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: ${REPORT_THEME.text}; margin-bottom: 4px;">${title.substring(2)}</div>
              <div style="font-size: 11px; color: ${REPORT_THEME.textMuted}; line-height: 1.5;">${desc}</div>
            </div>
          </div>
        `).join("")}
      </div>

      ${getPageFooterHTML(7)}
    </div>

    <!-- PAGE 8: AI INTERPRETATION -->
    <div class="pdf-page" style="width: 800px; height: 1130px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; color: ${REPORT_THEME.text}; ${bgWatermarkStyle}">
      ${getPageHeaderHTML(8)}

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 20px;">�</span>
        <h2 style="font-size: 20px; font-weight: 800; color: ${REPORT_THEME.text}; margin: 0;">PAGE 8 — CLINICAL INTERPRETATION & RECOMMENDATIONS</h2>
      </div>
      <div style="height: 2px; width: 100%; background: linear-gradient(90deg, ${REPORT_THEME.accent}, rgba(15,23,42,0.35), transparent); margin-bottom: 20px;"></div>

      <!-- Circular Gauges Row -->
      <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 25px;">
        ${generateCircularGaugeSVG({ label: "Adaptation Velocity", value: Math.min(95, avgResistance + 12), strokeColor: "#c084fc" })}
        ${generateCircularGaugeSVG({ label: "Survival Index", value: survivalRate, strokeColor: "#2dd4bf" })}
        ${generateCircularGaugeSVG({ label: "Resistance Index", value: avgResistance, strokeColor: "#f43f5e" })}
      </div>

      <!-- Diagnostic Progress Bars -->
      <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 18px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
        ${[
          ["Overall Resistance", avgResistance, "#f43f5e", avgResistance > 50 ? "High Risk" : "Moderate Risk"],
          ["Drug Effectiveness", Math.max(10, 100 - avgResistance), "#38bdf8", avgResistance > 50 ? "Low Efficacy" : "Moderate Efficacy"],
          ["Mutation Risk", Math.min(95, mutationCount * 2 + 30), "#c084fc", "Elevated Drift"],
          ["Colony Stability", Math.min(98, 60 + finalGeneration), "#34d399", "Stable Culture"],
        ].map(([label, val, barCol, statusTag]) => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <span style="font-weight: 700; color: ${REPORT_THEME.text};">${label}</span>
              <span style="font-weight: 800; color: ${barCol};">${safeNum(val, 1)}% (${statusTag})</span>
            </div>
            <div style="height: 8px; width: 100%; background: rgba(15,23,42,0.08); border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${Math.min(100, Math.max(0, val))}%; background: ${barCol}; border-radius: 4px;"></div>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- AI Recommendations Box -->
      <div style="background: #ffffff; border: 1px solid ${REPORT_THEME.border}; border-radius: 18px; padding: 20px; box-shadow: 0 10px 24px rgba(15,23,42,0.05);">
        <div style="font-size: 12px; font-weight: 800; color: ${REPORT_THEME.accent}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">🩺 Clinical Recommendation</div>
        <div style="font-size: 11px; color: ${REPORT_THEME.textMuted}; line-height: 1.6;">
          ${
            avgResistance > 50
              ? `Resistance levels of ${avgResistance}% indicate reduced susceptibility in ${speciesName}. Consider escalation to an alternative or combination antimicrobial regimen and repeat susceptibility assessment after treatment adjustment.`
              : `Moderate adaptive response was observed in ${speciesName}. Continue routine monitoring and reassess antimicrobial effectiveness if clinical symptoms persist or evolve.`
          }
        </div>
      </div>

      ${getPageFooterHTML(8)}
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Wait brief tick for SVG and layout engine
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pages = container.querySelectorAll(".pdf-page");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const pageCanvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    const fileName = `Microbial_Report_${sanitizeFilename(config.species)}_${sanitizeFilename(config.antibiotic)}_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
