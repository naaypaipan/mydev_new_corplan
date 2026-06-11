const router = require("express").Router();

const controllers = require("../../controllers/otRequestOrder.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/:id", auth.required, controllers.onGetById);
router.post("/", auth.required, controllers.onInsert);
router.post("/hr", auth.required, controllers.onInsertWithNotify);
router.put("/:id", auth.required, controllers.onUpdate);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
