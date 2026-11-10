const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const connectDB = require('./config/database');
const { isServerlessFallbackAtivo, exportarEstadoSync, mesclarEstadoSync } = require('./utils/serverlessStore');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();
app.set('trust proxy', 1);

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
  validate: { xForwardedForHeader: false },
  message: { sucesso: false, erro: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use('/api/', publicLimiter);

// Parsers de Body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do Frontend (HTML5 + CSS3 + Bootstrap)
app.use(express.static(path.join(__dirname, '../public')));

// Garantir conexão com o banco (ou Serverless Fallback na Vercel) antes das rotas da API
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();

    if (isServerlessFallbackAtivo()) {
      const syncHeader = req.headers['x-conexo-sync'];
      if (syncHeader && typeof syncHeader === 'string') {
        try {
          const decoded = Buffer.from(syncHeader, 'base64').toString('utf8');
          mesclarEstadoSync(JSON.parse(decoded));
        } catch (eSync) {}
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          body._syncState = exportarEstadoSync();
        }
        return originalJson(body);
      };
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Rotas da API REST
app.use('/api', apiRoutes);

// Middleware Central de Tratamento de Erros
app.use(errorHandler);

module.exports = app;
