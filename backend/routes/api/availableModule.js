const router = require("express").Router();

const controllers = require("../../controllers/availableModule.controller");
const auth = require("../auth");

router.get("/", controllers.onGetAll);
router.put("/:id", auth.required, controllers.onUpdate);

module.exports = router;
