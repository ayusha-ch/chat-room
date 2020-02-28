const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let History = new Schema(
  {
    sender: {
      type: String
    },
    receiver: {
      type: String
    },
    date: {
      type: Date
    },

    chat_room: {
      type: String
    }
  },
  {
    collection: "history"
  }
);

module.exports = mongoose.model("History", History);
