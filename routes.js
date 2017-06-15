const express = require('express');
const calc = require('./calc');
const stocker = require('./stocker');

const router = express.Router();

router.get('/calc', calc);
router.get('/stocker', stocker);

module.exports = router;
