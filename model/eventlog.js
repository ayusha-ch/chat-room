const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Eventlog = new Schema(
  {
    type: {
      type: String
    },
    user: {
      type: String
    },
    date: {
      type: Date
    }
  },
  {
    collection: "eventlog"
  }
);

module.exports = mongoose.model("Eventlog", Eventlog);
