const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  acao: {
    type: String,
    required: true,
    trim: true
  },
  entidade: {
    type: String,
    enum: ['Empreendedor', 'Agendamento', 'Diario', 'Sistema'],
    default: 'Sistema'
  },
  entidadeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  usuarioNome: {
    type: String,
    default: 'Operador SENAC'
  },
  usuarioRole: {
    type: String,
    default: 'coordenador'
  },
  detalhes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
