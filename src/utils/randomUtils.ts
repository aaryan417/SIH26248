/**
 * Deterministic pseudo-random number generator for predictable testing
 * and seedable simulation runs.
 */
let currentSeed = 123456789;

export function setSeed(seed: number): void {
  currentSeed = seed;
}

export function seededRandom(): number {
  // Simple Mulberry32 generator
  let t = (currentSeed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function getRandom(useSeed = false): number {
  return useSeed ? seededRandom() : Math.random();
}

export function getRandomInt(min: number, max: number, useSeed = false): number {
  const r = getRandom(useSeed);
  return Math.floor(r * (max - min + 1)) + min;
}

export function getRandomBoolean(probability = 0.5, useSeed = false): boolean {
  return getRandom(useSeed) < probability;
}
