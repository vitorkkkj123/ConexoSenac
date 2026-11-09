const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error] ${req.method} ${req.url} ->`, err);

  // Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    error = new AppError(`Já existe um registro com este ${campo}: '${valor}'.`, 409);
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`ID inválido: ${err.value}`, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map(val => val.message);
    error = new AppError(`Dados inválidos: ${mensagens.join(', ')}`, 400);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    sucesso: false,
    status,
    erro: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
