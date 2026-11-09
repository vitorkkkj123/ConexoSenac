const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.get('/cockpit', protect, restrictTo('admin', 'coordenador', 'atendimento', 'consultor'), dashboardController.getCockpitToday);
router.get('/kpis', protect, restrictTo('admin', 'coordenador'), dashboardController.getStrategicKPIs);
router.get('/auditoria', protect, restrictTo('admin', 'coordenador'), dashboardController.getAuditLogs);

module.exports = router;
