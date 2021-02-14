// Importing the file
const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
let config = require("config");
const AppError = require("./utils/AppError");
const globalHandleError = require("./controller/errorController");

app.use(express.json());
app.use(morgan("tiny"));

const tourrouter = require("./route/tourRouter");
const userrouter = require("./route/userRouter");
const reviewrouter = require("./route/reviewRoute")

// Utilizing the app
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
}
app.use(helmet());

app.use((req, res, next) => {
  console.log(req.headers);
  next();
});

/**
 *  These method blocks the user if does not provide app key
 */
if (!config.get("APP_KEY")) {
  console.error("SERVER FATAL ERROR!!! APP_KEY is not defined");
  process.exit(1);
}

//middleware
app.use("/api/tour", tourrouter);
app.use("/api/user", userrouter);
app.use("/api/review", reviewrouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //     status: "Fail",
  //     message: `Can't find ${req.originalUrl} on this server`
  // })
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'Fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalHandleError);

module.exports = app;
