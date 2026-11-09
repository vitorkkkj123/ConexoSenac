const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();

// Segurança de Headers HTTP
app.use(helmet({
  contentSecurityPolicy: false // Permite carregar Bootstrap e ícones de CDNs
}));

// Habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

// Logger de requisições HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting para proteger endpoints públicos contra brute-force
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  message: { sucesso: false, erro: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use('/api/', publicLimiter);

// Parsers de Body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do Frontend (HTML5 + CSS3 + Bootstrap)
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API REST
app.use('/api', apiRoutes);

// Middleware Central de Tratamento de Erros
app.use(errorHandler);

module.exports = app;
