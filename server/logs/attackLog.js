const logs = []; // in-memory

function logAttack({ ip, endpoint, payload, query, result, timestamp = new Date().toISOString() }) {
  logs.push({ ip, endpoint, payload, query, result, timestamp });
}

function getLogs() {
  return [...logs].reverse(); // newest first
}

module.exports = { logAttack, getLogs };
