const Service = require("../services/initSystem.service");

const methods = {
  async onInitSystem(req, res) {
    try {
      const result = await Service.initSystem(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
