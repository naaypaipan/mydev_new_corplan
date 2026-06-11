const router = require("express").Router();

const controllers = require("../../controllers/initSystem.controller");

router.post("/", controllers.onInitSystem);

module.exports = router;
