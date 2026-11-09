const mongoose = require('mongoose');
const { ativarModoServerlessFallback } = require('../utils/serverlessStore');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/conexo';
  const isLocalUri = uri.includes('127.0.0.1') || uri.includes('localhost');

  // Em ambiente Serverless (Vercel) sem MongoDB Atlas configurado, ativa store em nuvem (/tmp) instantaneamente
  if (process.env.VERCEL && isLocalUri) {
    ativarModoServerlessFallback();
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[Database] MongoDB Conectado com sucesso: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database] MongoDB indisponível (${error.message}). Ativando banco em memória/disco temporário...`);
    ativarModoServerlessFallback();
    isConnected = true;
  }
};

module.exports = connectDB;
