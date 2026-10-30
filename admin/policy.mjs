// Administrator approvals are explicit, time-limited and never inferred from a domain.
export function parseAllowlist(value, now = Date.now()) {
  if (!Array.isArray(value)) throw Error('The Faculty allowlist must be an array of approvals.');
  const approvals = new Map();
  for (const entry of value) {
    if (!entry || typeof entry.email !== 'string' || typeof entry.approvedUntil !== 'string') throw Error('Each approval needs email and approvedUntil.');
    const email = entry.email.trim().toLowerCase();
    const until = Date.parse(entry.approvedUntil);
    if (!/^[a-z0-9.!#$%&'+/=?^_`{|}~-]+@markdayschool\.org$/.test(email) || email.includes('*')) throw Error('Approvals must name individual Mark Day School accounts.');
    if (!Number.isFinite(until) || !entry.approvedUntil.endsWith('Z')) throw Error('approvedUntil must be an ISO UTC timestamp ending in Z.');
    if (until > now + 30 * 86400000) throw Error('Faculty approvals must be reviewed within 30 days.');
    if (approvals.has(email)) throw Error('Duplicate Faculty approval.');
    approvals.set(email, until);
  }
  return approvals;
}
export function eligibleFaculty(identity, approvals, now = Date.now()) {
  return !!identity && !identity.disabled && identity.emailVerified === true
    && typeof identity.email === 'string'
    && identity.email.endsWith('@markdayschool.org')
    && identity.providerData?.some(p => p.providerId === 'google.com') === true
    && (approvals.get(identity.email.toLowerCase()) || 0) > now;
}
