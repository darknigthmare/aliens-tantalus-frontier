// Frozen scope of the user's next50 request. Later acceptance must not shift it.
export function selectNext50V73(jobs) {
  const selected = jobs.filter((job) => {
    const number = Number(/^enemy-(\d{3})-/.exec(job.profileId)?.[1]);
    return number >= 7 && number <= 57 && number !== 20;
  }).sort((a, b) => a.profileId.localeCompare(b.profileId));
  if (selected.length !== 50 || new Set(selected.map((job) => job.profileId)).size !== 50) {
    throw new Error('Le périmètre V73 doit contenir exactement50 profils distincts.');
  }
  return selected;
}
