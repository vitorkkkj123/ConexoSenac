require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const User = require('./models/User');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Conectar com o banco de dados
  await connectDB();

  // Seed automático de usuários iniciais (Max, Aline, Regis) caso não existam
  try {
    const usuariosPadrao = [
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
    for (const u of usuariosPadrao) {
      const existe = await User.findOne({ email: u.email });
      if (!existe) {
        await User.create(u);
      }
    }
  } catch (seedErr) {
    console.warn('[Seed] Aviso na inicialização de usuários:', seedErr.message);
  }

  // Iniciar servidor HTTP
  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Co.Nexo MVP (SENAC) rodando com sucesso!`);
    console.log(`📍 URL Local: http://localhost:${PORT}`);
    console.log(`📁 Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });

  // Tratamento de encerramento gracioso
  const gracefulShutdown = () => {
    console.log('\n[Server] Encerrando servidor HTTP graciosamente...');
    server.close(() => {
      console.log('[Server] Servidor encerrado.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
