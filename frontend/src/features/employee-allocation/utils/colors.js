// Categorical color assignment for Program identity in the allocation split
// bars — the validated default palette from the dataviz skill (fixed hue
// order, never cycled arbitrarily). A 9th distinct program folds into a
// neutral "Other" gray rather than reusing a hue.
const LIGHT_SLOTS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const DARK_SLOTS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
const OTHER = '#898781';

/**
 * Stable hue per program id, assigned in first-appearance order within
 * `programmeIds` — so a program keeps the same color across renders as long
 * as the allocation list is built in a consistent order.
 */
export function buildProgrammeColorMap(programmeIds, mode) {
  const slots = mode === 'dark' ? DARK_SLOTS : LIGHT_SLOTS;
  const map = new Map();
  let next = 0;
  for (const id of programmeIds) {
    if (map.has(id)) continue;
    map.set(id, next < slots.length ? slots[next] : OTHER);
    next += 1;
  }
  return map;
}
