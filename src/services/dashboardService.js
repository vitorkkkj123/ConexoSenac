const Schedule = require('../models/Schedule');
const Entrepreneur = require('../models/Entrepreneur');
const AuditLog = require('../models/AuditLog');

class DashboardService {
  async getCockpitToday() {
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    const [atendimentosHoje, bloqueadosRecentes, totalInscritos, ativosNaTrilha, agendamentosAtivos] = await Promise.all([
      Schedule.find({
        dataHoraInicio: { $gte: hojeInicio, $lte: hojeFim }
      })
      .populate('empreendedorId', 'nomeCompleto whatsapp negocio statusPrograma')
      .populate('consultorId', 'nome email')
      .sort({ dataHoraInicio: 1 }),

      Entrepreneur.find({
        bloqueadoPorAssiduidade: true
      })
      .select('nomeCompleto whatsapp totalFaltas totalReagendamentos updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10),

      Entrepreneur.countDocuments({ statusPrograma: 'inscrito' }),

      Entrepreneur.find({
        statusPrograma: { $in: ['em_mentoria', 'inscrito'] },
        bloqueadoPorAssiduidade: { $ne: true }
      })
      .select('nomeCompleto whatsapp negocio statusPrograma accessToken updatedAt')
      .sort({ updatedAt: 1 }),

      Schedule.find({ status: 'agendado' }).select('empreendedorId')
    ]);

    const idsComAgendamento = new Set(
      agendamentosAtivos
        .filter(a => a.empreendedorId)
        .map(a => String(a.empreendedorId))
    );

    const emRiscoEvasao = ativosNaTrilha
      .filter(emp => !idsComAgendamento.has(String(emp._id)))
      .slice(0, 12);

    const statsHoje = {
      total: atendimentosHoje.length,
      agendados: atendimentosHoje.filter(a => a.status === 'agendado').length,
      confirmadosPeloAluno: atendimentosHoje.filter(a => a.status === 'agendado' && a.confirmadoPeloAluno).length,
      realizados: atendimentosHoje.filter(a => a.status === 'realizado').length,
      faltas: atendimentosHoje.filter(a => ['falta', 'cancelado_tardio_falta'].includes(a.status)).length
    };

    return {
      statsHoje,
      totalInscritosAguardando: totalInscritos,
      atendimentos: atendimentosHoje,
      alertasBloqueio: bloqueadosRecentes,
      emRiscoEvasao
    };
  }

  async getStrategicKPIs() {
    const [
      totalEmpreendedores,
      convertidosMEI,
      informais,
      inadimplentes,
      totalRealizados,
      totalFaltasGerais,
      horasExecutadasAgregadas,
      porStatusPrograma,
      maturidadeMediaAgregada
    ] = await Promise.all([
      Entrepreneur.countDocuments(),
      Entrepreneur.countDocuments({ 'negocio.situacaoAtual': 'mei_aberto' }),
      Entrepreneur.countDocuments({ 'negocio.situacaoAtual': 'informal' }),
      Entrepreneur.countDocuments({ 'negocio.situacaoAtual': 'mei_inadimplente' }),
      Schedule.countDocuments({ status: 'realizado' }),
      Schedule.countDocuments({ status: { $in: ['falta', 'cancelado_tardio_falta'] } }),
      Schedule.aggregate([
        { $match: { status: 'realizado' } },
        {
          $group: {
            _id: null,
            totalHoras: {
              $sum: {
                $cond: [{ $eq: ['$tipo', 'entrevista_1h'] }, 1, 2]
              }
            }
          }
        }
      ]),
      Entrepreneur.aggregate([
        { $group: { _id: '$statusPrograma', total: { $sum: 1 } } }
      ]),
      Entrepreneur.aggregate([
        {
          $group: {
            _id: null,
            financas: { $avg: { $ifNull: ['$maturidade.financas', 3] } },
            vendas: { $avg: { $ifNull: ['$maturidade.vendas', 3] } },
            operacoes: { $avg: { $ifNull: ['$maturidade.operacoes', 3] } },
            formalizacao: { $avg: { $ifNull: ['$maturidade.formalizacao', 3] } },
            iniFinancas: { $avg: { $ifNull: ['$maturidadeInicial.financas', 2] } },
            iniVendas: { $avg: { $ifNull: ['$maturidadeInicial.vendas', 2] } },
            iniOperacoes: { $avg: { $ifNull: ['$maturidadeInicial.operacoes', 2] } },
            iniFormalizacao: { $avg: { $ifNull: ['$maturidadeInicial.formalizacao', 2] } }
          }
        }
      ])
    ]);

    const totalFinalizados = totalRealizados + totalFaltasGerais;
    const taxaFormalizacao = totalEmpreendedores > 0
      ? Number(((convertidosMEI / totalEmpreendedores) * 100).toFixed(1))
      : 0;

    const taxaAssiduidade = totalFinalizados > 0
      ? Number(((totalRealizados / totalFinalizados) * 100).toFixed(1))
      : 100;

    const horasMentoriaExecutadas = horasExecutadasAgregadas[0]?.totalHoras || 0;
    const matRaw = maturidadeMediaAgregada[0] || {
      financas: 3, vendas: 3, operacoes: 3, formalizacao: 3,
      iniFinancas: 2, iniVendas: 2, iniOperacoes: 2, iniFormalizacao: 2
    };
    const maturidadeMedia = {
      financas: Number((matRaw.financas || 3).toFixed(1)),
      vendas: Number((matRaw.vendas || 3).toFixed(1)),
      operacoes: Number((matRaw.operacoes || 3).toFixed(1)),
      formalizacao: Number((matRaw.formalizacao || 3).toFixed(1))
    };
    const maturidadeInicialMedia = {
      financas: Number((matRaw.iniFinancas || 2).toFixed(1)),
      vendas: Number((matRaw.iniVendas || 2).toFixed(1)),
      operacoes: Number((matRaw.iniOperacoes || 2).toFixed(1)),
      formalizacao: Number((matRaw.iniFormalizacao || 2).toFixed(1))
    };

    return {
      totalEmpreendedores,
      convertidosMEI,
      informais,
      inadimplentes,
      taxaFormalizacao,
      totalRealizados,
      totalFaltasGerais,
      taxaAssiduidade,
      horasMentoriaExecutadas,
      maturidadeMedia,
      maturidadeInicialMedia,
      distribuicaoStatus: porStatusPrograma.reduce((acc, curr) => {
        acc[curr._id] = curr.total;
        return acc;
      }, {})
    };
  }

  async getAuditLogs(limit = 30) {
    return await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  }
}

module.exports = new DashboardService();
