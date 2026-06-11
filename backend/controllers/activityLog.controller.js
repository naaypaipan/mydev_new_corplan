const Service = require("../services/activityLog.service");

module.exports = {
  async onList(req, res) {
    try {
      const result = await Service.find(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};
