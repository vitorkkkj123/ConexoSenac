module.exports = {
  BUSINESS_RULES: {
    MAX_FALTAS_PERMITIDAS: 2,
    MAX_REAGENDAMENTOS_PERMITIDOS: 2,
    LIMITE_HORAS_CANCELAMENTO_SEM_FALTA: 24,
    DURACOES: {
      entrevista_1h: 1,
      mentoria_2h: 2
    }
  },
  PROGRAM_STATUS: {
    INSCRITO: 'inscrito',
    EM_MENTORIA: 'em_mentoria',
    CONCLUIDO: 'concluido',
    EVADIDO: 'evadido',
    BLOQUEADO: 'bloqueado'
  },
  USER_ROLES: {
    ADMIN: 'admin',
    ATENDIMENTO: 'atendimento',
    CONSULTOR: 'consultor',
    COORDENADOR: 'coordenador'
  }
};
