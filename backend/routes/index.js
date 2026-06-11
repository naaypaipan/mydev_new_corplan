const path = require("path");

const express = require("express");
const router = require("express").Router();

const config = require("../configs/app");

const staticExport = express.static(path.join(__dirname, "../www"));

router.use(`/api/v${config.apiVersion}`, require("./api"));

router.use("/", staticExport);
router.use("", staticExport);
router.use("/auth", staticExport);
router.use("/auth/*", staticExport);
router.use("/manpower", staticExport);
router.use("/manpower/*", staticExport);
router.use("/monitor", staticExport);
router.use("/monitor/*", staticExport);
router.use("/project", staticExport);
router.use("/project/*", staticExport);
router.use("/expenses", staticExport);
router.use("/expenses/*", staticExport);
router.use("/finance", staticExport);
router.use("/finance/*", staticExport);
router.use("/management", staticExport);
router.use("/management/*", staticExport);
router.use("/profile", staticExport);
router.use("/profile/*", staticExport);
router.use("/customer", staticExport);
router.use("/customer/*", staticExport);
router.use("/humen", staticExport);
router.use("/humen/*", staticExport);
router.use("/payment", staticExport);
router.use("/payment/*", staticExport);



module.exports = router;
