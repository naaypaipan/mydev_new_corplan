const Service = require("../services/upload.service");

const methods = {
  async onUpload(req, res) {
    try {
      const result = await Service.upload(req.body);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },
  async onUploadFile(req, res) {
    try {
      const result = await Service.uploadFile(req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },
};

module.exports = { ...methods };
