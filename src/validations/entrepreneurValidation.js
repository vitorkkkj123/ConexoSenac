const { z } = require('zod');

const cnpjOptionalSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true;
      const digits = val.replace(/\D/g, '');
      return digits.length === 14 && !/^(\d)\1{13}$/.test(digits);
    },
    { message: 'CNPJ inválido. Informe os 14 dígitos numéricos válidos.' }
  );

const createEntrepreneurSchema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().trim().regex(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, 'CPF inválido (11 dígitos numéricos ou formatado)'),
  whatsapp: z.string().trim().min(10, 'WhatsApp deve ter DDD + número'),
  email: z.string().trim().email('E-mail inválido').optional().or(z.literal('')),
  negocio: z.object({
    nomeFantasia: z.string().trim().optional().default(''),
    ramoAtividade: z.string().trim().optional().default(''),
    situacaoAtual: z.enum(['informal', 'mei_aberto', 'mei_inadimplente']).default('informal'),
    cnpj: cnpjOptionalSchema
  }).optional().default({}),
  aceiteLGPD: z.boolean().default(true),
  origemLead: z.enum(['Formulario_SENAC', 'LandingPage_SENAC', 'Balcao', 'Indicacao', 'Outros', 'RD_Station']).default('Formulario_SENAC')
});

const updateFormalizacaoSchema = z.object({
  situacaoAtual: z.enum(['informal', 'mei_aberto', 'mei_inadimplente']),
  cnpj: cnpjOptionalSchema
});

module.exports = {
  createEntrepreneurSchema,
  updateFormalizacaoSchema
};
