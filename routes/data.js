const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data");
const isAuth = require("../middleware/is-auth");

router.get("/data", isAuth, dataController.getDataForSelectBox);

module.exports = router;
