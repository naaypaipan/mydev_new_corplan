const router = require("express").Router();

const controllers = require("../../controllers/timestamp.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/manppower/check", controllers.onGetAll);
router.get("/checkin", controllers.onGetCheckin);
router.get("/checkin/notify", controllers.onGetForNotify);
router.get("/daily", controllers.onGetDaily);
router.get("/dashboard", controllers.onGetDashboard);
router.get("/timestamp-payroll", controllers.onGetForPayroll);
router.get(
  "/timestamp-payroll-dashboard",
  controllers.onGetForPayrollDashboard
);
router.get("/:id", auth.required, controllers.onGetById);
router.post("/", controllers.onInsert);
router.post("/with-hr", controllers.onInsertWithHr);
router.put("/:id", controllers.onUpdate);
router.put("/ot/:id", auth.required, controllers.onUpdateOT);
router.put("/labour/:id", auth.required, controllers.onUpdateLabour);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
