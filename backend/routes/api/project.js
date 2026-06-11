const router = require("express").Router();

const controllers = require("../../controllers/project.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/:id", controllers.onGetById);
router.post("/", auth.required, controllers.onInsert);
router.put("/:id", auth.required, controllers.onUpdate);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
