import { useEffect, useRef } from 'react';

const ICON_PATHS = [
  "M2228 8629 c-19 -7 -36 -28 -54 -65 -26 -54 -27 -59 -21 -182 3 -70 13 -158 22 -197 26 -108 113 -381 147 -454 61 -137 148 -304 161 -309 4 -2 7 -8 7 -13 0 -9 27 -53 119 -194 53 -82 141 -199 153 -203 4 -2 8 -8 8 -13 0 -41 393 -430 576 -569 32 -25 66 -51 74 -59 16 -16 220 -151 228 -151 2 0 25 -15 51 -34 46 -34 88 -58 191 -112 30 -16 57 -31 60 -34 10 -12 263 -130 277 -130 4 0 25 -9 47 -19 130 -61 437 -164 646 -216 30 -8 75 -19 100 -25 43 -11 167 -35 335 -64 71 -13 380 -48 490 -56 115 -9 242 -25 276 -36 11 -3 19 -19 22 -42 19 -145 37 -354 37 -446 0 -220 -42 -722 -90 -1061 -18 -126 -49 -338 -70 -480 -8 -54 -36 -228 -50 -310 -11 -62 -53 -287 -79 -420 -11 -55 -27 -136 -35 -180 -9 -44 -20 -100 -25 -125 -6 -25 -17 -79 -25 -120 -9 -41 -32 -145 -51 -230 -19 -85 -47 -207 -61 -270 -15 -63 -33 -140 -41 -170 -28 -106 -45 -175 -50 -208 -3 -18 -9 -35 -14 -38 -5 -3 -9 -15 -9 -27 0 -12 -14 -67 -30 -122 -16 -55 -35 -122 -41 -150 -6 -27 -15 -54 -20 -59 -5 -6 -9 -20 -9 -33 0 -13 -4 -31 -9 -41 -5 -9 -30 -82 -56 -162 -25 -80 -50 -154 -54 -165 -5 -11 -16 -40 -24 -65 -36 -107 -81 -226 -89 -234 -4 -6 -8 -16 -8 -23 0 -7 -9 -32 -19 -56 -91 -200 -90 -197 -71 -197 6 0 33 47 60 105 28 58 56 105 63 105 8 0 19 23 26 52 21 83 69 236 81 258 6 11 17 20 26 20 11 0 12 4 5 18 -10 20 -3 72 10 72 5 0 9 9 9 20 0 11 9 43 20 72 11 29 20 61 20 72 0 12 5 16 15 12 18 -6 20 5 4 21 -8 8 0 47 30 139 22 71 52 172 67 224 15 52 31 100 36 106 4 6 11 39 14 72 5 44 11 63 23 67 12 3 16 17 16 50 0 27 6 49 14 54 10 7 10 12 0 28 -10 16 -9 28 6 66 9 25 24 48 32 51 11 5 13 16 8 50 -7 42 6 122 26 171 7 19 40 143 60 230 5 22 14 76 19 120 11 83 25 147 41 177 5 10 9 31 9 47 0 17 4 33 10 36 5 3 10 24 10 47 0 36 2 40 21 35 17 -5 19 -2 12 11 -10 22 -6 181 6 196 8 10 12 38 28 174 4 36 9 52 18 48 9 -3 12 12 13 54 0 32 5 67 10 77 6 10 15 58 22 107 6 49 17 94 24 100 19 16 27 44 13 49 -8 2 -8 30 1 113 18 168 36 253 58 270 14 11 15 17 7 20 -15 6 -19 134 -4 134 8 0 24 141 36 320 8 104 13 123 31 116 21 -8 28 13 10 33 -22 24 -21 22 -15 121 2 45 8 154 13 242 9 174 32 389 51 468 5 25 14 63 20 85 5 22 14 54 20 70 44 136 54 188 56 295 2 112 1 120 -24 165 -14 27 -40 61 -58 76 -44 37 -115 42 -142 11z",
  "M6156 7748 c-3 -40 -11 -109 -17 -153 -26 -214 -20 -630 12 -750 39 -142 117 -254 204 -291 75 -31 159 -9 221 58 31 33 94 122 94 132 0 3 11 29 24 58 14 29 28 67 32 83 4 17 10 35 14 40 4 6 10 24 14 40 4 17 14 59 22 95 8 36 17 81 20 100 3 19 9 44 14 55 10 23 12 34 39 275 23 195 25 250 12 250 -10 0 -26 -42 -46 -124 -42 -168 -101 -356 -135 -431 -10 -22 -22 -51 -26 -65 -4 -14 -17 -47 -29 -75 -12 -27 -30 -70 -40 -95 -11 -25 -32 -67 -47 -93 -15 -26 -28 -52 -28 -57 0 -14 -77 -90 -92 -90 -16 0 -50 34 -66 66 -30 57 -80 252 -93 359 -5 39 -13 106 -18 150 -6 44 -17 136 -26 205 -8 69 -19 167 -24 218 -11 120 -26 137 -35 40z",
  "M2615 6064 c-153 -46 -282 -141 -371 -274 -72 -109 -88 -165 -87 -317 1 -160 14 -196 109 -289 68 -68 129 -97 226 -109 91 -11 213 39 279 115 136 158 86 438 -94 524 -56 27 -127 44 -127 30 0 -12 49 -34 74 -34 17 0 18 -2 6 -10 -12 -8 -10 -10 11 -10 35 0 101 -65 135 -132 35 -70 43 -181 20 -261 -11 -37 -22 -57 -32 -57 -8 0 -14 -7 -12 -16 2 -10 -3 -19 -9 -21 -7 -3 -13 0 -13 7 0 6 -4 8 -10 5 -5 -3 -10 -15 -10 -25 0 -13 -19 -28 -62 -49 -83 -40 -100 -42 -107 -13 l-6 23 -17 -21 c-21 -24 -62 -26 -103 -4 -16 8 -40 14 -54 12 -30 -4 -40 17 -11 25 36 9 24 30 -15 24 -30 -5 -38 -1 -62 27 -58 68 -63 77 -63 106 0 17 -7 42 -16 56 -38 57 12 322 72 385 13 14 24 29 24 33 0 13 37 56 43 50 3 -3 8 3 11 13 3 11 25 31 49 46 23 15 50 36 60 47 12 15 24 19 42 14 19 -5 25 -2 25 10 0 9 8 19 18 22 9 3 26 10 37 14 80 35 240 49 355 32 36 -6 45 -12 51 -32 5 -20 8 -22 13 -9 9 20 38 15 78 -13 14 -10 29 -18 32 -18 17 0 119 -75 123 -91 3 -10 12 -19 19 -19 8 0 14 -7 14 -15 0 -8 7 -15 15 -15 8 0 15 -7 15 -15 0 -8 6 -15 13 -15 15 -1 67 -74 67 -95 0 -9 7 -18 15 -21 8 -4 15 -15 15 -26 0 -11 5 -28 10 -38 15 -29 50 -206 50 -256 0 -24 -5 -65 -11 -91 -14 -62 -60 -207 -68 -213 -3 -3 -12 -17 -20 -33 -8 -15 -19 -26 -25 -24 -15 5 -14 33 2 30 6 -2 12 4 12 12 0 20 -39 19 -47 0 -3 -9 2 -24 12 -35 10 -11 14 -26 11 -38 -10 -29 -76 -91 -92 -85 -10 3 -14 -2 -14 -18 0 -16 -13 -33 -39 -51 -22 -16 -44 -28 -49 -28 -6 0 -30 -11 -53 -25 -24 -14 -54 -25 -65 -25 -12 0 -27 -7 -34 -16 -15 -17 -74 -44 -97 -44 -27 0 -163 -94 -163 -113 0 -10 -6 -20 -14 -23 -24 -9 -39 -89 -34 -179 6 -95 1 -96 -49 -9 -25 45 -27 58 -28 159 0 106 1 110 22 113 19 3 21 6 10 23 -10 15 -9 25 4 47 8 15 23 26 32 26 9 -1 17 2 17 7 0 5 15 26 33 46 17 21 37 47 43 58 6 11 25 27 42 35 17 8 42 25 56 38 15 12 28 22 31 22 6 0 38 26 94 78 25 23 58 50 74 59 18 12 27 26 27 43 0 15 11 36 24 49 13 12 22 30 19 39 -2 10 3 31 11 47 23 43 20 149 -5 230 -11 37 -18 73 -15 81 3 9 -3 18 -17 23 -24 10 -61 48 -96 99 -22 31 -41 42 -41 23 0 -6 21 -38 48 -73 26 -35 53 -73 59 -85 17 -34 13 -86 -10 -147 -25 -64 -23 -77 10 -68 21 5 23 2 23 -27 0 -18 -4 -33 -10 -33 -5 0 -10 -4 -10 -9 0 -18 -154 -165 -186 -177 -17 -7 -47 -24 -67 -38 -20 -14 -41 -26 -46 -26 -13 0 -51 -42 -51 -56 0 -7 -10 -19 -22 -26 -29 -16 -73 -81 -84 -119 -7 -24 -6 -30 5 -25 8 3 11 1 7 -4 -9 -14 -7 -121 2 -130 4 -4 16 8 26 27 10 18 24 33 31 33 19 0 155 99 155 113 0 6 26 19 58 28 71 22 129 53 182 99 53 45 74 33 32 -18 -33 -41 -38 -62 -12 -62 17 0 59 35 121 101 70 73 81 115 74 278 -6 152 -23 236 -67 332 -28 60 -66 116 -91 133 -8 6 -18 17 -22 25 -7 15 -53 46 -145 97 -88 49 -177 67 -329 69 -115 1 -156 -2 -236 -26z",
  "M7837 4403 c-4 -3 -7 -26 -7 -50 0 -24 -4 -63 -9 -86 -24 -107 -31 -158 -37 -242 -3 -49 -10 -144 -16 -210 -22 -242 -4 -861 33 -1110 27 -184 63 -348 131 -600 17 -60 33 -124 37 -142 3 -17 16 -43 29 -58 33 -37 107 -182 122 -239 9 -31 20 -50 31 -53 10 -3 21 -15 25 -27 4 -11 22 -39 40 -62 19 -23 34 -45 34 -51 0 -5 16 -28 35 -50 19 -23 35 -48 35 -56 0 -8 7 -17 15 -20 8 -4 26 -24 40 -47 16 -25 33 -40 45 -40 26 0 25 19 -3 50 -47 51 -211 291 -253 370 -16 30 -32 57 -36 58 -5 2 -8 10 -8 17 0 8 -10 34 -23 57 -13 24 -38 79 -56 123 -19 44 -37 87 -41 95 -4 9 -11 31 -15 50 -4 19 -10 40 -14 45 -3 6 -14 39 -24 75 -10 36 -23 81 -28 100 -19 66 -49 215 -64 315 -44 287 -55 448 -55 775 0 270 6 386 41 750 10 113 19 220 19 238 0 30 -9 40 -23 25z",
  "M2320 4010 c-440 -29 -651 -140 -758 -400 -48 -115 -71 -224 -103 -495 -17 -139 -23 -649 -9 -715 50 -236 156 -395 331 -502 87 -52 261 -138 281 -138 8 0 18 -4 23 -9 6 -5 37 -17 70 -26 33 -9 83 -22 112 -30 183 -51 592 -67 853 -35 163 20 362 78 510 148 88 41 228 141 268 191 20 25 40 48 43 51 3 3 23 37 44 75 21 39 43 77 48 86 9 14 114 69 132 69 32 0 196 103 252 158 45 45 95 125 131 209 35 82 45 224 26 385 -8 73 -18 142 -23 153 -5 11 -19 47 -32 80 -23 60 -77 155 -108 187 -56 61 -82 82 -128 109 -57 33 -70 36 -224 48 -121 10 -155 23 -180 69 -9 18 -29 47 -43 65 -14 17 -26 34 -26 38 0 13 -145 117 -198 142 -65 32 -160 56 -266 68 -206 25 -773 35 -1026 19z",
  "M2295 3855 c-55 -7 -129 -21 -165 -30 -36 -10 -89 -20 -117 -22 -35 -3 -53 -9 -53 -18 0 -7 -15 -17 -32 -20 -59 -13 -100 -56 -103 -107 -1 -20 3 -28 15 -28 9 0 26 -11 39 -24 12 -12 41 -29 64 -36 23 -6 47 -16 53 -21 6 -5 37 -13 70 -18 32 -5 84 -16 114 -24 30 -8 57 -12 60 -7 3 4 30 4 60 -2 30 -5 246 -10 480 -10 459 -2 445 -3 680 57 121 31 176 67 186 122 7 37 -16 83 -41 83 -8 0 -15 5 -15 10 0 6 -7 10 -15 10 -17 0 -20 16 -5 25 12 8 13 25 1 25 -5 0 -11 -9 -14 -19 -4 -17 -9 -18 -53 -9 -27 5 -58 13 -69 18 -17 7 -87 18 -295 46 -97 13 -743 12 -845 -1z",
  "M4070 3307 c-14 -6 -37 -23 -52 -36 -24 -21 -27 -29 -22 -65 3 -23 9 -50 14 -61 5 -11 11 -54 14 -95 7 -89 35 -444 35 -447 1 -2 6 -3 11 -3 13 0 13 157 0 280 -5 52 -16 157 -24 233 -9 76 -13 144 -9 152 8 23 91 19 132 -6 44 -27 66 -52 96 -113 49 -98 57 -261 18 -380 -19 -56 -91 -137 -162 -181 -42 -26 -44 -28 -26 -41 10 -8 23 -14 28 -14 5 0 37 29 70 64 34 35 73 67 86 71 15 5 20 10 12 14 -15 10 6 61 25 61 27 0 30 316 4 386 -6 14 -10 42 -11 62 0 36 -1 36 -11 12 l-11 -25 -6 30 c-4 19 -13 31 -26 34 -11 2 -37 19 -58 37 -20 19 -43 34 -50 34 -6 0 -21 2 -32 5 -11 2 -31 -1 -45 -8z",
];

const CYCLE = 5600;
const DRAW_END = 2650;
const FILL_START = 3100;
const FILL_END = 3800;
const HOLD_END = 5000;
const FADE_END = 5600;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function ease(v: number) {
  const x = clamp01(v);
  return 0.5 - 0.5 * Math.cos(Math.PI * x);
}

interface Props {
  error?: string | null;
  onRetry?: () => void;
  onFinished?: () => void;
}

export default function PageLoader({ error, onRetry, onFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const filledGroupRef = useRef<SVGGElement>(null);
  const logoGroupRef = useRef<SVGGElement>(null);
  const iconPathsRef = useRef<SVGPathElement[]>([]);
  const textRefs = useRef<SVGTextElement[]>([]);
  const lengthsRef = useRef<number[]>([]);
  const textLengthsRef = useRef<number[]>([]);

  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const elapsedOffsetRef = useRef(0);
  const pausedRef = useRef(false);
  const pausedAtRef = useRef(0);
  const visibleRef = useRef(true);
  const inViewportRef = useRef(true);
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  });

  useEffect(() => {
    if (error) return;
    const container = containerRef.current;
    const outlineGroup = outlineGroupRef.current;
    const filledGroup = filledGroupRef.current;
    const logoGroup = logoGroupRef.current;
    if (!container || !outlineGroup || !filledGroup || !logoGroup) return;

    const iconPaths = Array.from(container.querySelectorAll<SVGPathElement>('[data-draw="icon"]'));
    const textEls = Array.from(container.querySelectorAll<SVGTextElement>('[data-draw="text"]'));
    iconPathsRef.current = iconPaths;
    textRefs.current = textEls;

    const prepare = () => {
      lengthsRef.current = iconPaths.map((p) => {
        try {
          const l = p.getTotalLength();
          return isFinite(l) && l > 0 ? l : 1000;
        } catch {
          return 1000;
        }
      });
      iconPaths.forEach((p, i) => {
        const l = lengthsRef.current[i];
        p.style.strokeDasharray = String(l);
        p.style.strokeDashoffset = String(l);
      });
      textLengthsRef.current = textEls.map((t) => {
        try {
          const b = t.getBBox();
          const l = (b.width + b.height) * 5.2;
          return isFinite(l) && l > 0 ? l : 800;
        } catch {
          return 800;
        }
      });
      textEls.forEach((t, i) => {
        const l = textLengthsRef.current[i];
        t.style.strokeDasharray = String(l);
        t.style.strokeDashoffset = String(l);
      });
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      prepare();
      iconPaths.forEach((p, i) => { p.style.strokeDashoffset = '0'; });
      textEls.forEach((t) => { t.style.strokeDashoffset = '0'; });
      outlineGroup.style.opacity = '0';
      filledGroup.style.opacity = '1';
      logoGroup.style.opacity = '1';
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current?.();
      }
      return;
    }

    prepare();

    const render = (now: number) => {
      const elapsed = (now - startRef.current + elapsedOffsetRef.current) % CYCLE;

      iconPaths.forEach((p, i) => {
        const delay = i * 90;
        const pDraw = ease((elapsed - delay) / DRAW_END);
        const l = lengthsRef.current[i] || 1000;
        p.style.strokeDashoffset = String(l * (1 - pDraw));
      });

      textEls.forEach((t, i) => {
        const delay = 220 + i * 180;
        const pDraw = ease((elapsed - delay) / DRAW_END);
        const l = textLengthsRef.current[i] || 800;
        t.style.strokeDashoffset = String(l * (1 - pDraw));
      });

      let fillP = 0;
      if (elapsed >= FILL_START) fillP = ease((elapsed - FILL_START) / (FILL_END - FILL_START));
      filledGroup.style.opacity = String(fillP);
      outlineGroup.style.opacity = String(1 - fillP);

      let logoOpacity = 1;
      if (elapsed >= HOLD_END) {
        const fadeP = ease((elapsed - HOLD_END) / (FADE_END - HOLD_END));
        logoOpacity = 1 - fadeP;
      }
      logoGroup.style.opacity = String(logoOpacity);

      if (elapsed >= FADE_END - 30 && !finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current?.();
      }
    };

    const shouldRun = () => !pausedRef.current && visibleRef.current && inViewportRef.current && !finishedRef.current;

    const tick = (now: number) => {
      if (!shouldRun()) { rafRef.current = 0; return; }
      render(now);
      if (finishedRef.current) { rafRef.current = 0; return; }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current) return;
      if (!shouldRun()) return;
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };

    startRef.current = performance.now();
    render(startRef.current);
    rafRef.current = requestAnimationFrame(tick);

    const onVisibility = () => {
      const now = performance.now();
      if (document.hidden) {
        if (!pausedRef.current) pausedAtRef.current = now;
        visibleRef.current = false;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      } else {
        visibleRef.current = true;
        if (!pausedRef.current) elapsedOffsetRef.current -= (now - (pausedAtRef.current || now));
        start();
      }
    };

    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const now = performance.now();
      if (entry.isIntersecting) {
        inViewportRef.current = true;
        if (!pausedRef.current) elapsedOffsetRef.current -= (now - (pausedAtRef.current || now));
        start();
      } else {
        if (!pausedRef.current && inViewportRef.current) pausedAtRef.current = now;
        inViewportRef.current = false;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      }
    }, { threshold: 0.01 });
    io.observe(container);

    document.addEventListener('visibilitychange', onVisibility);

    const onResize = () => { prepare(); };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      io.disconnect();
    };
  }, [error]);

  if (error) {
    return (
      <div className="page-loader" role="alert" aria-live="polite" data-testid="page-load-error">
        <h1 className="serif">No pudimos cargar la carta</h1>
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="text-cta focus-ring" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="page-loader" role="status" aria-live="polite" data-testid="page-loading">
      <span className="sr-only">Cargando la carta de Cafés de Carla</span>
      <div className="page-loader-stage">
        <svg
          className="page-loader-logo"
          viewBox="0 0 860 320"
          role="img"
          aria-labelledby="logoTitle logoDesc"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="logoTitle">Cafés de Carla</title>
          <desc id="logoDesc">Logotipo de Cafés de Carla con su icono y nombre.</desc>

          <defs>
            <g id="pl-icon-shape">
              <g transform="translate(0,236) scale(0.0230769,-0.0230769)">
                {ICON_PATHS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            </g>
          </defs>

          <g ref={logoGroupRef} className="logo-group">
            <g ref={outlineGroupRef} className="outline-group">
              <g transform="translate(44,42)">
                <g transform="translate(0,236) scale(0.0230769,-0.0230769)">
                  {ICON_PATHS.map((d, i) => (
                    <path
                      key={i}
                      data-draw="icon"
                      className="draw-path draw-icon"
                      d={d}
                    />
                  ))}
                </g>
              </g>
              <g>
                <text className="draw-text draw-text-main" x="320" y="148" data-draw="text">Cafés de</text>
                <text className="draw-text draw-text-main" x="320" y="248" data-draw="text">Carla</text>
              </g>
            </g>

            <g ref={filledGroupRef} className="filled-group" opacity="0">
              <g transform="translate(44,42)" className="fill-icon">
                <use href="#pl-icon-shape" fill="hsl(var(--accent))" stroke="none" />
              </g>
              <g>
                <text className="fill-text fill-text-main" x="320" y="148">Cafés de</text>
                <text className="fill-text fill-text-main" x="320" y="248">Carla</text>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
