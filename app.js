const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const authRoutes = require("./routes/auth");
const tableRoutes = require("./routes/table");
const productRoutes = require("./routes/product");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/auth", authRoutes);
app.use(tableRoutes);
app.use(productRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data, validationErrors } = err;
  res.status(statusCode).json({ message, data, validationErrors });
});

// const { generateFakeData, removeAllData } = require("./util/fakeData");
//  removeAllData();
// generateFakeData();

mongoose
  .connect(
    `mongodb+srv://dinhnghia:SDEcPc5R2J86Zspq@cluster0.s3wcnob.mongodb.net/coffee-app?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(process.env.PORT || 3001);
  })
  .catch((err) => {
    console.log(err);
  })
