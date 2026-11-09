const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errosFormatados = error.issues.map(issue => ({
        campo: issue.path.join('.'),
        mensagem: issue.message
      }));
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos fornecidos',
        detalhes: errosFormatados
      });
    }
    next(error);
  }
};

module.exports = validate;
