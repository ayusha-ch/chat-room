const express = require("express");
const app = express();
const eventlogRoute = express.Router();

let Eventlog = require("../model/eventlog");

eventlogRoute.route("/").get((req, res) => {
    Eventlog.find((error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data);
        }
    });
});

eventlogRoute.route("/createlog").post((req, res, next) => {
    Eventlog.create(req.body, (error, logResponse) => {
        if (error) {
            return next(error);
        }
        res.json(logResponse);
    });
});

module.exports = eventlogRoute;
