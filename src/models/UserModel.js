const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    email: String,
    password: String,
    username: String,
    country: String,
    role: [{type: mongoose.Types.ObjectId, ref: "Role"}]
});

const User = mongoose.model("User", UserSchema);

module.exports = {User};