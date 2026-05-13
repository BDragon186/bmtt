const { sqliteDb } = require('../config/db');
const { logAttack } = require('../logs/attackLog');

function vulnerableLogin(req, res) {
  const { username, password } = req.body;
  
  // Vulnerable logic: String concatenation
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  
  try {
    const user = sqliteDb.prepare(query).get();
    
    // Check if it's an injection (simple heuristic: password is not matched exactly but user is found)
    // Actually we just return success: true
    const bypassed = !!user && (user.username !== username || user.password !== password);
    
    logAttack({
      ip: req.ip,
      endpoint: '/sql/vulnerable/login',
      payload: { username, password },
      query: query,
      result: bypassed ? 'BYPASS' : (user ? 'SUCCESS' : 'FAIL')
    });

    res.json({
      success: !!user,
      user: user,
      query: query,
      bypassed: bypassed
    });
  } catch (err) {
    // Syntax error from SQL injection
    logAttack({
      ip: req.ip,
      endpoint: '/sql/vulnerable/login',
      payload: { username, password },
      query: query,
      result: 'ERROR (Syntax)'
    });
    
    res.json({
      success: false,
      error: err.message,
      query: query
    });
  }
}

function secureLogin(req, res) {
  const { username, password } = req.body;
  
  const queryStr = "SELECT * FROM users WHERE username=? AND password=?";
  const queryDisplay = "SELECT * FROM users WHERE username=? AND password=? [PARAMETERIZED]";
  
  try {
    const stmt = sqliteDb.prepare(queryStr);
    const user = stmt.get(username, password);
    
    logAttack({
      ip: req.ip,
      endpoint: '/sql/secure/login',
      payload: { username, password },
      query: queryDisplay,
      result: user ? 'SUCCESS' : 'FAIL'
    });

    res.json({
      success: !!user,
      user: user,
      query: queryDisplay,
      bypassed: false
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      query: queryDisplay
    });
  }
}

module.exports = {
  vulnerableLogin,
  secureLogin
};
