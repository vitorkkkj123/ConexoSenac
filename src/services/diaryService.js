const MentorshipDiary = require('../models/MentorshipDiary');
const Entrepreneur = require('../models/Entrepreneur');
const AuditLog = require('../models/AuditLog');
const { NotFoundError, BusinessError } = require('../utils/errors');

class DiaryService {
  async getByEntrepreneurId(empreendedorId) {
    let diary = await MentorshipDiary.findOne({ empreendedorId })
      .populate('encontros.consultorId', 'nome email');

    if (!diary) {
      // Se por algum motivo antigo não tiver, cria na hora
      diary = await MentorshipDiary.create({ empreendedorId });
    }

    return diary;
  }

  async getByAccessToken(accessToken) {
    const entrepreneur = await Entrepreneur.findOne({ accessToken });
    if (!entrepreneur) {
      throw new NotFoundError('Link de acesso inválido.');
    }

    const diary = await this.getByEntrepreneurId(entrepreneur._id);
    const diaryPublico = diary.toObject();
    diaryPublico.encontros = (diaryPublico.encontros || []).map((enc) => {
      const { observacoesGerais, ...resto } = enc;
      return resto;
    });

    return diaryPublico;
  }

  async updateChecklistByAccessToken(accessToken, numeroEncontro, { checklistMetas }) {
    const num = Number(numeroEncontro);
    if (num < 1 || num > 5) {
      throw new BusinessError('Número do encontro deve estar entre 1 e 5.');
    }

    const entrepreneur = await Entrepreneur.findOne({ accessToken });
    if (!entrepreneur) {
      throw new NotFoundError('Link de acesso inválido.');
    }

    const diary = await MentorshipDiary.findOne({ empreendedorId: entrepreneur._id });
    if (!diary) {
      throw new NotFoundError('Diário de bordo não encontrado.');
    }

    const encontro = diary.encontros.find(e => e.numeroEncontro === num);
    if (!encontro) {
      throw new NotFoundError(`Encontro ${num} não encontrado no diário.`);
    }

    if (Array.isArray(checklistMetas) && Array.isArray(encontro.checklistMetas)) {
      encontro.checklistMetas.forEach((itemOriginal, idx) => {
        if (checklistMetas[idx] !== undefined && typeof checklistMetas[idx].concluida === 'boolean') {
          itemOriginal.concluida = checklistMetas[idx].concluida;
        }
      });
      await diary.save();
    }

    return this.getByAccessToken(accessToken);
  }

  async updateMeeting(empreendedorId, numeroEncontro, data) {
    const num = Number(numeroEncontro);
    if (num < 1 || num > 5) {
      throw new BusinessError('Número do encontro deve estar entre 1 e 5.');
    }

    let diary = await MentorshipDiary.findOne({ empreendedorId });
    if (!diary) {
      diary = await MentorshipDiary.create({ empreendedorId });
    }

    const encontro = diary.encontros.find(e => e.numeroEncontro === num);
    if (!encontro) {
      throw new NotFoundError(`Encontro ${num} não encontrado no diário.`);
    }

    const statusAnterior = encontro.status;

    const diagTexto = data.diagnostico !== undefined ? data.diagnostico : data.diagnosticoSituacional;
    if (diagTexto !== undefined) {
      encontro.diagnostico = diagTexto;
    }
    encontro.planoAcaoMetas = data.planoAcaoMetas !== undefined ? data.planoAcaoMetas : encontro.planoAcaoMetas;
    encontro.observacoesGerais = data.observacoesGerais !== undefined ? data.observacoesGerais : encontro.observacoesGerais;
    if (Array.isArray(data.checklistMetas)) {
      encontro.checklistMetas = data.checklistMetas;
    } else if (Array.isArray(data.checklistPlanoAcao)) {
      encontro.checklistMetas = data.checklistPlanoAcao.map(item => ({
        texto: item.texto || item.descricao || 'Meta da sessão',
        concluida: Boolean(item.concluida ?? item.concluido)
      }));
    }
    encontro.status = data.status || encontro.status;
    if (encontro.status === 'realizado') {
      encontro.dataRealizacao = data.dataRealizacao || encontro.dataRealizacao || new Date();
    } else if (encontro.status === 'pendente') {
      encontro.dataRealizacao = null;
    }
    if (data.consultorId) {
      encontro.consultorId = data.consultorId;
    }

    await diary.save();

    // Sincroniza assiduidade (faltas) e evolução de etapa do empreendedor conforme os 5 encontros
    const emp = await Entrepreneur.findById(empreendedorId);
    if (emp) {
      if (encontro.status === 'falta' && statusAnterior !== 'falta') {
        emp.totalFaltas = (emp.totalFaltas || 0) + 1;
        if (emp.totalFaltas >= 2) {
          emp.bloqueadoPorAssiduidade = true;
          emp.statusPrograma = 'bloqueado';
        }
      } else if (statusAnterior === 'falta' && encontro.status !== 'falta') {
        emp.totalFaltas = Math.max(0, (emp.totalFaltas || 0) - 1);
        if (emp.totalFaltas < 2 && emp.bloqueadoPorAssiduidade) {
          emp.bloqueadoPorAssiduidade = false;
          emp.statusPrograma = 'em_mentoria';
        }
      }

      const todosOsCincoRealizados =
        diary.encontros.length === 5 &&
        diary.encontros.every(e => e.status === 'realizado');

      if (todosOsCincoRealizados) {
        emp.statusPrograma = 'concluido';
      } else if (!emp.bloqueadoPorAssiduidade) {
        const temAlgumRealizado = diary.encontros.some(e => e.status === 'realizado');
        if (temAlgumRealizado && ['inscrito', 'em_diagnostico', 'concluido'].includes(emp.statusPrograma)) {
          emp.statusPrograma = 'em_mentoria';
        }
      }

      await emp.save();
    }

    await AuditLog.create({
      acao: 'ATUALIZACAO_DIARIO',
      entidade: 'Diario',
      entidadeId: diary._id,
      detalhes: `Encontro ${num} atualizado (${encontro.status}).`
    }).catch(() => {});

    return diary;
  }

  async addDeliverable(empreendedorId, numeroEncontro, { titulo, urlArquivo }) {
    const num = Number(numeroEncontro);
    const diary = await MentorshipDiary.findOne({ empreendedorId });
    if (!diary) {
      throw new NotFoundError('Diário de bordo não encontrado.');
    }

    const encontro = diary.encontros.find(e => e.numeroEncontro === num);
    if (!encontro) {
      throw new NotFoundError(`Encontro ${num} não encontrado.`);
    }

    encontro.entregaveis.push({
      titulo,
      urlArquivo,
      dataEnvio: new Date()
    });

    await diary.save();
    return diary;
  }
}

module.exports = new DiaryService();
