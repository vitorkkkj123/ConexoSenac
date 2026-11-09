const entrepreneurService = require('../services/entrepreneurService');

class EntrepreneurController {
  async create(req, res, next) {
    try {
      const entrepreneur = await entrepreneurService.create(req.body);
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Empreendedor cadastrado com sucesso!',
        dados: entrepreneur
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await entrepreneurService.list({ search, status, page, limit });
      return res.status(200).json({
        sucesso: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const entrepreneur = await entrepreneurService.getById(req.params.id);
      return res.status(200).json({
        sucesso: true,
        dados: entrepreneur
      });
    } catch (error) {
      next(error);
    }
  }

  async getByAccessToken(req, res, next) {
    try {
      const entrepreneur = await entrepreneurService.getByAccessToken(req.params.token);
      return res.status(200).json({
        sucesso: true,
        dados: entrepreneur
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const entrepreneur = await entrepreneurService.update(req.params.id, req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Informações do empreendedor atualizadas com sucesso!',
        dados: entrepreneur
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFormalizacao(req, res, next) {
    try {
      const entrepreneur = await entrepreneurService.updateFormalizacao(req.params.id, req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Situação de formalização atualizada com sucesso!',
        dados: entrepreneur
      });
    } catch (error) {
      next(error);
    }
  }

  async webhookRDStation(req, res, next) {
    try {
      const result = await entrepreneurService.importFromRDStation(req.body);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lead processado com sucesso!',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async importBatchCSV(req, res, next) {
    try {
      const { leads } = req.body;
      const result = await entrepreneurService.importBatchCSV(leads);
      return res.status(200).json({
        sucesso: true,
        mensagem: `${result.criados} novo(s) lead(s) importado(s) e ${result.atualizados} atualizado(s) do RD Station!`,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntrepreneurController();
