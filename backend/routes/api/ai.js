const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/ai.controller');

router.post('/analyze-bill', ctrl.analyzeBill);

module.exports = router;
