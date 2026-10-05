"use client";

import { useEffect, useRef, useState } from "react";

// ─── Static config ────────────────────────────────────────────────────────────

const LETTER_FREQ: Record<string, number> = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9,
  J: 1, K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6,
  S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1,
};

const LETTER_PTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1,
  J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1,
  S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

// Pre-cached words avoid unnecessary dictionary API calls on first use
const PRE_VALID = new Set([
  "THE","AND","FOR","NOT","YOU","BUT","HIS","HER","SHE","ONE",
  "ALL","OUT","WHO","GET","CAN","SEE","TWO","HOW","OUR","NEW",
  "DAY","NOW","WAY","SAY","LET","SET","BIG","RUN","FUN","CUP",
  "CAT","DOG","HAT","MAN","FAN","PAN","EAT","NET","PET","WET",
  "JET","BUG","RUG","MUG","HUG","RED","BED","TEN","PEN","MEN",
  "HOT","POT","LOT","FIT","HIT","BIT","SIT","SUN","MAP","LAP",
  "NAP","TAP","AIR","ARM","ART","EAR","EGG","ICE","OIL","OWL",
  "THAT","HAVE","WITH","THIS","FROM","WILL","THEY","BEEN","EACH",
  "WHEN","MAKE","LIKE","TIME","JUST","KNOW","TAKE","YEAR","GOOD",
  "SOME","THEM","ONLY","COME","OVER","ALSO","BACK","MOST","GIVE",
  "WELL","EVEN","WANT","WORK","LONG","DOWN","SAME","MANY","VERY",
  // Food & cooking words — a little nod to the site theme 🍲
  "FOOD","BOWL","COOK","SPOON","STIR","MEAL","SOUP","BAKE","SALT",
  "HERB","RICE","BEAN","CORN","PORK","BEEF","FISH","MEAT","CAKE",
  "TART","MILK","HEAT","BITE","CHOP","FRY","POUR","ROAST","FOLD",
  "PASTA","SAUCE","CREAM","BREAD","TOAST","LEMON","ONION","SALAD",
  "GRAVY","STOCK","BROTH","SUGAR","HONEY","BERRY","APPLE","GRAPE",
  "PEACH","PLUM","SERVE","TASTE","SIMMER","BOIL","SLICE",
]);

const TOTAL_LETTERS = 36;
const LETTER_SIZE = 36;
const MIN_WORD = 3;
const STIR_MS = 2200;
const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LetterObj {
  letter: string;
  points: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any; // matter-js Body (using any to avoid needing @types/matter-js)
  element: HTMLDivElement;
  selected: boolean;
}

interface Bounds {
  width: number; height: number;
  cx: number; cy: number; radius: number;
}

interface FoundWord { word: string; points: number; }
interface Msg { id: number; text: string; type: "default"|"success"|"error"|"checking"; }

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlphabetSoupGame() {
  // DOM refs
  const soupRef    = useRef<HTMLDivElement>(null);
  const spoonRef   = useRef<HTMLDivElement>(null);
  const steamRef   = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const wordDisplayRef = useRef<HTMLDivElement>(null);

  // React state — drives the visible UI
  const [score, setScore]         = useState(0);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordStatus, setWordStatus] = useState<"neutral"|"valid"|"invalid">("neutral");
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [isStirring, setIsStirring] = useState(false);
  const [wordSuccessAnim, setWordSuccessAnim] = useState(false);

  // Non-reactive game state (mutated directly — no re-render needed)
  const g = useRef({
    letters:   [] as LetterObj[],
    selected:  [] as LetterObj[],
    found:     new Set<string>(),
    stirring:  false,
    spooning:  false,
    bounds:    null as Bounds | null,
    cache:     {} as Record<string, boolean>,
    lastXY:    { x: 0, y: 0 },
    msgId:     0,
  });

  // Physics refs (cleaned up on unmount)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MatterLib = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const engineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runnerRef = useRef<any>(null);
  const rafMain   = useRef(0);
  const rafStir   = useRef(0);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const showMsg = (text: string, type: Msg["type"]) => {
    const id = ++g.current.msgId;
    setMessages(p => [...p, { id, text, type }]);
    setTimeout(() => setMessages(p => p.filter(m => m.id !== id)), 2400);
  };

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const spawnParticles = (x: number, y: number) => {
    const c = particlesRef.current;
    if (!c) return;
    const cols = ["#7d8b6f","#e8b4a0","#f5c8b4","#9bb5c4","#ffd498"];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement("div");
      el.className = "soup-particle";
      const sz = 4 + Math.random() * 7;
      el.style.width  = `${sz}px`;
      el.style.height = `${sz}px`;
      el.style.backgroundColor = cols[~~(Math.random() * cols.length)];
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      el.style.setProperty("--tx", `${(Math.random() - 0.5) * 190}px`);
      el.style.setProperty("--ty", `${(Math.random() - 0.5) * 190 - 45}px`);
      c.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }
  };

  // ─── Word state ─────────────────────────────────────────────────────────────

  // Syncs currentWord + wordStatus React state from the imperative selected array
  const syncWord = (sel: LetterObj[]) => {
    const word = sel.map(l => l.letter).join("");
    setCurrentWord(word);
    if (word.length >= MIN_WORD) {
      if (word in g.current.cache) {
        setWordStatus(g.current.cache[word] && !g.current.found.has(word) ? "valid" : "invalid");
      } else {
        setWordStatus("neutral");
        // Fire-and-forget background validation so the display updates once resolved
        validateWord(word).catch(() => {});
      }
    } else {
      setWordStatus("neutral");
    }
  };

  const clearSel = () => {
    g.current.selected.forEach(l => {
      l.selected = false;
      l.element.classList.remove("selected");
    });
    g.current.selected = [];
    setCurrentWord("");
    setWordStatus("neutral");
  };

  const selectLetter = (idx: number) => {
    const gs = g.current;
    if (gs.stirring) return;
    const obj = gs.letters[idx];

    // Ripple effect
    const rip = document.createElement("div");
    rip.className = "soup-ripple";
    obj.element.appendChild(rip);
    setTimeout(() => rip.remove(), 580);

    if (obj.selected) {
      // Clicking a selected letter removes it and everything after it
      const i = gs.selected.indexOf(obj);
      if (i !== -1) {
        gs.selected.splice(i).forEach(l => {
          l.selected = false;
          l.element.classList.remove("selected");
        });
      }
    } else {
      obj.selected = true;
      obj.element.classList.add("selected");
      gs.selected.push(obj);
    }
    syncWord(gs.selected);
  };

  // ─── Word validation ─────────────────────────────────────────────────────────

  const validateWord = async (word: string): Promise<boolean> => {
    const gs = g.current;
    if (word in gs.cache) return gs.cache[word];

    // Fast path — pre-cached list
    if (PRE_VALID.has(word)) {
      gs.cache[word] = true;
      if (gs.selected.map(l => l.letter).join("") === word) syncWord(gs.selected);
      return true;
    }

    // Slow path — dictionary API
    try {
      const res = await fetch(`${DICT_API}${word.toLowerCase()}`);
      gs.cache[word] = res.ok;
      if (gs.selected.map(l => l.letter).join("") === word) syncWord(gs.selected);
      return res.ok;
    } catch {
      // Network failure — be generous and accept the word
      gs.cache[word] = true;
      return true;
    }
  };

  // ─── Submit word ─────────────────────────────────────────────────────────────

  const submitWord = async () => {
    const gs = g.current;
    const word = gs.selected.map(l => l.letter).join("");

    if (word.length < MIN_WORD) {
      showMsg(`Need at least ${MIN_WORD} letters!`, "error");
      return;
    }
    if (gs.found.has(word)) {
      showMsg("Already found that one!", "error");
      return;
    }

    showMsg(`Checking "${word}"…`, "checking");
    const valid = await validateWord(word);
    if (!valid) {
      showMsg("Not a valid word!", "error");
      return;
    }

    // Score: sum of letter values + bonuses for long words
    let pts = gs.selected.reduce((s, l) => s + l.points, 0);
    if (word.length >= 5) pts += 3;
    if (word.length >= 7) pts += 5;

    gs.found.add(word);
    setScore(s => s + pts);
    setFoundWords(p => [...p, { word, points: pts }]);
    showMsg(`+${pts} points! 🎉`, "success");

    // Particle burst at the word display position
    const wd = wordDisplayRef.current;
    if (wd) {
      const r = wd.getBoundingClientRect();
      spawnParticles(r.left + r.width / 2, r.top + r.height / 2);
    }

    // Brief scale pulse on the word display
    setWordSuccessAnim(true);
    setTimeout(() => setWordSuccessAnim(false), 600);

    clearSel();
  };

  // ─── Stir animation ──────────────────────────────────────────────────────────

  const stirSoup = (initial = false) => {
    const gs = g.current;
    const M = MatterLib.current;
    if (gs.stirring || !gs.bounds || !M) return;

    gs.stirring = true;
    setIsStirring(true);
    clearSel();

    const spoon  = spoonRef.current!;
    const bounds = gs.bounds;
    const dur    = initial ? 1500 : STIR_MS;
    const t0     = performance.now();
    spoon.style.display = "block";

    const animate = (now: number) => {
      const prog = Math.min((now - t0) / dur, 1);
      // Ease in-out cubic
      const eased = prog < 0.5
        ? 4 * prog * prog * prog
        : 1 - Math.pow(-2 * prog + 2, 3) / 2;

      // 1.5 full rotations, radius spirals inward
      const angle  = eased * Math.PI * 3;
      const radius = bounds.radius * (0.38 - 0.15 * eased);
      const x = bounds.cx + radius * Math.cos(angle);
      const y = bounds.cy + radius * Math.sin(angle);

      spoon.style.left      = `${x}px`;
      spoon.style.top       = `${y}px`;
      spoon.style.transform = `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI + 45}deg)`;

      // Push letters near the spoon outward
      gs.letters.forEach(({ body }) => {
        const pos = body.position;
        const dx = pos.x - x, dy = pos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 82) {
          const f = 0.003 * (1 - dist / 82);
          const a = Math.atan2(dy, dx);
          M.Body.applyForce(body, pos, { x: Math.cos(a) * f, y: Math.sin(a) * f });
        }
      });

      if (prog < 1) {
        rafStir.current = requestAnimationFrame(animate);
      } else {
        spoon.style.display = "none";
        gs.stirring = false;
        setIsStirring(false);
      }
    };

    rafStir.current = requestAnimationFrame(animate);
  };

  // ─── Drag-to-push interaction ────────────────────────────────────────────────

  const dragSoup = (x: number, y: number, mvX: number, mvY: number) => {
    const gs = g.current;
    const M  = MatterLib.current;
    if (!M) return;

    const spoon = spoonRef.current;
    if (spoon) {
      const da = Math.atan2(y - gs.lastXY.y, x - gs.lastXY.x);
      spoon.style.left      = `${x}px`;
      spoon.style.top       = `${y}px`;
      spoon.style.transform = `translate(-50%, -50%) rotate(${(da * 180) / Math.PI + 45}deg)`;
    }
    gs.lastXY = { x, y };

    gs.letters.forEach(({ body }) => {
      const pos = body.position;
      const dx = pos.x - x, dy = pos.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 72) {
        const f = 0.001 * (1 - dist / 72);
        const a = Math.atan2(dy, dx);
        M.Body.applyForce(body, pos, {
          x: Math.cos(a) * f + mvX * 0.00013,
          y: Math.sin(a) * f + mvY * 0.00013,
        });
      }
    });
  };

  // ─── Mount / cleanup ─────────────────────────────────────────────────────────

  useEffect(() => {
    let destroyed = false;
    const gs = g.current;

    (async () => {
      // Dynamic import so matter-js never runs on the server
      const M = await import("matter-js");
      if (destroyed) return;
      MatterLib.current = M;

      // Measure the soup container
      const soupEl = soupRef.current!;
      const rect   = soupEl.getBoundingClientRect();
      const bounds: Bounds = {
        width: rect.width, height: rect.height,
        cx: rect.width / 2, cy: rect.height / 2,
        radius: Math.min(rect.width, rect.height) / 2 - 12,
      };
      gs.bounds = bounds;

      // Pre-populate validation cache so common words show "valid" immediately
      PRE_VALID.forEach(w => { gs.cache[w] = true; });

      // Steam wisps
      const steamEl = steamRef.current;
      if (steamEl) {
        for (let i = 0; i < 8; i++) {
          const s = document.createElement("div");
          s.className = "soup-steam";
          s.style.left             = `${8 + i * 11}%`;
          s.style.height           = `${26 + Math.random() * 18}px`;
          s.style.animationDelay   = `${Math.random() * 4}s`;
          steamEl.appendChild(s);
        }
      }

      // ── Physics engine ──────────────────────────────────────────────────────
      const eng = M.Engine.create({ enableSleeping: false });
      eng.world.gravity.y = 0;
      eng.world.gravity.x = 0;
      engineRef.current = eng;

      // Approximate the circular bowl wall with 36 thin rectangle segments
      for (let i = 0; i < 36; i++) {
        const a1 = (i * Math.PI * 2) / 36;
        const a2 = ((i + 1) * Math.PI * 2) / 36;
        const x1 = bounds.cx + bounds.radius * Math.cos(a1);
        const y1 = bounds.cy + bounds.radius * Math.sin(a1);
        const x2 = bounds.cx + bounds.radius * Math.cos(a2);
        const y2 = bounds.cy + bounds.radius * Math.sin(a2);
        M.Composite.add(
          eng.world,
          M.Bodies.rectangle(
            (x1 + x2) / 2, (y1 + y2) / 2,
            Math.hypot(x2 - x1, y2 - y1), 10,
            { angle: Math.atan2(y2 - y1, x2 - x1), isStatic: true, render: { visible: false } }
          )
        );
      }

      // ── Letter tiles ────────────────────────────────────────────────────────
      let pool: string[] = [];
      for (const [letter, freq] of Object.entries(LETTER_FREQ)) {
        for (let i = 0; i < Math.max(1, Math.ceil(freq / 3)); i++) pool.push(letter);
      }
      shuffle(pool);
      pool = pool.slice(0, TOTAL_LETTERS);

      pool.forEach((letter, idx) => {
        const el = document.createElement("div");
        el.className = "soup-letter";
        el.innerHTML = `${letter}<span class="soup-letter-pts">${LETTER_PTS[letter]}</span>`;
        soupEl.appendChild(el);

        const body = M.Bodies.rectangle(
          bounds.cx + (Math.random() - 0.5) * 20,
          bounds.cy + (Math.random() - 0.5) * 20,
          LETTER_SIZE, LETTER_SIZE,
          { restitution: 0.65, friction: 0.001, frictionAir: 0.055, density: 0.001 }
        );
        M.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        });
        M.Composite.add(eng.world, body);

        gs.letters.push({ letter, points: LETTER_PTS[letter], body, element: el, selected: false });
        el.addEventListener("click", () => selectLetter(idx));
      });

      // ── Runner ──────────────────────────────────────────────────────────────
      const r = M.Runner.create();
      M.Runner.run(r, eng);
      runnerRef.current = r;

      // ── RAF loop: sync DOM positions from physics every frame ────────────────
      // We use CSS custom property --rot instead of element.style.transform so
      // that the .selected CSS scale() can compose on top without fighting us.
      const loop = () => {
        gs.letters.forEach(({ body, element }) => {
          element.style.left = `${body.position.x - LETTER_SIZE / 2}px`;
          element.style.top  = `${body.position.y - LETTER_SIZE / 2}px`;
          element.style.setProperty("--rot", `${body.angle}rad`);
        });
        rafMain.current = requestAnimationFrame(loop);
      };
      rafMain.current = requestAnimationFrame(loop);

      // ── Event listeners ─────────────────────────────────────────────────────
      const getXY = (e: MouseEvent | TouchEvent) => {
        const r  = soupEl.getBoundingClientRect();
        const src = "touches" in e ? e.touches[0] : e;
        return {
          x:   src.clientX - r.left,
          y:   src.clientY - r.top,
          mvX: "movementX" in e ? (e as MouseEvent).movementX : 0,
          mvY: "movementY" in e ? (e as MouseEvent).movementY : 0,
        };
      };

      const startSpoon = (e: MouseEvent | TouchEvent) => {
        if (gs.stirring) return;
        const { x, y } = getXY(e);
        gs.lastXY = { x, y };
        gs.spooning = true;
        const sp = spoonRef.current;
        if (sp) { sp.style.display = "block"; sp.style.left = `${x}px`; sp.style.top = `${y}px`; }
      };
      const moveSpoon = (e: MouseEvent | TouchEvent) => {
        if (!gs.spooning || gs.stirring) return;
        const { x, y, mvX, mvY } = getXY(e);
        dragSoup(x, y, mvX, mvY);
      };
      const endSpoon = () => {
        if (gs.spooning) {
          gs.spooning = false;
          const sp = spoonRef.current;
          if (sp) sp.style.display = "none";
        }
      };

      soupEl.addEventListener("mousedown",  startSpoon);
      soupEl.addEventListener("mousemove",  moveSpoon);
      document.addEventListener("mouseup",  endSpoon);
      soupEl.addEventListener("touchstart", startSpoon as EventListener, { passive: false });
      soupEl.addEventListener("touchmove",  moveSpoon  as EventListener, { passive: false });
      document.addEventListener("touchend", endSpoon);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter")  submitWord();
        else if (e.key === "Escape") clearSel();
        else if (e.key === " ") { e.preventDefault(); stirSoup(); }
      };
      document.addEventListener("keydown", onKey);

      // Store cleanup functions on the element so the return callback can reach them
      (soupEl as { _cleanup?: () => void })._cleanup = () => {
        soupEl.removeEventListener("mousedown",  startSpoon);
        soupEl.removeEventListener("mousemove",  moveSpoon);
        document.removeEventListener("mouseup",  endSpoon);
        soupEl.removeEventListener("touchstart", startSpoon as EventListener);
        soupEl.removeEventListener("touchmove",  moveSpoon  as EventListener);
        document.removeEventListener("touchend", endSpoon);
        document.removeEventListener("keydown",  onKey);
      };

      // Initial stir after a short delay so letters have time to spawn
      setTimeout(() => { if (!destroyed) stirSoup(true); }, 450);
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafMain.current);
      cancelAnimationFrame(rafStir.current);

      const M   = MatterLib.current;
      const eng = engineRef.current;
      const r   = runnerRef.current;
      if (M && r && eng) {
        M.Runner.stop(r);
        M.Engine.clear(eng);
        M.Composite.clear(eng.world, false);
      }

      const soupEl = soupRef.current;
      if (soupEl) {
        (soupEl as { _cleanup?: () => void })._cleanup?.();
        gs.letters.forEach(l => l.element.remove());
        gs.letters = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="py-12 md:py-16 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brown-dark font-heading mb-2">
            🍲 Alphabet Soup
          </h2>
          <p className="text-brown-light text-sm md:text-base">
            Stir the soup and spell words to score points!
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">

          {/* ── Bowl ── */}
          <div
            className="relative w-full max-w-[380px] md:max-w-[440px]"
            style={{ aspectRatio: "1" }}
          >
            {/* Drop shadow under the plate */}
            <div
              className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[88%] h-4 rounded-full"
              style={{ background: "rgba(107,91,79,0.11)", filter: "blur(10px)", zIndex: 1 }}
            />
            {/* Plate rim */}
            <div
              className="absolute bottom-0 left-0 w-full h-4 rounded-full"
              style={{ background: "linear-gradient(to bottom, #f8f4ef, #e8e0d8)", zIndex: 2 }}
            />
            {/* Outer bowl — circular clip for everything inside */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: "white",
                boxShadow: "0 14px 32px rgba(107,91,79,0.12), 0 4px 12px rgba(107,91,79,0.08)",
                zIndex: 3,
              }}
            >
              {/* Soup surface — letter tiles are imperatively appended here */}
              <div
                ref={soupRef}
                className="absolute inset-[16px] rounded-full overflow-hidden cursor-pointer"
                style={{
                  background: "radial-gradient(ellipse at 38% 32%, #fde8d0 0%, #f5c89a 55%, #e8a864 100%)",
                  boxShadow: "inset 0 -10px 20px rgba(168,90,30,0.18), inset 0 10px 20px rgba(255,255,255,0.22)",
                }}
              >
                {/* Spoon — shares the soup coordinate space so positions match letter tiles */}
                <div
                  ref={spoonRef}
                  className="absolute pointer-events-none"
                  style={{ display: "none", zIndex: 10 }}
                >
                  {/* Spoon handle */}
                  <div style={{
                    position: "absolute", width: "9px", height: "105px",
                    background: "linear-gradient(to right, #c4b09a, #e8d8c4, #c4b09a)",
                    borderRadius: "4px", bottom: "-105px", left: "-4.5px",
                  }} />
                  {/* Spoon head */}
                  <div style={{
                    position: "absolute", width: "32px", height: "44px",
                    background: "linear-gradient(160deg, #f0e5d8 0%, #e0cfc0 100%)",
                    borderRadius: "50%", top: "-22px", left: "-16px",
                    boxShadow: "inset 0 3px 5px rgba(0,0,0,0.09)",
                  }} />
                </div>
              </div>

              {/* Bowl interior highlight */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                style={{
                  width: "80%", height: "38%",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.26), transparent)",
                  zIndex: 4,
                }}
              />

              {/* Steam container — wisps created imperatively */}
              <div
                ref={steamRef}
                className="absolute left-0 w-full pointer-events-none"
                style={{ top: "-8px", height: "52px", zIndex: 5 }}
              />
            </div>
          </div>

          {/* ── Word display ── */}
          <div
            ref={wordDisplayRef}
            id="soup-word-display"
            className={[
              "w-full min-h-[58px] rounded-full px-6 py-3",
              "flex items-center justify-center",
              "text-2xl font-bold tracking-widest font-heading",
              "shadow-sm transition-colors duration-200",
              wordStatus === "valid"   ? "bg-sage-dark text-white" : "",
              wordStatus === "invalid" ? "bg-peach-dark text-white" : "",
              wordStatus === "neutral" ? "bg-white text-brown-dark" : "",
              wordSuccessAnim ? "soup-word-success" : "",
            ].join(" ")}
          >
            {currentWord || (
              <span className="text-brown-light/50 text-sm font-normal font-body tracking-normal">
                Click letters to spell a word…
              </span>
            )}
          </div>

          {/* ── Control buttons ── */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => stirSoup()}
              disabled={isStirring}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-dusty-blue text-white hover:bg-dusty-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              🥄 Stir Soup
            </button>
            <button
              onClick={submitWord}
              disabled={isStirring || currentWord.length < MIN_WORD}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-sage text-white hover:bg-sage-dark transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              ✓ Submit Word
            </button>
            <button
              onClick={clearSel}
              disabled={isStirring}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-peach text-white hover:bg-peach-dark transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              ✕ Clear
            </button>
          </div>

          {/* ── Scoreboard ── */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-cream-dark">
              <h3 className="font-bold text-brown-dark font-heading text-lg">Found Words</h3>
              <span className="font-bold text-sage-dark text-lg">Score: {score}</span>
            </div>
            {foundWords.length === 0 ? (
              <p className="text-sm text-center py-2 text-brown-light/50">
                No words found yet…
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[136px] overflow-y-auto pr-1">
                {foundWords.map(({ word, points }) => (
                  <span
                    key={word}
                    className="flex items-center gap-1.5 bg-cream-dark px-3 py-1 rounded-full text-sm font-semibold text-brown-dark"
                  >
                    {word}
                    <span className="bg-sage-dark text-white w-[22px] h-[22px] rounded-full text-[11px] flex items-center justify-center font-bold leading-none">
                      {points}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Instructions ── */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm mb-2">
            <h3 className="font-bold text-brown-dark font-heading mb-2">How to play</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-brown-light">
              <li>Click and drag in the soup to stir the letters around</li>
              <li>Click letters to build a word (3+ letters)</li>
              <li>Submit to earn points — longer words score a bonus!</li>
              <li>
                Shortcuts:{" "}
                <kbd className="px-1.5 py-0.5 bg-cream-dark rounded text-xs font-mono">Space</kbd> stir ·{" "}
                <kbd className="px-1.5 py-0.5 bg-cream-dark rounded text-xs font-mono">Enter</kbd> submit ·{" "}
                <kbd className="px-1.5 py-0.5 bg-cream-dark rounded text-xs font-mono">Esc</kbd> clear
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Floating toast messages */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none w-[90%] max-w-sm">
        {messages.map(({ id, text, type }) => (
          <div
            key={id}
            className={[
              "px-5 py-3 rounded-full text-center font-semibold text-sm shadow-md",
              "animate-[soup-msg_2.4s_forwards]",
              type === "success"  ? "bg-sage-dark text-white"   : "",
              type === "error"    ? "bg-peach-dark text-white"  : "",
              type === "checking" ? "bg-dusty-blue text-white"  : "",
              type === "default"  ? "bg-brown-dark text-white"  : "",
            ].join(" ")}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Particle layer — fixed so particles fly over the whole page */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 999 }} />
    </section>
  );
}
