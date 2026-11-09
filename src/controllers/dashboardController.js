const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getCockpitToday(req, res, next) {
    try {
      const data = await dashboardService.getCockpitToday();
      return res.status(200).json({
        sucesso: true,
        dados: data
      });
    } catch (error) {
      next(error);
    }
  }

  async getStrategicKPIs(req, res, next) {
    try {
      const data = await dashboardService.getStrategicKPIs();
      return res.status(200).json({
        sucesso: true,
        dados: data
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await dashboardService.getAuditLogs(req.query.limit || 30);
      return res.status(200).json({
        sucesso: true,
        dados: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
