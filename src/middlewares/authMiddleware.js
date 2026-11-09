const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Para o MVP de desenvolvimento rápido: permitir usuário simulado de atendimento se em desenvolvimento e explicitado via header x-mock-role
      if (process.env.NODE_ENV === 'development' && req.headers['x-mock-role']) {
        req.user = {
          _id: '64b0f0000000000000000001',
          nome: 'Usuário Dev Co.Nexo',
          role: req.headers['x-mock-role'] || 'admin'
        };
        return next();
      }
      throw new UnauthorizedError('Acesso não autenticado. Forneça o token Bearer.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'conexo_senac_secret_key_change_in_production');
    const user = await User.findById(decoded.id).select('-senha');

    if (!user || !user.ativo) {
      throw new UnauthorizedError('Usuário associado a este token não existe mais ou está inativo.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token inválido ou expirado. Faça login novamente.'));
    }
    next(error);
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'conexo_senac_secret_key_change_in_production');
      const user = await User.findById(decoded.id).select('-senha');
      if (user && user.ativo) {
        req.user = user;
        return next();
      }
    }
    if (process.env.NODE_ENV === 'development' && req.headers['x-mock-role']) {
      req.user = {
        _id: '64b0f0000000000000000001',
        nome: 'Usuário Dev Co.Nexo',
        role: req.headers['x-mock-role']
      };
    }
    next();
  } catch (e) {
    next();
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Você não tem permissão para executar esta ação.'));
    }
    next();
  };
};

module.exports = {
  protect,
  optionalProtect,
  restrictTo
};
