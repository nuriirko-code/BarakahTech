/**
 * Calculates how many lessons a student can access for free before payment is required.
 *
 * Rules:
 * - Trial is 20% of total lessons
 * - Minimum 1 lesson always free
 * - Maximum 3 lessons free (cap for very long courses)
 * - Free courses have no trial limit — all lessons always accessible
 *
 * Why 20%: it gives a meaningful preview without exposing the full course too early.
 * Why minimum 1: even a 1-lesson course still has a free preview path.
 * Why maximum 3: long courses remain protected from too much content being exposed for free.
 * Why free courses bypass the calculation: there is no payment gate when the course itself is free.
 */
const calculateTrialLessonCount = (totalLessons, isFree) => {
  if (isFree) return totalLessons
  if (totalLessons === 0) return 0

  const twentyPercent = Math.floor(totalLessons * 0.2)
  const withMinimum = Math.max(1, twentyPercent)
  const withMaximum = Math.min(3, withMinimum)

  return withMaximum
}

module.exports = { calculateTrialLessonCount }
