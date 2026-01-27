import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  hashed_password: {
    type: String,
    required: "Password is required",
  },
  salt: String,
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
});
UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    //this.hashed_password = password;
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });
UserSchema.path("hashed_password").validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);
UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return bcrypt.hashSync(password, this.salt);
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    // Use bcrypt to generate a cryptographically secure salt
    return bcrypt.genSaltSync(10);
  },
};
  
export default mongoose.model("User", UserSchema);
