const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Rotas Públicas Restritas por Token Único do Empreendedor (Oculta observacoesGerais e trava edição de diagnóstico/status)
router.get('/portal/:token', diaryController.getByAccessToken);
router.patch('/portal/:token/encontro/:numeroEncontro/checklist', diaryController.updateChecklistByAccessToken);

// Rotas Internas da Equipe SENAC (Exigem Autenticação e Perfil Autorizado)
router.get('/:empreendedorId', protect, restrictTo('admin', 'consultor', 'coordenador', 'atendimento'), diaryController.getByEntrepreneurId);
router.put('/:empreendedorId/encontro/:numeroEncontro', protect, restrictTo('admin', 'consultor', 'coordenador', 'atendimento'), diaryController.updateMeeting);
router.post('/:empreendedorId/encontro/:numeroEncontro/entregaveis', protect, restrictTo('admin', 'consultor', 'coordenador'), diaryController.addDeliverable);

module.exports = router;
