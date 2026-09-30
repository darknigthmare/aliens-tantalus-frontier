// Presentation-only flight: positive-time integration and bounded, continuous
// translation. No scale/flip pretends to reveal another side of a native hull.
export function createTitleFlightClockV88() {
  return { elapsed: 0, lastTimestamp: null, speed: null };
}
export function sampleTitleFlightV88(elapsed = 0) {
  const time = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  return Object.freeze({
    x: 2.2 * Math.sin(time * Math.PI / 34) + .6 * Math.sin(time * Math.PI / 71),
    y: 1.1 * Math.sin(time * Math.PI / 43)
  });
}
export function advanceTitleFlightV88(clock, timestamp, mode = 'full') {
  if (!Number.isFinite(timestamp)) return sampleTitleFlightV88(clock.elapsed);
  const delta = clock.lastTimestamp === null ? 0 : Math.max(0, Math.min(.05, (timestamp - clock.lastTimestamp) / 1000));
  clock.lastTimestamp = timestamp;
  const target = mode === 'static' ? 0 : mode === 'reduced' ? .25 : 1;
  if (target === 0) return sampleTitleFlightV88(clock.elapsed);
  if (clock.speed === null) clock.speed = target;
  // Exact integral of exponential easing: changing quality does not jump either
  // position or velocity, and 30/60/144 Hz follow the same flight path.
  const decay = Math.exp(-delta / 1.2);
  clock.elapsed += target * delta + (clock.speed - target) * 1.2 * (1 - decay);
  clock.speed = target + (clock.speed - target) * decay;
  return sampleTitleFlightV88(clock.elapsed);
}
export function pauseTitleFlightV88(clock) { clock.lastTimestamp = null; }
