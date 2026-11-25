/** Bounded terminal pages. This is presentation only: IDs, ordering and earned
 * progression remain owned by the authored activity registries. */
export const XENO_TRIALS_PROGRAM_PAGE_SIZE_V186 = 12;
export function getXenoTrialsProgramPageV186(entries, { page = 0, kind = 'all' } = {}) {
  const filtered = entries.filter(entry => kind === 'boss' ? Boolean(entry.bossFinaleV186)
    : kind === 'standard' ? !entry.bossFinaleV186 : true);
  const pageCount = Math.max(1, Math.ceil(filtered.length / XENO_TRIALS_PROGRAM_PAGE_SIZE_V186));
  const current = Number.isInteger(page) ? Math.max(0, Math.min(pageCount - 1, page)) : 0;
  const offset = current * XENO_TRIALS_PROGRAM_PAGE_SIZE_V186;
  return Object.freeze({ entries: Object.freeze(filtered.slice(offset, offset + XENO_TRIALS_PROGRAM_PAGE_SIZE_V186)),
    page: current, pageCount, total: filtered.length, start: filtered.length ? offset + 1 : 0,
    end: Math.min(filtered.length, offset + XENO_TRIALS_PROGRAM_PAGE_SIZE_V186),
    hasPrevious: current > 0, hasNext: current + 1 < pageCount });
}
