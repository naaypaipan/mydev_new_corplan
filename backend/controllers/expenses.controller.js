const Service = require("../services/expenses.service");

const methods = {
  async onGetAll(req, res) {
    try {
      const result = await Service.find(req);
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

  async onGetDaily(req, res) {
    try {
      const result = await Service.findDaily(req);
      res.success(result);
    } catch (error) {
      res.error(error);
    }
  },

  async onInsert(req, res) {
    try {
      const result = await Service.insert(req.body, req);
      res.success(result, 201);
    } catch (error) {
      res.error(error);
    }
  },
  async onInsertWithoutNotify(req, res) {
    try {
      const result = await Service.insertWithoutNotify(req.body, req);
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

  async onRemoveImage(req, res) {
    try {
      const result = await Service.removeImage(
        req.params.id,
        req.params.imageId,
        req
      );
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
};

module.exports = { ...methods };
