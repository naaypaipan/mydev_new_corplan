const router = require("express").Router();
const auth = require("../auth");
const googleSheetService = require("../../services/googlesheet.service");

router.get("/sheets", auth.required, async (req, res) => {
  try {
    const titles = await googleSheetService.listSheets();
    res.success(titles);
  } catch (error) {
    res.error(error);
  }
});

module.exports = router;
