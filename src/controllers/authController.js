const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, BusinessError } = require('../utils/errors');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        throw new BusinessError('Por favor, informe e-mail e senha.');
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+senha');
      if (!user || !(await user.compararSenha(senha))) {
        throw new UnauthorizedError('E-mail ou senha incorretos.');
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, nome: user.nome },
        process.env.JWT_SECRET || 'conexo_senac_secret_key_change_in_production',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        sucesso: true,
        token,
        usuario: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async seedDefaultUsers(req, res, next) {
    try {
      const usuariosIniciais = [
        {
          nome: 'Max (Atendimento)',
          email: 'max.atendimento@senac.br',
          senha: 'senha123456',
          role: 'atendimento'
        },
        {
          nome: 'Aline (Consultoria)',
          email: 'aline.consultoria@senac.br',
          senha: 'senha123456',
          role: 'consultor'
        },
        {
          nome: 'Regis (Coordenação)',
          email: 'regis.coordenacao@senac.br',
          senha: 'senha123456',
          role: 'coordenador'
        }
      ];

      for (const u of usuariosIniciais) {
        const existentes = await User.find({ email: u.email }).sort({ createdAt: -1 });
        if (existentes.length === 0) {
          await User.create(u);
        } else if (existentes.length > 1) {
          // Mantém apenas o mais recente e remove duplicados antigos
          for (let i = 1; i < existentes.length; i++) {
            await User.deleteOne({ _id: existentes[i]._id }).catch(() => {});
          }
        }
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Usuários padrão do SENAC garantidos com sucesso!',
        usuarios: usuariosIniciais.map(u => ({ nome: u.nome, email: u.email, role: u.role }))
      });
    } catch (error) {
      next(error);
    }
  }

  async listConsultores(req, res, next) {
    try {
      // Remove duplicidades antigas no banco caso existam (mantém 1 por nome/e-mail)
      const todos = await User.find({ role: 'consultor', ativo: true }).sort({ createdAt: -1 });
      const vistos = new Set();
      const unicos = [];
      for (const c of todos) {
        const chave = (c.nome || c.email).toLowerCase().trim();
        if (!vistos.has(chave)) {
          vistos.add(chave);
          unicos.push({ _id: c._id, nome: c.nome, email: c.email, role: c.role });
        } else {
          await User.deleteOne({ _id: c._id }).catch(() => {});
        }
      }

      return res.status(200).json({
        sucesso: true,
        dados: unicos
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, novaSenha } = req.body;
      if (!email || !novaSenha || novaSenha.length < 6) {
        throw new BusinessError('Informe seu e-mail e uma nova senha com no mínimo 6 caracteres.');
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        throw new BusinessError('E-mail não localizado no sistema.');
      }

      user.senha = novaSenha;
      await user.save();

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso! Você já pode entrar.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
