const router = require("express").Router();

const controllers = require("../../controllers/employee.controller");
const auth = require("../auth");

router.get("/", auth.required, controllers.onGetAll);
router.get("/timestamp", controllers.onGetAll);
router.get("/:id", auth.required, controllers.onGetById);
router.post("/", controllers.onInsert);
router.put("/:id", auth.required, controllers.onUpdate);
router.delete("/:id", auth.required, controllers.onDelete);

module.exports = router;
