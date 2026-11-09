const mongoose = require('mongoose');
const crypto = require('crypto');

const entrepreneurSchema = new mongoose.Schema({
  nomeCompleto: {
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true,
    index: true
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    index: true
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  negocio: {
    nomeFantasia: {
      type: String,
      trim: true,
      default: ''
    },
    ramoAtividade: {
      type: String,
      trim: true,
      default: ''
    },
    situacaoAtual: {
      type: String,
      enum: ['informal', 'mei_aberto', 'mei_inadimplente'],
      default: 'informal'
    },
    cnpj: {
      type: String,
      trim: true,
      default: null
    }
  },
  aceiteLGPD: {
    type: Boolean,
    required: [true, 'Aceite da LGPD é obrigatório'],
    default: true
  },
  origemLead: {
    type: String,
    enum: ['Formulario_SENAC', 'LandingPage_SENAC', 'Balcao', 'Indicacao', 'Outros', 'RD_Station'],
    default: 'Formulario_SENAC'
  },
  statusPrograma: {
    type: String,
    enum: ['inscrito', 'em_diagnostico', 'em_mentoria', 'concluido', 'evadido', 'bloqueado'],
    default: 'inscrito',
    index: true
  },
  bloqueadoPorAssiduidade: {
    type: Boolean,
    default: false,
    index: true
  },
  totalFaltas: {
    type: Number,
    default: 0
  },
  totalReagendamentos: {
    type: Number,
    default: 0
  },
  maturidadeInicial: {
    financas: { type: Number, min: 1, max: 5, default: 2 },
    vendas: { type: Number, min: 1, max: 5, default: 2 },
    operacoes: { type: Number, min: 1, max: 5, default: 2 },
    formalizacao: { type: Number, min: 1, max: 5, default: 2 }
  },
  maturidade: {
    financas: { type: Number, min: 1, max: 5, default: 3 },
    vendas: { type: Number, min: 1, max: 5, default: 3 },
    operacoes: { type: Number, min: 1, max: 5, default: 3 },
    formalizacao: { type: Number, min: 1, max: 5, default: 3 }
  },
  accessToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

entrepreneurSchema.index(
  { 'negocio.cnpj': 1 },
  {
    unique: true,
    partialFilterExpression: { 'negocio.cnpj': { $type: 'string' } }
  }
);

entrepreneurSchema.pre('save', function () {
  if (!this.accessToken) {
    this.accessToken = crypto.randomBytes(16).toString('hex');
  }
  if (this.negocio && typeof this.negocio.cnpj === 'string') {
    const limpo = this.negocio.cnpj.replace(/\D/g, '');
    this.negocio.cnpj = limpo.length > 0 ? limpo : null;
  }
});

module.exports = mongoose.model('Entrepreneur', entrepreneurSchema);
