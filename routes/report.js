const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const reportController = require("../controllers/report");

router.post("/report-by-day", isAuth, reportController.getReportByDay);

router.post("/report-by-month", isAuth, reportController.getReportByMonth);

router.post("/report-by-year", isAuth, reportController.getReportByYear);

router.get("/dashboard", isAuth, reportController.getStatistic);

router.post("/test", reportController.getReportByYear);

module.exports = router;