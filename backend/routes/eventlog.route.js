const express = require("express");
const app = express();
const eventlogRoute = express.Router();

let Eventlog = require("../database/model/eventlog");

eventlogRoute.route("/").get((req, res) => {
  Eventlog.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

eventlogRoute.route("/event-log").post((res, req, next) => {
  Eventlog.create(req.body, (error, logResponse) => {
    if (error) {
      return next(error);
    }
    res.json(logResponse);
  });
});

module.exports = eventlogRoute;
