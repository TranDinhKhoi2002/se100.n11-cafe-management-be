const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const reportController = require("../controllers/report");

router.get("/report-by-date", isAuth, reportController.getReportByDate);

router.get("/report-by-month", isAuth, reportController.getReportByMonth);

module.exports = router;