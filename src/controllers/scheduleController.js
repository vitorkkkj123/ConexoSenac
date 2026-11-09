const scheduleService = require('../services/scheduleService');

class ScheduleController {
  async createSlot(req, res, next) {
    try {
      const slot = await scheduleService.createSlot(req.body);
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Horário disponibilizado na grade!',
        dados: slot
      });
    } catch (error) {
      next(error);
    }
  }

  async createBlock4Hours(req, res, next) {
    try {
      const { consultorId, dataHoraInicio, tipo } = req.body;
      const slots = await scheduleService.createBlock4Hours({ consultorId, dataHoraInicio, tipo });
      return res.status(201).json({
        sucesso: true,
        mensagem: `Bloco de 4 horas gerado com sucesso! (${slots.length} slots criados)`,
        dados: slots
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { tipo, data } = req.query;
      const slots = await scheduleService.getAvailableSlots({ tipo, data });
      return res.status(200).json({
        sucesso: true,
        total: slots.length,
        dados: slots
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSchedules(req, res, next) {
    try {
      const { tipo, status, data } = req.query;
      const slots = await scheduleService.getAllSchedules({ tipo, status, data });
      return res.status(200).json({
        sucesso: true,
        total: slots.length,
        dados: slots
      });
    } catch (error) {
      next(error);
    }
  }

  async getByAccessToken(req, res, next) {
    try {
      const { token } = req.params;
      const agendamentos = await scheduleService.getByAccessToken(token);
      return res.status(200).json({
        sucesso: true,
        dados: agendamentos
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSlot(req, res, next) {
    try {
      const { id } = req.params;
      await scheduleService.deleteSlot(id);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Horário livre removido da grade!'
      });
    } catch (error) {
      next(error);
    }
  }

  async bookSlot(req, res, next) {
    try {
      const result = await scheduleService.bookSlot(req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Horário confirmado com sucesso!',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrReschedule(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo, accessToken } = req.body;
      const isInternalStaff = Boolean(req.user && ['admin', 'atendimento', 'consultor', 'coordenador'].includes(req.user.role));
      const result = await scheduleService.cancelOrReschedule(id, { motivo, accessToken, isInternalStaff });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      const result = await scheduleService.markAttendance(id, { status, observacoes });
      return res.status(200).json({
        sucesso: true,
        mensagem: `Presença registrada como '${status}'!`,
        dados: result
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmByStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { accessToken } = req.body;
      const result = await scheduleService.confirmByStudent(id, { accessToken });
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Sua presença foi pré-confirmada com sucesso!',
        dados: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
