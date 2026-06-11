const router = require("express").Router();

const controllers = require("../../controllers/expenses.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/:id", auth.required, controllers.onGetById);
router.get("/daily/report", auth.required, controllers.onGetDaily);
router.post("/", auth.required, controllers.onInsert);
router.post("/won", auth.required, controllers.onInsertWithoutNotify);
router.put("/:id", auth.required, controllers.onUpdate);
router.delete("/:id/images/:imageId", auth.required, controllers.onRemoveImage);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
