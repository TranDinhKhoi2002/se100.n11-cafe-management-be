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

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/auth", authRoutes);
app.use(tableRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data, validationErrors } = err;
  res.status(statusCode).json({ message, data, validationErrors });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s3wcnob.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);

    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));