const { z } = require('zod');

const createSlotSchema = z.object({
  consultorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de consultor inválido'),
  tipo: z.enum(['entrevista_1h', 'mentoria_2h']),
  dataHoraInicio: z.string().datetime({ message: 'Data/Hora de início deve estar em formato ISO' }),
  observacoesAtendimento: z.string().optional().default('')
});

const bookSlotSchema = z.object({
  slotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de horário inválido'),
  accessToken: z.string().min(10, 'Token de acesso do mentorado inválido')
});

module.exports = {
  createSlotSchema,
  bookSlotSchema
};
