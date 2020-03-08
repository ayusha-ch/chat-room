const express = require("express");
const app = express();
const historyRoute = express.Router();

let History = require("../model/history");

historyRoute.route("/history").get((req, res, next) => {
  History.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

historyRoute.route("/roomhistory").post((req, res, next) => {
  History.findOne({ chat_room: req.body.roomname }, (err, doc) => {
    if (err) {
      return next(err);
    }
    res.json(doc);
  });
});

historyRoute.route("/addhistory").post((req, res, next) => {
  History.create(req.body, (error, historyDoc) => {
    if (error) {
      return next(error);
    }
    res.json(historyDoc);
  });
});

module.exports = historyRoute;
