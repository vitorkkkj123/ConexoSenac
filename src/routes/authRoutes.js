const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/esqueci-senha', authController.resetPassword);
router.post('/seed', authController.seedDefaultUsers);
router.get('/consultores', authController.listConsultores);

module.exports = router;
