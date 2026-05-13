const state = {
  dbMode: 'sql', // 'sql' or 'nosql'
  vulnMode: 'vulnerable' // 'vulnerable' or 'secure'
};

// UI Elements
const btnSql = document.getElementById('btn-sql');
const btnNoSql = document.getElementById('btn-nosql');
const btnVulnerable = document.getElementById('btn-vulnerable');
const btnSecure = document.getElementById('btn-secure');

const dbSqlInfo = document.getElementById('db-sql-info');
const dbNoSqlInfo = document.getElementById('db-nosql-info');

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const resultBanner = document.getElementById('login-result');

const queryOutput = document.getElementById('query-output');
const injectionAlert = document.getElementById('injection-alert');
const rawHttpOutput = document.getElementById('raw-http-output');

const logsBody = document.getElementById('logs-body');
const titleGlitch = document.querySelector('.glitch');

// Event Listeners
btnSql.addEventListener('click', () => setDbMode('sql'));
btnNoSql.addEventListener('click', () => setDbMode('nosql'));
btnVulnerable.addEventListener('click', () => setVulnMode('vulnerable'));
btnSecure.addEventListener('click', () => setVulnMode('secure'));

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await doLogin();
});

function setDbMode(mode) {
  state.dbMode = mode;
  if (mode === 'sql') {
    btnSql.classList.add('active');
    btnNoSql.classList.remove('active');
    dbSqlInfo.classList.remove('hidden');
    dbNoSqlInfo.classList.add('hidden');
  } else {
    btnNoSql.classList.add('active');
    btnSql.classList.remove('active');
    dbNoSqlInfo.classList.remove('hidden');
    dbSqlInfo.classList.add('hidden');
  }
}

function setVulnMode(mode) {
  state.vulnMode = mode;
  if (mode === 'vulnerable') {
    btnVulnerable.classList.add('active');
    btnSecure.classList.remove('active');
  } else {
    btnSecure.classList.add('active');
    btnVulnerable.classList.remove('active');
  }
}

function buildRawRequest(endpoint, body) {
  const bodyStr = JSON.stringify(body, null, 2);
  return `POST ${endpoint} HTTP/1.1\nHost: localhost:3000\nContent-Type: application/json\nContent-Length: ${bodyStr.length}\n\n${bodyStr}`;
}

async function doLogin() {
  const endpoint = `/${state.dbMode}/${state.vulnMode}/login`;
  
  // Basic parsing for NoSQL payload (allows entering JSON like {"$ne": null} in the input field)
  let userPayload = usernameInput.value;
  let passPayload = passwordInput.value;
  
  if (state.dbMode === 'nosql') {
    try {
      // If it looks like JSON object, parse it so we can send as actual object
      if (userPayload.trim().startsWith('{')) userPayload = JSON.parse(userPayload);
      if (passPayload.trim().startsWith('{')) passPayload = JSON.parse(passPayload);
    } catch (e) {
      // ignore, send as string
    }
  }

  const payload = {
    username: userPayload,
    password: passPayload
  };

  // Show Raw HTTP Request
  const rawReq = buildRawRequest(endpoint, payload);
  rawHttpOutput.textContent = rawReq;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    // Display Query Console
    // Using textContent to prevent XSS rendering
    queryOutput.textContent = data.query || JSON.stringify(data, null, 2);
    
    // Display Result
    showResult(data);
    
    // Refresh Logs
    await refreshLogs();
    
  } catch (error) {
    console.error(error);
    resultBanner.textContent = 'CONNECTION ERROR';
    resultBanner.className = 'result-banner error';
  }
}

function showResult(data) {
  if (data.bypassed) {
    resultBanner.textContent = 'ACCESS GRANTED (BYPASSED)';
    resultBanner.className = 'result-banner success';
    injectionAlert.classList.remove('hidden');
    titleGlitch.classList.add('glitch-active');
  } else if (data.success) {
    resultBanner.textContent = `ACCESS GRANTED - Welcome ${data.user.username}`;
    resultBanner.className = 'result-banner success';
    injectionAlert.classList.add('hidden');
    titleGlitch.classList.remove('glitch-active');
  } else {
    resultBanner.textContent = data.error || 'ACCESS DENIED';
    resultBanner.className = 'result-banner error';
    injectionAlert.classList.add('hidden');
    titleGlitch.classList.remove('glitch-active');
  }
}

async function refreshLogs() {
  try {
    const res = await fetch('/logs');
    const logs = await res.json();
    
    logsBody.innerHTML = '';
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      let resultClass = '';
      if (log.result === 'BYPASS') resultClass = 'result-bypass';
      else if (log.result === 'SUCCESS') resultClass = 'result-success';
      else resultClass = 'result-fail';

      tr.innerHTML = `
        <td>${timeStr}</td>
        <td>${log.ip || '127.0.0.1'}</td>
        <td>${log.endpoint}</td>
        <td><code>${typeof log.payload === 'object' ? JSON.stringify(log.payload) : log.payload}</code></td>
        <td class="${resultClass}">${log.result}</td>
      `;
      
      logsBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error fetching logs', error);
  }
}

// Initial fetch
refreshLogs();
