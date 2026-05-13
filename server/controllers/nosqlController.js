const { getMongoDb } = require('../config/db');
const { logAttack } = require('../logs/attackLog');

async function vulnerableLogin(req, res) {
  const { username, password } = req.body;
  
  try {
    const db = getMongoDb();
    
    // Vulnerable logic: Native MongoDB driver allows object injection
    const user = await db.collection('users').findOne({ username, password });
    
    const queryObj = JSON.stringify({ username, password }, null, 2);
    
    // Check if bypassed (username was an object or password was an object)
    const bypassed = !!user && (typeof username === 'object' || typeof password === 'object');
    
    logAttack({
      ip: req.ip,
      endpoint: '/nosql/vulnerable/login',
      payload: { username, password },
      query: queryObj,
      result: bypassed ? 'BYPASS' : (user ? 'SUCCESS' : 'FAIL')
    });

    res.json({
      success: !!user,
      user: user,
      query: queryObj,
      bypassed: bypassed
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      query: JSON.stringify({ username, password }, null, 2)
    });
  }
}

async function secureLogin(req, res) {
  const { username, password } = req.body;
  
  try {
    // Secure logic: Type check BEFORE query
    if (typeof username !== 'string' || typeof password !== 'string') {
      const queryObj = JSON.stringify({ username, password }, null, 2);
      
      logAttack({
        ip: req.ip,
        endpoint: '/nosql/secure/login',
        payload: { username, password },
        query: queryObj,
        result: 'REJECTED - invalid type'
      });
      
      return res.status(400).json({
        success: false,
        error: "Invalid input type — object injection blocked",
        received: { usernameType: typeof username, passwordType: typeof password },
        query: "BLOCKED BEFORE EXECUTION"
      });
    }

    const db = getMongoDb();
    const user = await db.collection('users').findOne({ username, password });
    
    const queryObj = JSON.stringify({ username, password }, null, 2);
    
    logAttack({
      ip: req.ip,
      endpoint: '/nosql/secure/login',
      payload: { username, password },
      query: queryObj,
      result: user ? 'SUCCESS' : 'FAIL'
    });

    res.json({
      success: !!user,
      user: user,
      query: queryObj,
      bypassed: false
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      query: JSON.stringify({ username, password }, null, 2)
    });
  }
}

module.exports = {
  vulnerableLogin,
  secureLogin
};
