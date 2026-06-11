const router = require("express").Router();

const controllers = require("../../controllers/manpower.controller");

router.get("/", controllers.onFind);

module.exports = router;
