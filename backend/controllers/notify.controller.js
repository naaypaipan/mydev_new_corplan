const Service = require("../services/notify.service");
const Noti = require("../services/linenotifyMessageApi");

const methods = {
  async onRequestToken(req, res) {
    try {
      const result = await Service.requestAccessToken(req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onRequestTokenTimestamp(req, res) {
    try {
      const result = await Service.requestAccessTokenTimestamp(req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onNotifyDirect(req, res) {
    try {
      const result = await Service.directNotify(req.body.employeeId, req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onNotifyTimestamp(req, res) {
    try {
      const result = await Service.timestampNotify(
        req.body.employeeId,
        req.body
      );
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onTestNotifyAuto(req, res) {
    try {
      const result = await Noti.lineMessageApi();
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onNotifyOT(req, res) {
    try {
      const result = await Noti.otNotify();
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onNotifyOverDepartment(req, res) {
    try {
      const result = await Service.notifyOverDepartment(
        req.body.departmentId,
        req.body
      );

      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
module.exports = { ...methods };
