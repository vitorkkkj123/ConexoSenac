const express = require('express');
const router = express.Router();
const entrepreneurController = require('../controllers/entrepreneurController');
const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { createEntrepreneurSchema, updateFormalizacaoSchema } = require('../validations/entrepreneurValidation');

// Portal Externo do Empreendedor (Via Token Único)
router.get('/portal/:token', entrepreneurController.getByAccessToken);

// Rotas Internas Protegidas por RBAC (Max / Aline / Regis)
router.post('/importar-csv', protect, restrictTo('admin', 'atendimento', 'coordenador'), entrepreneurController.importBatchCSV);
router.post('/', protect, restrictTo('admin', 'atendimento', 'coordenador'), validate(createEntrepreneurSchema), entrepreneurController.create);
router.get('/', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), entrepreneurController.list);
router.get('/:id', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), entrepreneurController.getById);
router.put('/:id', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), entrepreneurController.update);
router.patch('/:id', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), entrepreneurController.update);
router.patch('/:id/etapa', protect, restrictTo('admin', 'atendimento', 'consultor', 'coordenador'), entrepreneurController.update);
router.patch('/:id/formalizacao', protect, restrictTo('admin', 'consultor', 'coordenador', 'atendimento'), validate(updateFormalizacaoSchema), entrepreneurController.updateFormalizacao);

module.exports = router;
