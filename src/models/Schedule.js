const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  empreendedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur',
    default: null,
    index: true
  },
  consultorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Consultor é obrigatório'],
    index: true
  },
  tipo: {
    type: String,
    enum: ['entrevista_1h', 'mentoria_2h'],
    default: 'entrevista_1h'
  },
  dataHoraInicio: {
    type: Date,
    required: [true, 'Data e hora de início são obrigatórias'],
    index: true
  },
  dataHoraFim: {
    type: Date,
    required: [true, 'Data e hora de término são obrigatórias']
  },
  status: {
    type: String,
    enum: [
      'disponivel',
      'agendado',
      'realizado',
      'falta',
      'cancelado_com_antecedencia',
      'cancelado_tardio_falta'
    ],
    default: 'disponivel',
    index: true
  },
  reagendadoDe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: null
  },
  observacoesAtendimento: {
    type: String,
    trim: true,
    default: ''
  },
  reservadoEm: {
    type: Date,
    default: null
  },
  confirmadoPeloAluno: {
    type: Boolean,
    default: false
  },
  confirmadoEm: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

scheduleSchema.index(
  { consultorId: 1, dataHoraInicio: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['disponivel', 'agendado', 'realizado'] }
    }
  }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
