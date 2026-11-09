const diaryService = require('../services/diaryService');

class DiaryController {
  async getByEntrepreneurId(req, res, next) {
    try {
      const diary = await diaryService.getByEntrepreneurId(req.params.empreendedorId);
      return res.status(200).json({
        sucesso: true,
        dados: diary
      });
    } catch (error) {
      next(error);
    }
  }

  async getByAccessToken(req, res, next) {
    try {
      const diary = await diaryService.getByAccessToken(req.params.token);
      return res.status(200).json({
        sucesso: true,
        dados: diary
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChecklistByAccessToken(req, res, next) {
    try {
      const { token, numeroEncontro } = req.params;
      const diary = await diaryService.updateChecklistByAccessToken(token, numeroEncontro, req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Progresso da tarefa atualizado!',
        dados: diary
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMeeting(req, res, next) {
    try {
      const { empreendedorId, numeroEncontro } = req.params;
      const diary = await diaryService.updateMeeting(empreendedorId, numeroEncontro, req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: `Encontro ${numeroEncontro} atualizado com sucesso!`,
        dados: diary
      });
    } catch (error) {
      next(error);
    }
  }

  async addDeliverable(req, res, next) {
    try {
      const { empreendedorId, numeroEncontro } = req.params;
      const { titulo, urlArquivo } = req.body;
      const diary = await diaryService.addDeliverable(empreendedorId, numeroEncontro, { titulo, urlArquivo });
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Entregável anexado com sucesso!',
        dados: diary
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiaryController();
