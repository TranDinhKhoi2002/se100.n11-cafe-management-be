const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data");
const isAuth = require("../middleware/is-auth");

router.get("/dataSelectBox", isAuth, dataController.getDataForSelectBox);

router.get("/data", isAuth, dataController.getData);

module.exports = router;
