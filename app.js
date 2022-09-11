const express = require("express");
const cors = require("cors");
const errorController = require("./controllers/errorController");
const { errorCodes } = require("./utils/constants");
const AppError = require("./utils/appError");
const morgan = require("morgan");

const app = express();
app.use(express.json());

// app.use(
//   limiter({
//     windowMs: 1 * 60 * 1000, //750 per min requests allowed from one IP address
//     max: 750,
//     message: {
//       code: 429,
//       message: "Too many requests made, please try again later",
//     },
//   })
// );

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

morgan.token('req-headers', function(req,res){
  return JSON.stringify(req.headers)
 })
 
 process.env.NODE_ENV != 'production' && app.use(morgan(':method :url :status :req-headers'));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

//all invalid urls handled here
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404,
      errorCodes.INVALID_URL
    )
  );
});

app.use(errorController);

module.exports = app;
