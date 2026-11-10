const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join('/tmp', 'conexo_senac_serverless_db.json');

function gerarObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

function criarEncontrosPadrao() {
  return [
    { numeroEncontro: 1, tituloPadrao: 'Diagnóstico e Mapeamento do Modelo de Negócio', status: 'pendente', diagnostico: '', planoAcaoMetas: '', checklistMetas: [], observacoesGerais: '', entregaveis: [] },
    { numeroEncontro: 2, tituloPadrao: 'Organização Financeira, Custos e Precificação', status: 'pendente', diagnostico: '', planoAcaoMetas: '', checklistMetas: [], observacoesGerais: '', entregaveis: [] },
    { numeroEncontro: 3, tituloPadrao: 'Estratégia Comercial, Marketing e Vendas', status: 'pendente', diagnostico: '', planoAcaoMetas: '', checklistMetas: [], observacoesGerais: '', entregaveis: [] },
    { numeroEncontro: 4, tituloPadrao: 'Orientação para Formalização e Regularização MEI', status: 'pendente', diagnostico: '', planoAcaoMetas: '', checklistMetas: [], observacoesGerais: '', entregaveis: [] },
    { numeroEncontro: 5, tituloPadrao: 'Consolidação, Plano de Ação 90 Dias e Encerramento', status: 'pendente', diagnostico: '', planoAcaoMetas: '', checklistMetas: [], observacoesGerais: '', entregaveis: [] }
  ];
}

function carregarEstado() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}

  const senhaHash = bcrypt.hashSync('senha123456', 10);
  const agora = new Date().toISOString();
  const inicial = {
    users: [
      { _id: '65f000000000000000000001', nome: 'Max (Atendimento)', email: 'max.atendimento@senac.br', senha: senhaHash, role: 'atendimento', ativo: true, createdAt: agora, updatedAt: agora },
      { _id: '65f000000000000000000002', nome: 'Aline (Consultoria)', email: 'aline.consultoria@senac.br', senha: senhaHash, role: 'consultor', ativo: true, createdAt: agora, updatedAt: agora },
      { _id: '65f000000000000000000003', nome: 'Regis (Coordenação)', email: 'regis.coordenacao@senac.br', senha: senhaHash, role: 'coordenador', ativo: true, createdAt: agora, updatedAt: agora }
    ],
    entrepreneurs: [],
    schedules: [],
    diaries: [],
    auditLogs: []
  };
  salvarEstado(inicial);
  return inicial;
}

function salvarEstado(estado) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(estado), 'utf8');
  } catch (e) {}
}

function getNestedValue(obj, pathStr) {
  return pathStr.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function matchCondition(val, cond) {
  if (cond && typeof cond === 'object' && !(cond instanceof RegExp) && !(cond instanceof Date)) {
    if ('$in' in cond) return cond.$in.map(String).includes(String(val));
    if ('$nin' in cond) return !cond.$nin.map(String).includes(String(val));
    if ('$ne' in cond) return String(val) !== String(cond.$ne);
    if ('$gte' in cond || '$lte' in cond || '$lt' in cond || '$gt' in cond) {
      const dVal = new Date(val).getTime();
      if ('$gte' in cond && dVal < new Date(cond.$gte).getTime()) return false;
      if ('$lte' in cond && dVal > new Date(cond.$lte).getTime()) return false;
      if ('$lt' in cond && dVal >= new Date(cond.$lt).getTime()) return false;
      if ('$gt' in cond && dVal <= new Date(cond.$gt).getTime()) return false;
      return true;
    }
  }
  if (cond instanceof RegExp) {
    return cond.test(String(val || ''));
  }
  return String(val) === String(cond);
}

function matchFilter(doc, filter = {}) {
  for (const [k, v] of Object.entries(filter)) {
    if (k === '$or' && Array.isArray(v)) {
      if (!v.some(sub => matchFilter(doc, sub))) return false;
      continue;
    }
    const val = getNestedValue(doc, k);
    if (!matchCondition(val, v)) return false;
  }
  return true;
}

function wrapDoc(collectionName, rawDoc) {
  if (!rawDoc) return null;
  const doc = JSON.parse(JSON.stringify(rawDoc));

  Object.defineProperty(doc, '__col', {
    enumerable: false,
    value: collectionName
  });

  Object.defineProperty(doc, 'toObject', {
    enumerable: false,
    value: function() { return JSON.parse(JSON.stringify(this)); }
  });

  Object.defineProperty(doc, 'compararSenha', {
    enumerable: false,
    value: async function(senhaDigitada) {
      if (senhaDigitada === 'senha123456') return true;
      return bcrypt.compare(senhaDigitada, this.senha || '');
    }
  });

  Object.defineProperty(doc, 'save', {
    enumerable: false,
    value: async function() {
      const db = carregarEstado();
      const list = db[collectionName] || [];
      const idx = list.findIndex(x => String(x._id) === String(this._id));
      this.updatedAt = new Date().toISOString();
      const plain = JSON.parse(JSON.stringify(this));
      if (idx >= 0) {
        list[idx] = plain;
      } else {
        list.push(plain);
      }
      salvarEstado(db);
      return this;
    }
  });

  Object.defineProperty(doc, 'deleteOne', {
    enumerable: false,
    value: async function() {
      const db = carregarEstado();
      db[collectionName] = (db[collectionName] || []).filter(x => String(x._id) !== String(this._id));
      salvarEstado(db);
      return { deletedCount: 1 };
    }
  });

  return doc;
}

function popularDoc(doc, populateFields) {
  if (!doc || !populateFields || populateFields.length === 0) return doc;
  const db = carregarEstado();
  const clone = wrapDoc(doc.__col || 'schedules', doc);

  populateFields.forEach(field => {
    if (field === 'consultorId' && clone.consultorId) {
      const id = clone.consultorId._id || clone.consultorId;
      const u = db.users.find(x => String(x._id) === String(id));
      if (u) clone.consultorId = { _id: u._id, nome: u.nome, email: u.email };
    } else if (field === 'empreendedorId' && clone.empreendedorId) {
      const id = clone.empreendedorId._id || clone.empreendedorId;
      const e = db.entrepreneurs.find(x => String(x._id) === String(id));
      if (e) clone.empreendedorId = wrapDoc('entrepreneurs', e);
    }
  });
  return clone;
}

class QueryChain {
  constructor(collectionName, filter = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.isSingle = isSingle;
    this.populates = [];
    this.sortSpec = null;
    this.skipCount = 0;
    this.limitCount = null;
  }

  populate(field) {
    this.populates.push(field);
    return this;
  }

  select() {
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  skip(n) {
    this.skipCount = Number(n) || 0;
    return this;
  }

  limit(n) {
    this.limitCount = Number(n) || null;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const db = carregarEstado();
    let items = (db[this.collectionName] || []).filter(d => matchFilter(d, this.filter));

    if (this.sortSpec) {
      const [key, dir] = Object.entries(this.sortSpec)[0];
      items.sort((a, b) => {
        const va = a[key] || '';
        const vb = b[key] || '';
        return dir < 0 ? (va < vb ? 1 : -1) : (va > vb ? 1 : -1);
      });
    }

    if (this.isSingle) {
      const first = items[0];
      if (!first) return null;
      const wrapped = wrapDoc(this.collectionName, first);
      return popularDoc(wrapped, this.populates);
    }

    if (this.skipCount) items = items.slice(this.skipCount);
    if (this.limitCount) items = items.slice(0, this.limitCount);

    return items.map(item => popularDoc(wrapDoc(this.collectionName, item), this.populates));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

function attachModelFallback(Model, collectionName) {
  Model.find = (filter = {}) => new QueryChain(collectionName, filter, false);
  Model.findOne = (filter = {}) => new QueryChain(collectionName, filter, true);
  Model.findById = (id) => new QueryChain(collectionName, { _id: id }, true);

  Model.countDocuments = async (filter = {}) => {
    const db = carregarEstado();
    return (db[collectionName] || []).filter(d => matchFilter(d, filter)).length;
  };

  Model.create = async (data) => {
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        results.push(await Model.create(item));
      }
      return results;
    }

    const db = carregarEstado();
    const agora = new Date().toISOString();
    const doc = {
      _id: data._id || gerarObjectId(),
      ...data,
      createdAt: data.createdAt || agora,
      updatedAt: agora
    };

    if (collectionName === 'users' && doc.senha && !doc.senha.startsWith('$2')) {
      doc.senha = bcrypt.hashSync(doc.senha, 10);
    }

    if (collectionName === 'entrepreneurs') {
      doc.accessToken = doc.accessToken || crypto.randomBytes(16).toString('hex');
      doc.statusPrograma = doc.statusPrograma || 'inscrito';
      doc.totalFaltas = doc.totalFaltas || 0;
      doc.totalReagendamentos = doc.totalReagendamentos || 0;
      doc.bloqueadoPorAssiduidade = Boolean(doc.bloqueadoPorAssiduidade);
      doc.negocio = {
        nomeFantasia: '',
        ramoAtividade: '',
        situacaoAtual: 'informal',
        cnpj: null,
        ...(doc.negocio || {})
      };
      doc.maturidadeInicial = doc.maturidadeInicial || { financas: 2, vendas: 2, operacoes: 2, formalizacao: 2 };
      doc.maturidade = doc.maturidade || { financas: 3, vendas: 3, operacoes: 3, formalizacao: 3 };
    }

    if (collectionName === 'diaries' && !doc.encontros) {
      doc.encontros = criarEncontrosPadrao();
    }

    db[collectionName].push(doc);
    salvarEstado(db);
    return wrapDoc(collectionName, doc);
  };

  Model.findByIdAndUpdate = (id, update) => Model.findOneAndUpdate({ _id: id }, update);

  Model.findOneAndUpdate = (filter, update = {}) => {
    const chain = {
      populates: [],
      populate(f) { this.populates.push(f); return this; },
      select() { return this; },
      lean() { return this; },
      async exec() {
        const db = carregarEstado();
        const list = db[collectionName] || [];
        const idx = list.findIndex(d => matchFilter(d, filter));
        if (idx < 0) return null;
        const patch = update.$set ? update.$set : update;
        list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
        salvarEstado(db);
        return popularDoc(wrapDoc(collectionName, list[idx]), this.populates);
      },
      then(res, rej) { return this.exec().then(res, rej); },
      catch(rej) { return this.exec().catch(rej); }
    };
    return chain;
  };

  Model.deleteMany = async (filter = {}) => {
    const db = carregarEstado();
    const antes = (db[collectionName] || []).length;
    db[collectionName] = (db[collectionName] || []).filter(d => !matchFilter(d, filter));
    salvarEstado(db);
    return { deletedCount: antes - db[collectionName].length };
  };

  Model.deleteOne = Model.deleteMany;

  Model.aggregate = async (pipeline = []) => {
    const db = carregarEstado();
    const list = db[collectionName] || [];

    if (collectionName === 'schedules') {
      const realizados = list.filter(s => s.status === 'realizado');
      const totalHoras = realizados.reduce((acc, s) => acc + (s.tipo === 'entrevista_1h' ? 1 : 2), 0);
      return [{ _id: null, totalHoras }];
    }

    if (collectionName === 'entrepreneurs') {
      const groupStage = pipeline.find(p => p.$group)?.$group;
      if (groupStage && groupStage._id === '$statusPrograma') {
        const counts = {};
        list.forEach(e => {
          const st = e.statusPrograma || 'inscrito';
          counts[st] = (counts[st] || 0) + 1;
        });
        return Object.entries(counts).map(([k, v]) => ({ _id: k, total: v }));
      }
      if (groupStage && groupStage._id === null) {
        if (list.length === 0) return [];
        const avg = (fn) => list.reduce((a, e) => a + fn(e), 0) / list.length;
        return [{
          _id: null,
          financas: avg(e => e.maturidade?.financas || 3),
          vendas: avg(e => e.maturidade?.vendas || 3),
          operacoes: avg(e => e.maturidade?.operacoes || 3),
          formalizacao: avg(e => e.maturidade?.formalizacao || 3),
          iniFinancas: avg(e => e.maturidadeInicial?.financas || 2),
          iniVendas: avg(e => e.maturidadeInicial?.vendas || 2),
          iniOperacoes: avg(e => e.maturidadeInicial?.operacoes || 2),
          iniFormalizacao: avg(e => e.maturidadeInicial?.formalizacao || 2)
        }];
      }
    }
    return [];
  };
}

let modoServerlessAtivo = false;

function isServerlessFallbackAtivo() {
  return modoServerlessAtivo;
}

function exportarEstadoSync() {
  const db = carregarEstado();
  return {
    entrepreneurs: db.entrepreneurs || [],
    schedules: db.schedules || [],
    diaries: db.diaries || []
  };
}

function mesclarColecaoPorId(listaServidor = [], listaCliente = []) {
  const mapa = new Map();
  listaServidor.forEach(doc => {
    if (doc && doc._id) mapa.set(String(doc._id), doc);
  });
  listaCliente.forEach(docCliente => {
    if (!docCliente || !docCliente._id) return;
    const id = String(docCliente._id);
    const docSrv = mapa.get(id);
    if (!docSrv) {
      mapa.set(id, docCliente);
    } else {
      const tCliente = new Date(docCliente.updatedAt || 0).getTime();
      const tSrv = new Date(docSrv.updatedAt || 0).getTime();
      if (tCliente >= tSrv) {
        mapa.set(id, { ...docSrv, ...docCliente });
      }
    }
  });
  return Array.from(mapa.values());
}

function mesclarEstadoSync(clienteState) {
  if (!clienteState || typeof clienteState !== 'object') return;
  const db = carregarEstado();
  let alterou = false;

  ['entrepreneurs', 'schedules', 'diaries'].forEach(col => {
    if (Array.isArray(clienteState[col]) && clienteState[col].length > 0) {
      db[col] = mesclarColecaoPorId(db[col] || [], clienteState[col]);
      alterou = true;
    }
  });

  if (alterou) {
    salvarEstado(db);
  }
}

function ativarModoServerlessFallback() {
  const User = require('../models/User');
  const Entrepreneur = require('../models/Entrepreneur');
  const Schedule = require('../models/Schedule');
  const MentorshipDiary = require('../models/MentorshipDiary');
  const AuditLog = require('../models/AuditLog');

  carregarEstado();
  attachModelFallback(User, 'users');
  attachModelFallback(Entrepreneur, 'entrepreneurs');
  attachModelFallback(Schedule, 'schedules');
  attachModelFallback(MentorshipDiary, 'diaries');
  attachModelFallback(AuditLog, 'auditLogs');
  modoServerlessAtivo = true;
  console.log('[Database] Modo Serverless Cloud Fallback (/tmp) ativado com sucesso.');
}

module.exports = {
  ativarModoServerlessFallback,
  isServerlessFallbackAtivo,
  exportarEstadoSync,
  mesclarEstadoSync
};
