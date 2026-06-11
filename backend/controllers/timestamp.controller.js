const Service = require("../services/timestamp.service");

const methods = {
  async onGetAll(req, res) {
    try {
      const result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetCheckin(req, res) {
    try {
      const result = await Service.findCheckin(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetForNotify(req, res) {
    try {
      const result = await Service.findNotify(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetDashboard(req, res) {
    try {
      const result = await Service.findDashboard(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetDaily(req, res) {
    try {
      const result = await Service.checkInDaily(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onGetById(req, res) {
    try {
      const result = await Service.findById(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onInsert(req, res) {
    try {
      const result = await Service.insert(req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onInsertWithHr(req, res) {
    try {
      const result = await Service.insertwithHr(req.body, req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },

  async onUpdate(req, res) {
    try {
      const result = await Service.update(req.params.id, req.body, req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onUpdateOT(req, res) {
    try {
      const result = await Service.updateOT(req.params.id, req.body, req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onUpdateLabour(req, res) {
    try {
      const result = await Service.updateLabour(req.params.id, req.body, req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onDelete(req, res) {
    try {
      await Service.delete(req.params.id, req);
      res.success("success", 204);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetForPayroll(req, res) {
    try {
      const result = await Service.checkIPayroll(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onGetForPayrollDashboard(req, res) {
    try {
      const result = await Service.checkInPayrollwithDashboard(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
