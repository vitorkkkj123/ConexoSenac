const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const entrepreneurRoutes = require('./entrepreneurRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const diaryRoutes = require('./diaryRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const webhookRoutes = require('./webhookRoutes');

router.use('/auth', authRoutes);
router.use('/empreendedores', entrepreneurRoutes);
router.use('/agendamentos', scheduleRoutes);
router.use('/diarios', diaryRoutes);
router.use('/diario', diaryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/webhooks', webhookRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    projeto: 'Co.Nexo - SENAC MVP'
  });
});

router.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: `Endpoint da API não encontrado: ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;
