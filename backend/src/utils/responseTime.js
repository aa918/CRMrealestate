/**
 * Speed-to-lead time math. We deliberately do NOT persist the computed
 * duration - it's always derived from receivedAt/firstResponseAt so it
 * can never drift out of sync with the source timestamps.
 */
function computeResponseTime(receivedAt, firstResponseAt) {
  if (!receivedAt || !firstResponseAt) return null;

  const receivedMs = new Date(receivedAt).getTime();
  const respondedMs = new Date(firstResponseAt).getTime();
  const diffMs = Math.max(0, respondedMs - receivedMs);

  const responseTimeSeconds = Math.round(diffMs / 1000);
  const responseTimeMinutes = Math.round((diffMs / 1000 / 60) * 100) / 100;

  return { responseTimeSeconds, responseTimeMinutes };
}

function isSlaBreached(receivedAt, slaMinutes, now = new Date()) {
  const deadline = new Date(receivedAt).getTime() + slaMinutes * 60 * 1000;
  return now.getTime() > deadline;
}

module.exports = { computeResponseTime, isSlaBreached };
