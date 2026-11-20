export function calculateSkillMatch(candidateSkills = [], requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return { score: 100, matched: [], missing: [] };
  const lowerCandSkills = new Set(candidateSkills.map(s => s.toLowerCase().trim()));
  
  const matched = [];
  const missing = [];

  for (const req of requiredSkills) {
    if (lowerCandSkills.has(req.toLowerCase().trim())) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
}
