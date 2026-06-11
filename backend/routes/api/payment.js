const router = require("express").Router();

const controllers = require("../../controllers/payment.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/:id", auth.required, controllers.onGetById);

router.post("/", auth.required, controllers.onInsert);
router.post("/with-expenses", auth.required, controllers.onInsertWithExpenses);
router.post("/prepare-by-payee", auth.required, controllers.onPrepareByPayee);
router.put("/:id", auth.required, controllers.onUpdate);
router.post("/:id/complete", auth.required, controllers.onComplete);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
