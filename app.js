const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const authRoutes = require("./routes/auth");
const tableRoutes = require("./routes/table");
const productRoutes = require("./routes/product");
const dataRoutes = require("./routes/data");
const categoryRoutes = require("./routes/category");
const receiptRoutes = require("./routes/receipt");
const userRoutes = require("./routes/user");
const reportRoutes = require("./routes/report")

// const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

app.use(helmet());
app.use(compression());
// app.use(morgan("combined", { stream: accessLogStream }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

const isAuth = require("./middleware/is-auth");
const { clearImage } = require("./util/file");

app.put("/post-image", isAuth, (req, res, next) => {
  if (!req.accountId) {
    throw new Error("Not authenticated");
  }

  if (!req.file) {
    return res.status(200).json({ message: "No files provided" });
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  return res.status(201).json({
    message: "File stored",
    filePath: req.file.path.replace(/\\/g, "/"),
  });
});
app.use("/auth", authRoutes);
app.use(tableRoutes);
app.use(productRoutes);
app.use(dataRoutes);
app.use(categoryRoutes);
app.use(receiptRoutes);
app.use(userRoutes);
app.use(reportRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data, validationErrors } = err;
  res.status(statusCode || 500).json({ message, data, validationErrors });
});

// const { generateFakeData, removeAllData } = require("./util/fakeData");
//  removeAllData();
// generateFakeData();

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s3wcnob.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(process.env.PORT || 3001);
  })
  .catch((err) => {
    console.log(err);
  });
