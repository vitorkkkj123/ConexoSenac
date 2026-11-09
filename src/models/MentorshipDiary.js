const mongoose = require('mongoose');

const encontroSchema = new mongoose.Schema({
  numeroEncontro: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  tituloPadrao: {
    type: String,
    default: ''
  },
  dataRealizacao: {
    type: Date,
    default: null
  },
  consultorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pendente', 'realizado', 'falta'],
    default: 'pendente'
  },
  diagnostico: {
    type: String,
    default: ''
  },
  planoAcaoMetas: {
    type: String,
    default: ''
  },
  observacoesGerais: {
    type: String,
    default: ''
  },
  checklistMetas: [{
    texto: { type: String, required: true },
    concluida: { type: Boolean, default: false }
  }],
  entregaveis: [{
    titulo: { type: String, required: true },
    urlArquivo: { type: String, required: true },
    dataEnvio: { type: Date, default: Date.now }
  }]
}, {
  _id: true,
  timestamps: true
});

const mentorshipDiarySchema = new mongoose.Schema({
  empreendedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur',
    required: true,
    unique: true,
    index: true
  },
  encontros: {
    type: [encontroSchema],
    default: () => [
      { numeroEncontro: 1, tituloPadrao: 'Diagnóstico e Modelo de Negócios' },
      { numeroEncontro: 2, tituloPadrao: 'Gestão Financeira e Precificação' },
      { numeroEncontro: 3, tituloPadrao: 'Marketing, Vendas e Atendimento' },
      { numeroEncontro: 4, tituloPadrao: 'Formalização e Gestão do MEI' },
      { numeroEncontro: 5, tituloPadrao: 'Plano de Ação e Encerramento' }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorshipDiary', mentorshipDiarySchema);
