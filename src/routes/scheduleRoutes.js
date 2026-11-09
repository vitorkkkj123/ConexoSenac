const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const validate = require('../middlewares/validate');
const { protect, optionalProtect, restrictTo } = require('../middlewares/authMiddleware');
const { createSlotSchema, bookSlotSchema } = require('../validations/scheduleValidation');

// Grade e Criação de Slots (Max / Consultores / Coordenação)
router.post('/slots', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), validate(createSlotSchema), scheduleController.createSlot);
router.post('/slots/bloco-4h', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), scheduleController.createBlock4Hours);
router.delete('/slots/:id', protect, restrictTo('admin', 'atendimento', 'coordenador'), scheduleController.deleteSlot);

// Agendamento Autônomo e Busca de Slots (Público / WhatsApp / Gestão)
router.get('/disponiveis', scheduleController.getAvailableSlots);
router.get('/todos', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), scheduleController.getAllSchedules);
router.get('/portal/:token', scheduleController.getByAccessToken);
router.post('/reservar', validate(bookSlotSchema), scheduleController.bookSlot);

// Gestão de Presença e Cancelamento / Faltas
router.post('/:id/cancelar', optionalProtect, scheduleController.cancelOrReschedule);
router.patch('/:id/presenca', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), scheduleController.markAttendance);
router.patch('/:id/confirmar-aluno', scheduleController.confirmByStudent);

module.exports = router;
