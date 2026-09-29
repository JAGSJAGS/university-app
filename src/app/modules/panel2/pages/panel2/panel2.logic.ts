import { Subject, Year } from '../../../../interfaces/Career';

/**
 * Lógica pura del panel (sin Angular ni DOM).
 * El componente solo llama a estas funciones y pinta el resultado; así se puede
 * probar por separado y el template no recalcula nada en cada ciclo de detección.
 */

/** A partir de este total de créditos por año se avisa en rojo. */
export const CREDITS_WARN = 60;
/** Máximo de créditos por año permitido. */
export const CREDITS_MAX = 72;
export const QUARTS: readonly number[] = [1, 2, 3, 4];

/** Colores de las cadenas de dependencia; el primero es el de las materias reprobadas. */
export const INTRUSO_COLORS = ['#8d0044', '#8b522f', '#b99e33', '#cb459e', '#ff2626', '#f16e1c'];

export type Tone = 'default' | 'critic' | 'validated' | 'failed' | 'chain';

/** Una materia dibujada en el panel. */
export interface SubjectCard {
  /** Clave única y estable, para `track` (una materia reprobada repite el id). */
  key: string;
  subject: Subject;
  year: Year;
  /** Posición en la rejilla de 4 cuatrimestres, p. ej. "2 / span 3". */
  gridColumn: string;
  from: number;
  span: number;
  tone: Tone;
  /** Solo para el tono "chain": color de fondo y de texto legible. */
  bg: string | null;
  fg: string | null;
  /** Tiene un prerrequisito colocado en el mismo año o en uno posterior. */
  conflict: boolean;
  /** Es la materia que se reprobó (`fail = true`). */
  failed: boolean;
  /** Es la repetición de una materia reprobada antes. */
  retake: boolean;
  /** Se puede mover con las flechas o arrastrando (ni crítica ni reprobada). */
  movable: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  link: string | null;
  groupIds: number[];
  groupNames: string;
  title: string;
}

/** Una columna (año) del panel con sus totales ya calculados. */
export interface YearColumn {
  year: Year;
  cards: SubjectCard[];
  /** Carga por cuatrimestre (4 valores redondeados). */
  quarts: number[];
  credits: number;
  overWarn: boolean;
  overMax: boolean;
  /** Solo el último año se puede eliminar. */
  removable: boolean;
}

// ---------------------------------------------------------------------------
// Conflictos de prerrequisitos
// ---------------------------------------------------------------------------

interface Placement {
  subject: Subject;
  year: number;
}

function placementsById(years: Year[]): Map<number, Placement[]> {
  const map = new Map<number, Placement[]>();
  for (const y of years) {
    for (const s of y.subjects) {
      const list = map.get(s.id);
      if (list) {
        list.push({ subject: s, year: y.year });
      } else {
        map.set(s.id, [{ subject: s, year: y.year }]);
      }
    }
  }
  return map;
}

/**
 * Materias con conflicto: una materia y su prerrequisito están en el mismo año o el
 * prerrequisito va después. Se marcan las dos partes. Las materias validadas no cuentan.
 * Una sola pasada (antes eran dos bucles simétricos por cada materia dibujada).
 */
export function findConflicts(years: Year[]): Set<Subject> {
  const placements = placementsById(years);
  const conflicts = new Set<Subject>();
  for (const y of years) {
    for (const s of y.subjects) {
      if (s.validate) {
        continue;
      }
      for (const reqId of s.requirements) {
        for (const p of placements.get(reqId) ?? []) {
          if (!p.subject.validate && p.year >= y.year) {
            conflicts.add(s);
            conflicts.add(p.subject);
          }
        }
      }
    }
  }
  return conflicts;
}

// ---------------------------------------------------------------------------
// Totales por año
// ---------------------------------------------------------------------------

/** Créditos del año (las materias validadas no suman). */
export function totalCredits(subjects: Subject[]): number {
  let total = 0;
  for (const s of subjects) {
    if (!s.validate) {
      total += Number(s.credit) || 0;
    }
  }
  return total;
}

/** Carga por cuatrimestre: los créditos de cada materia se reparten entre los que ocupa. */
export function quartLoad(subjects: Subject[]): number[] {
  const load = [0, 0, 0, 0];
  for (const s of subjects) {
    if (s.validate) {
      continue;
    }
    const from = s.quarts[0];
    const to = s.quarts[1];
    const share = (Number(s.credit) || 0) / (to - from + 1);
    for (let q = from; q <= to; q++) {
      if (q >= 1 && q <= 4) {
        load[q - 1] += share;
      }
    }
  }
  return load.map(v => Math.round(v));
}

// ---------------------------------------------------------------------------
// Cadenas de dependencia ("intrusos")
// ---------------------------------------------------------------------------

/** id de un prerrequisito -> ids de las materias que lo requieren. */
export function dependentsMap(years: Year[]): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  for (const y of years) {
    for (const s of y.subjects) {
      for (const req of s.requirements) {
        const set = map.get(req);
        if (set) {
          set.add(s.id);
        } else {
          map.set(req, new Set([s.id]));
        }
      }
    }
  }
  return map;
}

/** Todas las materias que dependen, directa o indirectamente, de `startId` (sin incluirla). */
export function forwardChain(startId: number, dependents: Map<number, Set<number>>): Set<number> {
  const visited = new Set<number>([startId]);
  const stack = [startId];
  while (stack.length) {
    const current = stack.pop() as number;
    for (const dep of dependents.get(current) ?? []) {
      if (!visited.has(dep)) {
        visited.add(dep);
        stack.push(dep);
      }
    }
  }
  visited.delete(startId);
  return visited;
}

/** Ids (sin repetir, en orden de aparición) de materias que comparten año con otra que las requiere. */
export function findIntrusos(years: Year[]): number[] {
  const result: number[] = [];
  for (const y of years) {
    const required = new Set<number>();
    for (const s of y.subjects) {
      for (const req of s.requirements) {
        required.add(req);
      }
    }
    for (const s of y.subjects) {
      if (required.has(s.id) && !result.includes(s.id)) {
        result.push(s.id);
      }
    }
  }
  return result;
}

/** id de materia -> color de fondo: el intruso con su color y su cadena con el color aclarado. */
export function chainColors(years: Year[]): Map<number, string> {
  const dependents = dependentsMap(years);
  const intrusos = findIntrusos(years);
  const colors = new Map<number, string>();
  intrusos.forEach((id, i) => colors.set(id, INTRUSO_COLORS[i % INTRUSO_COLORS.length]));
  intrusos.forEach((id, i) => {
    const light = lighten(INTRUSO_COLORS[i % INTRUSO_COLORS.length], 0.5);
    for (const dep of forwardChain(id, dependents)) {
      if (!colors.has(dep)) {
        colors.set(dep, light);
      }
    }
  });
  return colors;
}

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Aclara un color hex (`#rrggbb`) mezclándolo con blanco. */
export function lighten(hex: string, percent: number): string {
  return '#' + toRgb(hex)
    .map(v => Math.min(255, Math.floor(v + (255 - v) * percent)).toString(16).padStart(2, '0'))
    .join('');
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Blanco u oscuro, el que dé más contraste sobre el fondo indicado. */
export function readableText(background: string): string {
  const lum = luminance(background);
  const withWhite = 1.05 / (lum + 0.05);
  const withDark = (lum + 0.05) / (luminance('#1b1b1b') + 0.05);
  return withWhite >= withDark ? '#ffffff' : '#1b1b1b';
}

// ---------------------------------------------------------------------------
// Enlaces
// ---------------------------------------------------------------------------

/** Solo http/https. Si falta el protocolo (p. ej. "www.x.com") se añade https://. */
export function normalizeLink(link: string | null | undefined): string | null {
  const value = (link ?? '').trim();
  if (!value) {
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^https?:/i.test(value) ? value : null;
  }
  return 'https://' + value;
}

// ---------------------------------------------------------------------------
// Cambios de estado (un solo sitio para mover materias)
// ---------------------------------------------------------------------------

export function neighbourYear(years: Year[], year: Year, dir: 1 | -1): Year | undefined {
  const i = years.indexOf(year);
  return i === -1 ? undefined : years[i + dir];
}

/** Saca la materia de un año y la inserta en otro, en el mismo índice (o al final). */
export function moveSubject(subject: Subject, from: Year, to: Year | undefined): boolean {
  if (!to) {
    return false;
  }
  const i = from.subjects.indexOf(subject);
  if (i === -1) {
    return false;
  }
  from.subjects.splice(i, 1);
  to.subjects.splice(Math.min(i, to.subjects.length), 0, subject);
  return true;
}

/**
 * Drag and drop: saca la materia de `from` y la inserta en `to` en la posición `index`
 * (índice de la lista de destino tal como se veía antes de soltar). Sirve para cambiar de año
 * y también para reordenar dentro del mismo. Devuelve false si no cambia nada.
 */
export function dropSubject(subject: Subject, from: Year, to: Year, index: number): boolean {
  const i = from.subjects.indexOf(subject);
  if (i === -1) {
    return false;
  }
  let target = clamp(index, 0, to.subjects.length);
  if (from === to) {
    // Al sacarla de la lista, los índices posteriores bajan una posición
    if (target > i) {
      target--;
    }
    if (target === i) {
      return false;
    }
  }
  from.subjects.splice(i, 1);
  to.subjects.splice(target, 0, subject);
  return true;
}

/** Alterna "crítica": al activarla pasa al año siguiente y al quitarla vuelve al anterior. */
export function toggleCritic(years: Year[], from: Year, subject: Subject): void {
  subject.critic = !subject.critic;
  moveSubject(subject, from, neighbourYear(years, from, subject.critic ? 1 : -1));
}

/**
 * Reprueba la materia: queda marcada y aparece una copia (con el mismo id) en el año siguiente.
 * Devuelve la copia, o null si no se pudo (no hay año siguiente o ya estaba reprobada).
 */
export function failSubject(years: Year[], from: Year, subject: Subject): Subject | null {
  const next = neighbourYear(years, from, 1);
  const i = from.subjects.indexOf(subject);
  if (!next || i === -1 || subject.fail) {
    return null;
  }
  const retake: Subject = { ...subject, fail: false };
  next.subjects.splice(Math.min(i, next.subjects.length), 0, retake);
  subject.fail = true;
  return retake;
}

/** Deshace el "reprobada": borra las copias de años posteriores y desmarca la original. */
export function clearFailure(years: Year[], from: Year, subject: Subject): void {
  for (const y of years) {
    if (y.year > from.year) {
      y.subjects = y.subjects.filter(s => s.id !== subject.id);
    }
  }
  subject.fail = false;
}

/** Datos del año siguiente al último (el primero si no hay ninguno). */
export function nextYearNumber(years: Year[]): number {
  return (years.length ? years[years.length - 1].year : 0) + 1;
}

// ---------------------------------------------------------------------------
// Modelo de vista
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Calcula, de una sola vez, todo lo que el template necesita para pintar el panel. */
export function buildColumns(years: Year[]): YearColumn[] {
  const conflicts = findConflicts(years);
  const chain = chainColors(years);
  const failedIds = new Set<number>();
  for (const y of years) {
    for (const s of y.subjects) {
      if (s.fail) {
        failedIds.add(s.id);
      }
    }
  }
  const usedKeys = new Set<string>();

  return years.map((year, index) => {
    const hasPrev = index > 0;
    const hasNext = index < years.length - 1;

    const cards = year.subjects.map((subject): SubjectCard => {
      const from = clamp(Number(subject.quarts[0]) || 1, 1, 4);
      const to = clamp(Number(subject.quarts[1]) || from, from, 4);
      const span = to - from + 1;

      let key = `${year.year}:${subject.id}:${subject.fail ? 'f' : 'a'}`;
      for (let n = 2; usedKeys.has(key); n++) {
        key = `${year.year}:${subject.id}:${subject.fail ? 'f' : 'a'}#${n}`;
      }
      usedKeys.add(key);

      // Prioridad de menor a mayor: base < crítica < cadena < validada < reprobada
      let tone: Tone = 'default';
      let bg: string | null = null;
      let fg: string | null = null;
      if (subject.critic) {
        tone = 'critic';
      }
      const chainColor = chain.get(subject.id);
      if (chainColor) {
        tone = 'chain';
        bg = chainColor;
        fg = readableText(chainColor);
      }
      if (subject.validate) {
        tone = 'validated';
        bg = fg = null;
      }
      if (failedIds.has(subject.id)) {
        tone = 'failed';
        bg = fg = null;
      }

      const groups = subject.group ?? [];
      return {
        key,
        subject,
        year,
        gridColumn: `${from} / span ${span}`,
        from,
        span,
        tone,
        bg,
        fg,
        conflict: conflicts.has(subject),
        failed: !!subject.fail,
        retake: !subject.fail && failedIds.has(subject.id),
        movable: !subject.critic && !subject.fail,
        hasPrev,
        hasNext,
        link: normalizeLink(subject.link),
        groupIds: groups.map(g => g.id),
        groupNames: groups.map(g => g.name).join(', '),
        title: subject.code ? `${subject.name} (${subject.code})` : subject.name
      };
    });

    const credits = totalCredits(year.subjects);
    return {
      year,
      cards,
      quarts: quartLoad(year.subjects),
      credits,
      overWarn: credits > CREDITS_WARN,
      overMax: credits > CREDITS_MAX,
      removable: index === years.length - 1
    };
  });
}
