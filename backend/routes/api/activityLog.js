const router = require("express").Router();

const controller = require("../../controllers/activityLog.controller");
const auth = require("../auth");

router.get("/", auth.required, controller.onList);

module.exports = router;
