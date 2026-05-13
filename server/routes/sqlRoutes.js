const express = require('express');
const router = express.Router();
const sqlController = require('../controllers/sqlController');

router.post('/vulnerable/login', sqlController.vulnerableLogin);
router.post('/secure/login', sqlController.secureLogin);

module.exports = router;
