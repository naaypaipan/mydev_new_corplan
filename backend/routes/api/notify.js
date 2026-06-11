const router = require("express").Router();

const controllers = require("../../controllers/notify.controller");
const auth = require("../auth");

router.post("/token", auth.required, controllers.onRequestToken);
router.post(
  "/token-timestamp",
  auth.required,
  controllers.onRequestTokenTimestamp
);
router.post("/direct", auth.required, controllers.onNotifyDirect);
router.post("/direct-timestamp", auth.required, controllers.onNotifyTimestamp);
router.post("/department", auth.required, controllers.onNotifyOverDepartment);
router.post("/auto", controllers.onTestNotifyAuto);
router.post("/ot", controllers.onNotifyOT);

module.exports = router;
