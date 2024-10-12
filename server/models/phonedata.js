const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true }  // Storing phone numbers as strings
});

module.exports = mongoose.model("phonedata", phoneSchema);
