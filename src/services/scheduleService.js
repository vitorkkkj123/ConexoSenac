const Schedule = require('../models/Schedule');
const Entrepreneur = require('../models/Entrepreneur');
const MentorshipDiary = require('../models/MentorshipDiary');
const AuditLog = require('../models/AuditLog');
const { BUSINESS_RULES } = require('../config/constants');
const { BusinessError, NotFoundError, ConflictError } = require('../utils/errors');

class ScheduleService {
  async createSlot({ consultorId, tipo, dataHoraInicio, observacoesAtendimento = '' }) {
    const duracaoHoras = BUSINESS_RULES.DURACOES[tipo] || 1;
    const inicio = new Date(dataHoraInicio);
    const fim = new Date(inicio.getTime() + duracaoHoras * 60 * 60 * 1000);

    const conflito = await Schedule.findOne({
      consultorId,
      status: { $nin: ['cancelado_com_antecedencia', 'cancelado_tardio_falta'] },
      dataHoraInicio: { $lt: fim },
      dataHoraFim: { $gt: inicio }
    });

    if (conflito) {
      throw new ConflictError('Já existe um atendimento agendado ou horário aberto para este consultor neste intervalo.');
    }

    return await Schedule.create({
      consultorId,
      tipo,
      dataHoraInicio: inicio,
      dataHoraFim: fim,
      status: 'disponivel',
      observacoesAtendimento
    });
  }

  async createBlock4Hours({ consultorId, dataHoraInicio, tipo = 'entrevista_1h' }) {
    const duracaoSlot = BUSINESS_RULES.DURACOES[tipo] || 1;
    const quantidadeSlots = 4 / duracaoSlot; // 4 slots de 1h ou 2 slots de 2h
    const inicioBase = new Date(dataHoraInicio);
    const slotsCriados = [];

    for (let i = 0; i < quantidadeSlots; i++) {
      const slotInicio = new Date(inicioBase.getTime() + (i * duracaoSlot) * 60 * 60 * 1000);
      try {
        const slot = await this.createSlot({
          consultorId,
          tipo,
          dataHoraInicio: slotInicio,
          observacoesAtendimento: `Bloco Inteligente 4h - Slot ${i + 1}/${quantidadeSlots}`
        });
        slotsCriados.push(slot);
      } catch (err) {
        // Se um horário colidir, continua criando os demais possíveis
        console.warn(`[ScheduleService] Slot ${i + 1} em conflito: ${err.message}`);
      }
    }

    return slotsCriados;
  }

  _parseDateRangeLocal(dataStr) {
    // Evita que "YYYY-MM-DD" seja interpretado como UTC 00:00 (que volta 1 dia no fuso GMT-3)
    const partes = String(dataStr).split('-').map(Number);
    if (partes.length === 3 && !partes.some(isNaN)) {
      const diaInicio = new Date(partes[0], partes[1] - 1, partes[2], 0, 0, 0, 0);
      const diaFim = new Date(partes[0], partes[1] - 1, partes[2], 23, 59, 59, 999);
      return { diaInicio, diaFim };
    }
    const diaInicio = new Date(dataStr);
    diaInicio.setHours(0, 0, 0, 0);
    const diaFim = new Date(dataStr);
    diaFim.setHours(23, 59, 59, 999);
    return { diaInicio, diaFim };
  }

  async getAvailableSlots({ tipo, data }) {
    const query = { status: 'disponivel' };

    if (tipo) {
      query.tipo = tipo;
    }

    if (data) {
      const { diaInicio, diaFim } = this._parseDateRangeLocal(data);
      query.dataHoraInicio = { $gte: diaInicio, $lte: diaFim };
    } else {
      // Por padrão, traz apenas horários futuros
      query.dataHoraInicio = { $gte: new Date() };
    }

    return await Schedule.find(query)
      .populate('consultorId', 'nome email')
      .sort({ dataHoraInicio: 1 });
  }

  async getAllSchedules({ tipo, status, data }) {
    const query = {};
    if (tipo) query.tipo = tipo;
    if (status) query.status = status;

    if (data) {
      const { diaInicio, diaFim } = this._parseDateRangeLocal(data);
      query.dataHoraInicio = { $gte: diaInicio, $lte: diaFim };
    }

    return await Schedule.find(query)
      .populate('consultorId', 'nome email')
      .populate('empreendedorId', 'nomeCompleto whatsapp negocio statusPrograma')
      .sort({ dataHoraInicio: 1 });
  }

  async getByAccessToken(accessToken) {
    const entrepreneur = await Entrepreneur.findOne({ accessToken });
    if (!entrepreneur) {
      throw new NotFoundError('Link de acesso inválido.');
    }
    return await Schedule.find({
      empreendedorId: entrepreneur._id,
      status: 'agendado'
    })
      .populate('consultorId', 'nome email')
      .sort({ dataHoraInicio: 1 });
  }

  async deleteSlot(slotId) {
    const slot = await Schedule.findById(slotId);
    if (!slot) {
      throw new NotFoundError('Horário não encontrado.');
    }
    if (slot.status !== 'disponivel') {
      throw new BusinessError('Apenas horários livres podem ser removidos. Cancele o agendamento antes.');
    }
    await slot.deleteOne();
    return { removido: true };
  }

  async bookSlot({ slotId, accessToken }) {
    const entrepreneur = await Entrepreneur.findOne({ accessToken });
    if (!entrepreneur) {
      throw new NotFoundError('Empreendedor não localizado. Link de acesso inválido.');
    }

    if (entrepreneur.bloqueadoPorAssiduidade) {
      throw new BusinessError('Sua inscrição no Co.Nexo está bloqueada devido ao limite de faltas/reagendamentos. Procure o atendimento do SENAC.');
    }

    const agendamentoExistente = await Schedule.findOne({
      empreendedorId: entrepreneur._id,
      status: 'agendado'
    });
    if (agendamentoExistente) {
      throw new ConflictError('Este participante já possui um horário ativo agendado. Cancele ou conclua o atendimento atual antes de reservar outro.');
    }

    const slotAlvo = await Schedule.findById(slotId);
    if (!slotAlvo || slotAlvo.status !== 'disponivel') {
      throw new ConflictError('Este horário acabou de ser reservado por outro participante ou não está mais disponível.');
    }

    if (new Date(slotAlvo.dataHoraInicio) <= new Date()) {
      throw new BusinessError('Não é permitido reservar um horário que já iniciou ou está no passado.');
    }

    // Sincroniza automaticamente a etapa do participante conforme o tipo de sessão agendada
    if (slotAlvo.tipo === 'entrevista_1h' && entrepreneur.statusPrograma === 'inscrito') {
      entrepreneur.statusPrograma = 'em_diagnostico';
      await entrepreneur.save();
    } else if (slotAlvo.tipo === 'mentoria_2h' && ['inscrito', 'em_diagnostico'].includes(entrepreneur.statusPrograma)) {
      entrepreneur.statusPrograma = 'em_mentoria';
      await entrepreneur.save();
    }

    // Reserva atômica: garante que dois alunos não reservem o mesmo slot no mesmo milissegundo
    const slotReservado = await Schedule.findOneAndUpdate(
      { _id: slotId, status: 'disponivel' },
      {
        $set: {
          status: 'agendado',
          empreendedorId: entrepreneur._id,
          reservadoEm: new Date(),
          confirmadoPeloAluno: false,
          confirmadoEm: null
        }
      },
      { new: true }
    ).populate('consultorId', 'nome email');

    if (!slotReservado) {
      throw new ConflictError('Este horário acabou de ser reservado por outro participante. Por favor, escolha outro slot.');
    }

    await AuditLog.create({
      acao: 'RESERVA_HORARIO',
      entidade: 'Agendamento',
      entidadeId: slotReservado._id,
      detalhes: `${entrepreneur.nomeCompleto} agendou ${slotReservado.tipo} para ${new Date(slotReservado.dataHoraInicio).toLocaleString('pt-BR')}.`
    }).catch(() => {});

    return {
      agendamento: slotReservado,
      empreendedor: {
        id: entrepreneur._id,
        nome: entrepreneur.nomeCompleto,
        whatsapp: entrepreneur.whatsapp
      }
    };
  }

  async cancelOrReschedule(scheduleId, { motivo = '', accessToken = null, isInternalStaff = false }) {
    const schedule = await Schedule.findById(scheduleId).populate('empreendedorId');
    if (!schedule || schedule.status !== 'agendado') {
      throw new BusinessError('Agendamento não encontrado ou não está ativo para cancelamento.');
    }

    const entrepreneur = schedule.empreendedorId;
    if (!isInternalStaff) {
      if (!accessToken || !entrepreneur || entrepreneur.accessToken !== accessToken) {
        throw new BusinessError('Não autorizado: o token de acesso não corresponde ao titular deste agendamento.');
      }
    }

    const agora = new Date();
    const horarioInicio = new Date(schedule.dataHoraInicio);
    const diferencaHoras = (horarioInicio - agora) / (1000 * 60 * 60);

    if (diferencaHoras <= 0 && !isInternalStaff) {
      throw new BusinessError('Não é possível cancelar pelo portal um atendimento cujo horário já iniciou ou passou. Entre em contato com o atendimento SENAC.');
    }

    let novoStatus = 'cancelado_com_antecedencia';
    let mensagemRegra = 'Cancelamento realizado com antecedência válida.';

    if (diferencaHoras < BUSINESS_RULES.LIMITE_HORAS_CANCELAMENTO_SEM_FALTA) {
      novoStatus = 'cancelado_tardio_falta';
      if (entrepreneur) {
        entrepreneur.totalFaltas += 1;
      }
      mensagemRegra = 'Cancelamento tardio (< 24h). Aplicada falta automática conforme regras do programa.';
    } else if (entrepreneur) {
      entrepreneur.totalReagendamentos += 1;
    }

    if (
      entrepreneur &&
      (entrepreneur.totalFaltas >= BUSINESS_RULES.MAX_FALTAS_PERMITIDAS ||
        entrepreneur.totalReagendamentos >= BUSINESS_RULES.MAX_REAGENDAMENTOS_PERMITIDOS)
    ) {
      entrepreneur.bloqueadoPorAssiduidade = true;
      entrepreneur.statusPrograma = 'bloqueado';
      mensagemRegra += ' Atenção: Limite máximo atingido. Empreendedor bloqueado para novas remarcações.';
    }

    schedule.status = novoStatus;
    schedule.observacoesAtendimento = `${schedule.observacoesAtendimento || ''} [Cancelamento: ${motivo}]`.trim();

    await schedule.save();
    if (entrepreneur) {
      await entrepreneur.save();
    }

    // Reabre automaticamente uma nova vaga livre no mesmo horário (se ainda for futuro) para evitar ociosidade na grade do SENAC
    if (horarioInicio > agora) {
      await Schedule.create({
        consultorId: schedule.consultorId,
        tipo: schedule.tipo,
        dataHoraInicio: schedule.dataHoraInicio,
        dataHoraFim: schedule.dataHoraFim,
        status: 'disponivel',
        reagendadoDe: schedule._id,
        observacoesAtendimento: 'Vaga reaberta após cancelamento'
      }).catch((err) => {
        console.warn('[ScheduleService] Aviso ao reabrir vaga:', err.message);
      });
    }

    await AuditLog.create({
      acao: 'CANCELAMENTO_AGENDAMENTO',
      entidade: 'Agendamento',
      entidadeId: schedule._id,
      detalhes: `${entrepreneur ? entrepreneur.nomeCompleto : 'Empreendedor'}: ${mensagemRegra}`
    }).catch(() => {});

    return {
      sucesso: true,
      mensagem: mensagemRegra,
      status: novoStatus,
      bloqueado: entrepreneur ? entrepreneur.bloqueadoPorAssiduidade : false,
      estatisticas: {
        totalFaltas: entrepreneur ? entrepreneur.totalFaltas : 0,
        totalReagendamentos: entrepreneur ? entrepreneur.totalReagendamentos : 0
      }
    };
  }

  async markAttendance(scheduleId, { status, observacoes = '' }) {
    if (!['realizado', 'falta'].includes(status)) {
      throw new BusinessError('Status de presença deve ser "realizado" ou "falta".');
    }

    const schedule = await Schedule.findById(scheduleId).populate('empreendedorId');
    if (!schedule) {
      throw new NotFoundError('Agendamento não encontrado.');
    }

    const statusAnterior = schedule.status;
    if (statusAnterior === status) {
      return schedule;
    }

    schedule.status = status;
    if (observacoes) {
      schedule.observacoesAtendimento = observacoes;
    }
    await schedule.save();

    const entrepreneur = schedule.empreendedorId;
    if (entrepreneur) {
      if (status === 'realizado' && ['inscrito', 'em_diagnostico'].includes(entrepreneur.statusPrograma)) {
        entrepreneur.statusPrograma = 'em_mentoria';
      } else if (status === 'falta' && !['falta', 'cancelado_tardio_falta'].includes(statusAnterior)) {
        entrepreneur.totalFaltas += 1;
        if (entrepreneur.totalFaltas >= BUSINESS_RULES.MAX_FALTAS_PERMITIDAS) {
          entrepreneur.bloqueadoPorAssiduidade = true;
          entrepreneur.statusPrograma = 'bloqueado';
        }
      }
      await entrepreneur.save();
    }

    await AuditLog.create({
      acao: status === 'realizado' ? 'PRESENCA_CONFIRMADA' : 'FALTA_REGISTRADA',
      entidade: 'Agendamento',
      entidadeId: schedule._id,
      detalhes: `Atendimento de ${entrepreneur ? entrepreneur.nomeCompleto : 'Empreendedor'} marcado como ${status.toUpperCase()}.`
    }).catch(() => {});

    return schedule;
  }

  async confirmByStudent(scheduleId, { accessToken }) {
    const schedule = await Schedule.findById(scheduleId).populate('empreendedorId');
    if (!schedule || schedule.status !== 'agendado') {
      throw new BusinessError('Agendamento não encontrado ou não está ativo para confirmação.');
    }

    if (!accessToken || !schedule.empreendedorId || schedule.empreendedorId.accessToken !== accessToken) {
      throw new BusinessError('Token de acesso inválido ou não corresponde ao empreendedor deste agendamento.');
    }

    schedule.confirmadoPeloAluno = true;
    schedule.confirmadoEm = new Date();
    await schedule.save();

    await AuditLog.create({
      acao: 'PRE_CHECKIN_ALUNO',
      entidade: 'Agendamento',
      entidadeId: schedule._id,
      detalhes: `${schedule.empreendedorId ? schedule.empreendedorId.nomeCompleto : 'Empreendedor'} pré-confirmou presença pelo Portal Mobile (1-Toque).`
    }).catch(() => {});

    return schedule;
  }
}

module.exports = new ScheduleService();
