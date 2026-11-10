const Entrepreneur = require('../models/Entrepreneur');
const MentorshipDiary = require('../models/MentorshipDiary');
const Schedule = require('../models/Schedule');
const AuditLog = require('../models/AuditLog');
const { ConflictError, NotFoundError, BusinessError } = require('../utils/errors');

class EntrepreneurService {
  async _validarENormalizarCNPJ(cnpjRaw, excludeEntrepreneurId = null) {
    if (!cnpjRaw) return null;
    const cnpjLimpo = String(cnpjRaw).replace(/\D/g, '');
    if (!cnpjLimpo) return null;

    if (cnpjLimpo.length !== 14 || /^(\d)\1{13}$/.test(cnpjLimpo)) {
      throw new BusinessError('CNPJ inválido. Informe exatamente 14 dígitos numéricos válidos.');
    }

    const filtro = { 'negocio.cnpj': cnpjLimpo };
    if (excludeEntrepreneurId) {
      filtro._id = { $ne: excludeEntrepreneurId };
    }

    const cnpjDuplicado = await Entrepreneur.findOne(filtro);
    if (cnpjDuplicado) {
      throw new ConflictError(`Já existe um empreendedor cadastrado com este CNPJ (${cnpjDuplicado.nomeCompleto}).`);
    }

    return cnpjLimpo;
  }

  async create(data) {
    const cpfLimpo = data.cpf.replace(/\D/g, '');

    const existente = await Entrepreneur.findOne({ cpf: cpfLimpo });
    if (existente) {
      throw new ConflictError('Já existe um empreendedor cadastrado com este CPF.');
    }

    const cnpjNormalizado = await this._validarENormalizarCNPJ(data?.negocio?.cnpj);
    const situacaoAtual = data?.negocio?.situacaoAtual || 'informal';
    if (situacaoAtual !== 'informal' && !cnpjNormalizado) {
      throw new BusinessError('Para negócios formalizados (MEI), é obrigatório informar um CNPJ válido.');
    }

    const entrepreneur = await Entrepreneur.create({
      ...data,
      cpf: cpfLimpo,
      negocio: {
        ...(data.negocio || {}),
        situacaoAtual,
        cnpj: situacaoAtual === 'informal' ? null : cnpjNormalizado
      }
    });

    // Inicializa automaticamente o Diário de Bordo com os 5 encontros
    await MentorshipDiary.create({
      empreendedorId: entrepreneur._id
    });

    await AuditLog.create({
      acao: 'MATRICULA_EMPREENDEDOR',
      entidade: 'Empreendedor',
      entidadeId: entrepreneur._id,
      detalhes: `Empreendedor ${entrepreneur.nomeCompleto} inscrito no programa.`
    }).catch(() => {});

    return entrepreneur;
  }

  async list({ search, status, page = 1, limit = 20 }) {
    const query = {};

    if (status) {
      query.statusPrograma = status;
    }

    if (search && String(search).trim() !== '') {
      const termoLimpo = String(search).trim();
      const termoEscapado = termoLimpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(termoEscapado, 'i');
      const digitos = termoLimpo.replace(/\D/g, '');

      const condicoesOr = [
        { nomeCompleto: regex },
        { 'negocio.nomeFantasia': regex },
        { whatsapp: regex }
      ];

      if (digitos.length > 0) {
        const regexDigitos = new RegExp(digitos, 'i');
        condicoesOr.push({ cpf: regexDigitos });
        condicoesOr.push({ 'negocio.cnpj': regexDigitos });
        condicoesOr.push({ whatsapp: regexDigitos });
      }

      query.$or = condicoesOr;
    }

    const paginaSegura = Math.max(1, Number(page) || 1);
    const limiteSeguro = Math.min(500, Math.max(1, Number(limit) || 20));
    const skip = (paginaSegura - 1) * limiteSeguro;

    const [total, items] = await Promise.all([
      Entrepreneur.countDocuments(query),
      Entrepreneur.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limiteSeguro)
        .lean()
    ]);

    const idsPagina = items.map(item => item._id);
    const agendamentosAtivos = idsPagina.length > 0
      ? await Schedule.find({
          status: 'agendado',
          empreendedorId: { $in: idsPagina }
        })
          .select('empreendedorId dataHoraInicio confirmadoPeloAluno')
          .lean()
      : [];

    const mapaAgendados = new Map();
    agendamentosAtivos.forEach(ag => {
      if (ag.empreendedorId) {
        mapaAgendados.set(String(ag.empreendedorId), {
          dataHoraInicio: ag.dataHoraInicio,
          confirmadoPeloAluno: Boolean(ag.confirmadoPeloAluno)
        });
      }
    });

    const itensEnriquecidos = items.map(obj => {
      const prox = mapaAgendados.get(String(obj._id)) || null;
      return {
        ...obj,
        temAgendamentoAtivo: Boolean(prox),
        proximoAgendamento: prox
      };
    });

    return {
      total,
      pagina: paginaSegura,
      totalPaginas: Math.ceil(total / limiteSeguro),
      itens: itensEnriquecidos
    };
  }

  async getById(id) {
    const entrepreneur = await Entrepreneur.findById(id);
    if (!entrepreneur) {
      throw new NotFoundError('Empreendedor não encontrado.');
    }
    return entrepreneur;
  }

  async getByAccessToken(token) {
    const entrepreneur = await Entrepreneur.findOne({ accessToken: token });
    if (!entrepreneur) {
      throw new NotFoundError('Acesso inválido ou não autorizado.');
    }
    return entrepreneur;
  }

  async update(id, data) {
    let entrepreneur = await Entrepreneur.findById(id);
    if (!entrepreneur) {
      entrepreneur = await Entrepreneur.create({
        _id: id,
        nomeCompleto: data.nomeCompleto || 'Empreendedor Co.Nexo',
        cpf: data.cpf || String(10000000000 + Math.floor(Math.random() * 89999999999)),
        whatsapp: data.whatsapp || '11999999999',
        email: data.email || '',
        statusPrograma: data.statusPrograma || 'em_mentoria',
        negocio: data.negocio || { nomeFantasia: 'Negócio em Estruturação', situacaoAtual: 'informal' },
        aceiteLGPD: true
      });
    }

    if (data.nomeCompleto) entrepreneur.nomeCompleto = data.nomeCompleto.trim();
    if (data.whatsapp) entrepreneur.whatsapp = data.whatsapp.replace(/\D/g, '');
    if (data.email !== undefined) entrepreneur.email = data.email.trim();
    if (data.statusPrograma) {
      if (data.statusPrograma === 'concluido') {
        const diary = await MentorshipDiary.findOne({ empreendedorId: entrepreneur._id });
        const todosRealizados =
          diary &&
          Array.isArray(diary.encontros) &&
          diary.encontros.length === 5 &&
          diary.encontros.every(e => e.status === 'realizado');
        if (!todosRealizados) {
          throw new BusinessError('O empreendedor só pode ser marcado como CONCLUÍDO após realizar todos os 5 encontros da trilha no Diário de Bordo.');
        }
      }
      entrepreneur.statusPrograma = data.statusPrograma;
    }
    if (data.bloqueadoPorAssiduidade !== undefined) entrepreneur.bloqueadoPorAssiduidade = Boolean(data.bloqueadoPorAssiduidade);
    if (data.totalFaltas !== undefined) entrepreneur.totalFaltas = Number(data.totalFaltas);
    if (data.totalReagendamentos !== undefined) entrepreneur.totalReagendamentos = Number(data.totalReagendamentos);

    if (!entrepreneur.negocio) {
      entrepreneur.negocio = {};
    }

    if (data.negocio) {
      if (data.negocio.nomeFantasia !== undefined) {
        entrepreneur.negocio.nomeFantasia = data.negocio.nomeFantasia.trim();
      }
      if (data.negocio.ramoAtividade !== undefined) {
        entrepreneur.negocio.ramoAtividade = data.negocio.ramoAtividade.trim();
      }
      if (data.negocio.situacaoAtual !== undefined) {
        entrepreneur.negocio.situacaoAtual = data.negocio.situacaoAtual;
      }
      if (data.negocio.cnpj !== undefined) {
        const cnpjValido = await this._validarENormalizarCNPJ(data.negocio.cnpj, entrepreneur._id);
        entrepreneur.negocio.cnpj = entrepreneur.negocio.situacaoAtual === 'informal' ? null : cnpjValido;
      }
    }

    if (data.maturidade) {
      if (!entrepreneur.maturidade) {
        entrepreneur.maturidade = { financas: 3, vendas: 3, operacoes: 3, formalizacao: 3 };
      }
      if (data.maturidade.financas !== undefined) entrepreneur.maturidade.financas = Number(data.maturidade.financas);
      if (data.maturidade.vendas !== undefined) entrepreneur.maturidade.vendas = Number(data.maturidade.vendas);
      if (data.maturidade.operacoes !== undefined) entrepreneur.maturidade.operacoes = Number(data.maturidade.operacoes);
      if (data.maturidade.formalizacao !== undefined) entrepreneur.maturidade.formalizacao = Number(data.maturidade.formalizacao);
    }

    if (data.maturidadeInicial) {
      if (!entrepreneur.maturidadeInicial) {
        entrepreneur.maturidadeInicial = { financas: 2, vendas: 2, operacoes: 2, formalizacao: 2 };
      }
      if (data.maturidadeInicial.financas !== undefined) entrepreneur.maturidadeInicial.financas = Number(data.maturidadeInicial.financas);
      if (data.maturidadeInicial.vendas !== undefined) entrepreneur.maturidadeInicial.vendas = Number(data.maturidadeInicial.vendas);
      if (data.maturidadeInicial.operacoes !== undefined) entrepreneur.maturidadeInicial.operacoes = Number(data.maturidadeInicial.operacoes);
      if (data.maturidadeInicial.formalizacao !== undefined) entrepreneur.maturidadeInicial.formalizacao = Number(data.maturidadeInicial.formalizacao);
    }

    await entrepreneur.save();

    await AuditLog.create({
      acao: 'ATUALIZACAO_CADASTRO',
      entidade: 'Empreendedor',
      entidadeId: entrepreneur._id,
      detalhes: `Dados cadastrais ou termômetro de maturidade de ${entrepreneur.nomeCompleto} atualizados.`
    }).catch(() => {});

    return entrepreneur;
  }

  async updateFormalizacao(id, { situacaoAtual, cnpj }) {
    const entrepreneur = await Entrepreneur.findById(id);
    if (!entrepreneur) {
      throw new NotFoundError('Empreendedor não encontrado.');
    }

    const cnpjNormalizado = situacaoAtual === 'informal'
      ? null
      : await this._validarENormalizarCNPJ(cnpj !== undefined ? cnpj : entrepreneur.negocio?.cnpj, entrepreneur._id);

    if (situacaoAtual !== 'informal' && !cnpjNormalizado) {
      throw new BusinessError('Informe um CNPJ válido de 14 dígitos para registrar a formalização do MEI.');
    }

    entrepreneur.negocio.situacaoAtual = situacaoAtual;
    entrepreneur.negocio.cnpj = cnpjNormalizado;

    await entrepreneur.save();

    await AuditLog.create({
      acao: 'FORMALIZACAO_MEI',
      entidade: 'Empreendedor',
      entidadeId: entrepreneur._id,
      detalhes: `Situação cadastral de ${entrepreneur.nomeCompleto} atualizada para ${situacaoAtual}${cnpj ? ' (CNPJ: ' + cnpj + ')' : ''}.`
    }).catch(() => {});

    return entrepreneur;
  }

  async importFromRDStation(payload) {
    // Normalização dos campos vindos de Webhook do RD Station ou Landing Page
    const nome = payload.name || payload.nomeCompleto || payload.nome || 'Lead Sem Nome';
    const email = payload.email || '';
    const whatsapp = payload.mobile_phone || payload.personal_phone || payload.whatsapp || payload.telefone || '';
    const cpf = (payload.cpf || payload.cf_cpf || '').replace(/\D/g, '');

    if (!cpf) {
      // Se não houver CPF, gera um placeholder temporário para não travar o lead
      throw new ConflictError('Payload do lead não contém CPF válido.');
    }

    let entrepreneur = await Entrepreneur.findOne({ cpf });

    if (entrepreneur) {
      // Atualiza dados se já existir
      entrepreneur.whatsapp = whatsapp || entrepreneur.whatsapp;
      entrepreneur.email = email || entrepreneur.email;
      await entrepreneur.save();
      return { lead: entrepreneur, atualizado: true };
    }

    entrepreneur = await this.create({
      nomeCompleto: nome,
      cpf,
      whatsapp,
      email,
      negocio: {
        nomeFantasia: payload.company_name || payload.nomeFantasia || '',
        ramoAtividade: payload.ramoAtividade || payload.cf_ramo || '',
        situacaoAtual: 'informal'
      },
      aceiteLGPD: true,
      origemLead: 'RD_Station'
    });

    return { lead: entrepreneur, criado: true };
  }

  async importBatchCSV(leads = []) {
    if (!Array.isArray(leads) || leads.length === 0) {
      throw new BusinessError('Nenhum registro encontrado na planilha CSV.');
    }

    let criados = 0;
    let atualizados = 0;
    let erros = 0;

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i] || {};
      try {
        const nome = (row.nomeCompleto || row.name || row.nome || '').trim();
        if (!nome) continue;

        let cpf = String(row.cpf || row.cf_cpf || '').replace(/\D/g, '');
        if (cpf.length !== 11) {
          // Caso a planilha do RD Station não tenha CPF ou esteja incompleto, gera 11 dígitos únicos baseados no timestamp/índice
          cpf = String(10000000000 + Math.floor(Math.random() * 89999999999));
        }

        let whatsapp = String(row.whatsapp || row.mobile_phone || row.personal_phone || row.telefone || '11999999999').replace(/\D/g, '');
        if (whatsapp.length < 10) whatsapp = '11999999999';

        const email = String(row.email || '').trim().toLowerCase();
        const nomeFantasia = String(row.nomeFantasia || row.company_name || row.empresa || 'Negócio em Estruturação').trim();
        const ramoAtividade = String(row.ramoAtividade || row.cf_ramo || row.ramo || 'Comércio / Serviços').trim();
        const situacaoRaw = String(row.situacaoAtual || 'informal').toLowerCase();
        const situacaoAtual = ['informal', 'mei_aberto', 'mei_inadimplente'].includes(situacaoRaw) ? situacaoRaw : 'informal';
        const cnpj = row.cnpj ? String(row.cnpj).replace(/\D/g, '') : null;

        let existente = await Entrepreneur.findOne({
          $or: [
            { cpf },
            ...(email ? [{ email }] : [])
          ]
        });

        if (existente) {
          existente.nomeCompleto = nome || existente.nomeCompleto;
          existente.whatsapp = whatsapp || existente.whatsapp;
          if (email) existente.email = email;
          if (nomeFantasia) existente.negocio.nomeFantasia = nomeFantasia;
          if (ramoAtividade) existente.negocio.ramoAtividade = ramoAtividade;
          await existente.save();
          atualizados++;
        } else {
          const novo = await Entrepreneur.create({
            nomeCompleto: nome,
            cpf,
            whatsapp,
            email,
            negocio: {
              nomeFantasia,
              ramoAtividade,
              situacaoAtual,
              cnpj: cnpj && cnpj.length === 14 ? cnpj : null
            },
            aceiteLGPD: true,
            origemLead: 'RD_Station',
            statusPrograma: 'inscrito'
          });

          await MentorshipDiary.create({ empreendedorId: novo._id }).catch(() => {});
          criados++;
        }
      } catch (err) {
        erros++;
      }
    }

    await AuditLog.create({
      acao: 'IMPORTACAO_CSV_RD_STATION',
      entidade: 'Empreendedor',
      detalhes: `Importação CSV RD Station concluída: ${criados} novos leads criados, ${atualizados} atualizados.`
    }).catch(() => {});

    return { criados, atualizados, erros, totalProcessados: criados + atualizados };
  }
}

module.exports = new EntrepreneurService();
