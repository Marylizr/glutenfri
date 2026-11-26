// Conservative triage, not a claim of automated safety. Flagged content is
// held for the existing human moderation workflow; photos always need review.
function screenReview({ comment = '', photos = [] } = {}) {
  const text = String(comment).normalize('NFKC').toLowerCase();
  const flags = [];
  // Free text may evade a word list. Every non-empty comment needs human
  // approval during the pilot; structured answers can still be submitted.
  if (text.trim()) flags.push('text_review');
  if (photos?.length) flags.push('media_review');
  if (/\b(?:fuck|fucking|puta|puto|mierda|merda|caralho|porra|cabr[oó]n)\b/iu.test(text)) flags.push('offensive_language');
  if (/(?:https?:\/\/|www\.)/iu.test(text)) flags.push('external_link');
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu.test(text) || /(?:\+?\d[\s().-]*){9,}/u.test(text)) flags.push('possible_personal_data');
  return flags;
}
module.exports = { screenReview };
