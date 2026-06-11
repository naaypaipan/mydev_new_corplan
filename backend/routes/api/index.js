const router = require("express").Router();

router.use("/user", require("./user"));

router.use("/role-type", require("./roleType"));

router.use("/employee", require("./employee"));
router.use("/employee-type", require("./employeeType"));

router.use("/upload", require("./upload"));
router.use("/budget", require("./budget"));
router.use("/project", require("./project"));
router.use("/expenses", require("./expenses"));
router.use("/activity-log", require("./activityLog"));
router.use("/information", require("./information"));
router.use("/notify", require("./notify"));
router.use("/customer", require("./customer"));

router.use("/customer-type", require("./customerType"));

router.use("/init-system", require("./initSystem"));

router.use("/department", require("./department"));
router.use("/timestamp", require("./timestamp"));
router.use("/holiday", require("./holiday"));
router.use("/billing", require("./billing"));
router.use("/payout", require("./payout"));
router.use("/payin", require("./payin"));
router.use("/claim", require("./claim"));
router.use("/paytype", require("./payType"));
router.use("/transectiontype", require("./transectionType"));
router.use("/payment_api", require("./payment"));
router.use("/salary", require("./salary"));
router.use("/salary-list", require("./salaryList"));
router.use("/ot-request", require("./otRequest"));
router.use("/ot-request-order", require("./otRequestOrder"));
router.use("/chat-expenses", require("./chatExpenses"));
router.use("/ssotransection", require("./ssotransection"));
router.use("/manpower", require("./manpower"));

router.use("/geocode", require("./geocode"));
router.use('/ai', require('./ai'));



module.exports = router;
