const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const reportController = require("../controllers/report");

router.get("/reportByDate", isAuth, reportController.getReportByDate);

module.exports = router;