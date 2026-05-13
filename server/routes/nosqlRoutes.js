const express = require('express');
const router = express.Router();
const nosqlController = require('../controllers/nosqlController');

router.post('/vulnerable/login', nosqlController.vulnerableLogin);
router.post('/secure/login', nosqlController.secureLogin);

module.exports = router;
