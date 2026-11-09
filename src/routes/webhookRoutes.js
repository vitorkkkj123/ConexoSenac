const express = require('express');
const router = express.Router();
const entrepreneurController = require('../controllers/entrepreneurController');

// Webhook para RD Station e Landing Pages
router.post('/rd-station', entrepreneurController.webhookRDStation);

module.exports = router;
