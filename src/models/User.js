const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    select: false
  },
  role: {
    type: String,
    enum: ['atendimento', 'consultor', 'coordenador', 'admin'],
    default: 'consultor'
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 12);
});

userSchema.methods.compararSenha = async function (candidataSenha) {
  return await bcrypt.compare(candidataSenha, this.senha);
};

module.exports = mongoose.model('User', userSchema);
