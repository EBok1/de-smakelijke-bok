// Meal planner logic: pure functions, no storage or React.
import type { IngredientLine, RecipeMeta } from './recipes';

export type PlanMode = 'mixed' | 'healthy' | 'easy' | 'new' | 'vegetarian';
export const PLAN_MODES: PlanMode[] = ['mixed', 'healthy', 'easy', 'new', 'vegetarian'];

export interface PlannerRecipe {
  slug: string;
  title: string;
  image?: string;
  category: RecipeMeta['category'];
  tags: string[];
  minutes: number | null;
  servings: number;
  ingredients: IngredientLine[];
}

export interface WeekSettings {
  mode: PlanMode;
  /** Bumped by "shuffle again" to get a different suggestion for the same week */
  shuffle: number;
  /** Per weekday (0 = Monday): a recipe slug, or null for a free evening */
  overrides: Record<number, string | null>;
}

export const DEFAULT_WEEK: WeekSettings = { mode: 'mixed', shuffle: 0, overrides: {} };

// ─── Dates ──────────────────────────────────────────────────────────────────

export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** ISO-8601 week number and its year (the year of that week's Thursday). */
export function isoWeek(monday: Date): { year: number; week: number } {
  const thursday = addDays(monday, 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week =
    1 + Math.round((thursday.getTime() - startOfWeek(firstThursday).getTime()) / (7 * 86400000));
  return { year: thursday.getFullYear(), week };
}

export function weekKey(monday: Date): string {
  const { year, week } = isoWeek(monday);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// ─── Suggestions ────────────────────────────────────────────────────────────

// Small seeded RNG: the same week + settings always give the same plan,
// and every new week gives a different one.
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function matchesMode(recipe: PlannerRecipe, mode: PlanMode): boolean {
  switch (mode) {
    case 'healthy':
      return recipe.tags.includes('healthy');
    case 'easy':
      return recipe.tags.includes('easy') && (recipe.minutes === null || recipe.minutes <= 40);
    case 'vegetarian':
      return recipe.tags.includes('vegetarian') || recipe.tags.includes('vegan');
    default:
      return true;
  }
}

/**
 * Seven dinners for a week. Recipes that fit the chosen option come first;
 * the rest fill up the week. Recipes only repeat once all have been used,
 * and never two nights in a row.
 */
export function suggestWeek(
  dinners: PlannerRecipe[],
  key: string,
  settings: WeekSettings,
  lastWeek: (string | null)[] = [],
): (string | null)[] {
  if (dinners.length === 0) return Array(7).fill(null);

  const random = mulberry32(hashString(`${key}:${settings.mode}:${settings.shuffle}`));
  const pool = shuffled(dinners, random);
  const preferred =
    settings.mode === 'new'
      ? pool.filter((r) => !lastWeek.includes(r.slug))
      : pool.filter((r) => matchesMode(r, settings.mode));
  const order = [...preferred, ...pool.filter((r) => !preferred.includes(r))];

  return Array.from({ length: 7 }, (_, day) => order[day % order.length].slug);
}

/** The week as shown: the suggestion with the user's own changes on top. */
export function resolveWeek(
  dinners: PlannerRecipe[],
  key: string,
  settings: WeekSettings,
  lastWeek: (string | null)[] = [],
): (string | null)[] {
  return suggestWeek(dinners, key, settings, lastWeek).map((slug, day) =>
    day in settings.overrides ? settings.overrides[day] : slug,
  );
}

// ─── Shopping list ──────────────────────────────────────────────────────────

type UnitKey = 'g' | 'kg' | 'ml' | 'l' | 'tbsp' | 'tsp' | 'clove' | 'packet' | 'can' | 'head' | 'knob';

const UNIT_PATTERNS: [RegExp, UnitKey][] = [
  [/^(grams?|gr|g)\b/i, 'g'],
  [/^kg\b/i, 'kg'],
  [/^ml\b/i, 'ml'],
  [/^(liters?|l)\b/i, 'l'],
  [/^(eetlepels?|el|tablespoons?|tbsp)\b/i, 'tbsp'],
  [/^(theelepels?|tl|teaspoons?|tsp)\b/i, 'tsp'],
  [/^(teentjes?|tenen|teen|cloves?)\b/i, 'clove'],
  [/^(zakjes?|packets?)\b/i, 'packet'],
  [/^(blikjes?|blikken|blik|cans?)\b/i, 'can'],
  [/^(stronks?|stronken|heads? of)\b/i, 'head'],
  [/^(klontjes?|knobs? of)\b/i, 'knob'],
];

const UNIT_LABELS: Record<UnitKey, { nl: [string, string]; en: [string, string] }> = {
  g: { nl: ['g', 'g'], en: ['g', 'g'] },
  kg: { nl: ['kg', 'kg'], en: ['kg', 'kg'] },
  ml: { nl: ['ml', 'ml'], en: ['ml', 'ml'] },
  l: { nl: ['l', 'l'], en: ['l', 'l'] },
  tbsp: { nl: ['el', 'el'], en: ['tbsp', 'tbsp'] },
  tsp: { nl: ['tl', 'tl'], en: ['tsp', 'tsp'] },
  clove: { nl: ['teen', 'tenen'], en: ['clove', 'cloves'] },
  packet: { nl: ['zakje', 'zakjes'], en: ['packet', 'packets'] },
  can: { nl: ['blik', 'blikken'], en: ['can', 'cans'] },
  head: { nl: ['stronk', 'stronken'], en: ['head of', 'heads of'] },
  knob: { nl: ['klontje', 'klontjes'], en: ['knob of', 'knobs of'] },
};

const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75 };

function toNumber(value: string): number {
  if (value in FRACTIONS) return FRACTIONS[value];
  if (value.includes('/')) {
    const [a, b] = value.split('/').map(Number);
    return a / b;
  }
  return Number(value.replace(',', '.'));
}

interface ParsedIngredient {
  low: number;
  high: number;
  unit: UnitKey | null;
  name: string;
}

const AMOUNT = String.raw`(\d+(?:[.,]\d+)?|\d+\/\d+|[½¼¾])`;
const AMOUNT_RE = new RegExp(`^${AMOUNT}(?:\\s*-\\s*${AMOUNT})?\\s+(.+)$`);

function parseIngredient(text: string): ParsedIngredient | null {
  const match = text.match(AMOUNT_RE);
  if (!match) return null;
  const low = toNumber(match[1]);
  const high = match[2] ? toNumber(match[2]) : low;
  let rest = match[3];
  let unit: UnitKey | null = null;
  for (const [pattern, key] of UNIT_PATTERNS) {
    if (pattern.test(rest)) {
      unit = key;
      rest = rest.replace(pattern, '').trim();
      break;
    }
  }
  return { low, high, unit, name: cleanName(rest) };
}

function cleanName(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(naar smaak|to taste)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── One name per ingredient ────────────────────────────────────────────────
// Recipes word the same thing differently ("1 ui" / "2 uien", "verse pesto" /
// "pesto"). Everything below maps those onto one key so the list adds them up.

// [singular, plural] — the key is the singular, the label picks by amount
const NOUNS: Record<'nl' | 'en', [string, string][]> = {
  nl: [
    ['ui', 'uien'],
    ['ei', 'eieren'],
    ['paprika', "paprika's"],
    ['tomaat', 'tomaten'],
    ['wortel', 'wortels'],
    ['komkommer', 'komkommers'],
    ['courgette', 'courgettes'],
    ['avocado', "avocado's"],
    ['zoete aardappel', 'zoete aardappelen'],
    ['kipfilet', 'kipfilets'],
    ['bouillonblokje', 'bouillonblokjes'],
  ],
  en: [
    ['onion', 'onions'],
    ['egg', 'eggs'],
    ['bell pepper', 'bell peppers'],
    ['tomato', 'tomatoes'],
    ['carrot', 'carrots'],
    ['cucumber', 'cucumbers'],
    ['zucchini', 'zucchinis'],
    ['avocado', 'avocados'],
    ['sweet potato', 'sweet potatoes'],
    ['chicken breast', 'chicken breasts'],
    ['stock cube', 'stock cubes'],
  ],
};

// Different words, same thing to buy
const ALIASES: Record<string, string> = {
  roomboter: 'boter',
  'witte rijst': 'rijst',
  'white rice': 'rice',
  'zwarte peper': 'peper',
  'black pepper': 'pepper',
  'plantaardige olie': 'olie',
  zonnebloemolie: 'olie',
  'vegetable oil': 'oil',
  'sunflower oil': 'oil',
  'sweet soy sauce': 'ketjap manis',
};

function normalizeName(name: string, locale: 'nl' | 'en'): { key: string; forms: [string, string] } {
  let base = name
    .toLowerCase()
    // "verse pesto", "mager rundergehakt": same shelf in the shop
    .replace(/\b(verse|vers|fresh|magere?|lean)\s+/g, '')
    .trim();
  base = ALIASES[base] ?? base;
  const noun = NOUNS[locale].find(([one, many]) => base === one || base === many);
  if (noun) return { key: noun[0], forms: noun };
  // Keep the recipe's own capitals ("Maggi") when nothing was rewritten
  const label = base === name.toLowerCase() ? name : base;
  return { key: base, forms: [label, label] };
}

// "Snuf zout", "scheut olijfolie om in te bakken" → "zout", "olijfolie"
const PANTRY_AMOUNT =
  /^(flinke\s+|generous\s+)?(snufje|snuf|scheutje|scheut|handvol|klontje|beetje|pinch of|splash of|drizzle of|handful of|knob of|dash of)\s+/i;
const PANTRY_PURPOSE = /\s+(om (in )?te bakken|om te bestrooien|for frying|for sprinkling)$/i;

function pantryNames(text: string): string[] {
  const name = cleanName(text).replace(PANTRY_AMOUNT, '').replace(PANTRY_PURPOSE, '');
  // "Zout en peper" is two things; "sojasaus of sweet chilisaus" is a choice, keep it whole
  return name.split(/\s+(?:en|and)\s+/i).map((part) => part.trim()).filter(Boolean);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Optional extras and second-choice variants ("Dressing optie 2", the
// gluten-free version) would double the shopping, so they are left out.
function isSkipped(line: IngredientLine): boolean {
  if (/^(eventueel|optioneel|optional)\b/i.test(line.text)) return true;
  // A stray sub-heading written as a list item
  if (/^(basis ingrediënten|base ingredients)$/i.test(line.text)) return true;
  if (/optioneel|optional|glutenvrij|gluten-free/i.test(line.section)) return true;
  const option = line.section.match(/\b(optie|option)\s*(\d+)/i);
  return option !== null && Number(option[2]) > 1;
}

function roundAmount(value: number, unit: UnitKey | null): number {
  if (unit === 'g' || unit === 'ml') {
    return value >= 20 ? Math.round(value / 5) * 5 : Math.round(value);
  }
  if (unit === 'kg' || unit === 'l') return Math.round(value * 10) / 10;
  // Onions, eggs, spoons…: round up to a half, you can't buy 0.3 of an onion
  return Math.max(0.5, Math.ceil(value * 2) / 2);
}

function formatAmount(value: number, unit: UnitKey | null, locale: 'nl' | 'en'): string {
  // Kilos and litres keep their decimal: 1,8 kg, not 1½
  if (unit === 'kg' || unit === 'l') return value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const whole = Math.floor(value);
  const half = value - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? '½' : `${whole}½`;
}

export interface ShoppingItem {
  key: string;
  label: string;
  recipes: string[];
}

export interface ShoppingList {
  items: ShoppingItem[];
  /** Lines without an amount (salt, a splash of oil…): check the cupboard */
  pantry: ShoppingItem[];
}

export function buildShoppingList(
  planned: PlannerRecipe[],
  persons: number,
  locale: 'nl' | 'en',
): ShoppingList {
  // One entry per ingredient; amounts in different units stay side by side
  // ("80 g + 8 el bloem") because they can't be added up
  const amounts = new Map<
    string,
    {
      forms: [string, string];
      units: Map<UnitKey | null, { low: number; high: number }>;
      recipes: Set<string>;
    }
  >();
  const pantry = new Map<string, { label: string; recipes: Set<string> }>();

  for (const recipe of planned) {
    const factor = persons / (recipe.servings || 4);
    for (const line of recipe.ingredients) {
      if (isSkipped(line)) continue;
      const parsed = parseIngredient(line.text);

      if (!parsed) {
        for (const name of pantryNames(line.text)) {
          const { key, forms } = normalizeName(name, locale);
          const entry = pantry.get(key) ?? { label: capitalize(forms[0]), recipes: new Set<string>() };
          entry.recipes.add(recipe.title);
          pantry.set(key, entry);
        }
        continue;
      }

      const { key, forms } = normalizeName(parsed.name, locale);
      const entry = amounts.get(key) ?? { forms, units: new Map(), recipes: new Set<string>() };
      // Count kilos as grams and litres as millilitres so "500 g" and "1 kg" add up
      const scale = parsed.unit === 'kg' || parsed.unit === 'l' ? 1000 : 1;
      const unit = parsed.unit === 'kg' ? 'g' : parsed.unit === 'l' ? 'ml' : parsed.unit;
      const total = entry.units.get(unit) ?? { low: 0, high: 0 };
      total.low += parsed.low * scale * factor;
      total.high += parsed.high * scale * factor;
      entry.units.set(unit, total);
      entry.recipes.add(recipe.title);
      amounts.set(key, entry);
    }
  }

  // Already on the list with an amount ("2 el ketjap manis"): the cupboard
  // line ("scheut ketjap manis") is covered, so only its recipes carry over
  for (const [key, entry] of pantry) {
    const item = amounts.get(key);
    if (!item) continue;
    entry.recipes.forEach((title) => item.recipes.add(title));
    pantry.delete(key);
  }

  const items = [...amounts.entries()]
    .map(([key, e]) => {
      let plural = false;
      const parts = [...e.units.entries()].map(([base, total]) => {
        // …and back to kilos and litres once there's a lot of it
        let unit = base;
        if ((base === 'g' || base === 'ml') && total.low >= 1000) {
          unit = base === 'g' ? 'kg' : 'l';
          total = { low: total.low / 1000, high: total.high / 1000 };
        }
        const low = roundAmount(total.low, unit);
        const high = roundAmount(total.high, unit);
        if (!unit && high > 1) plural = true;
        const amount =
          low === high
            ? formatAmount(low, unit, locale)
            : `${formatAmount(low, unit, locale)}-${formatAmount(high, unit, locale)}`;
        return unit ? `${amount} ${UNIT_LABELS[unit][locale][high > 1 ? 1 : 0]}` : amount;
      });
      const name = e.forms[plural ? 1 : 0];
      return { key, name, label: `${parts.join(' + ')} ${name}`, recipes: [...e.recipes] };
    })
    // Sorted by ingredient name, so related things sit together
    .sort((a, b) => a.name.localeCompare(b.name, locale))
    .map(({ key, label, recipes }) => ({ key, label, recipes }));

  return {
    items,
    pantry: [...pantry.entries()]
      .map(([key, e]) => ({ key: `pantry|${key}`, label: e.label, recipes: [...e.recipes] }))
      .sort((a, b) => a.label.localeCompare(b.label, locale)),
  };
}
