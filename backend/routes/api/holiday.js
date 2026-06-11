const router = require("express").Router();

const controllers = require("../../controllers/holiday.controller");
const auth = require("../auth");

router.get("/", controllers.onGetAll);
router.get("/:id", auth.required, controllers.onGetById);
router.post("/", auth.required, controllers.onInsert);
router.put("/:id", auth.required, controllers.onUpdate);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
