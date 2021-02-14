const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//Creating a schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    unique: [true, "Email is already present"],
    required: [true, "Email is required"],
    lowercase: true,
    validate: [validator.isEmail, "Write proper email address"],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
  },
  confirmpass: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      // These function only work on save and create that is insertion time not in update
      validator: function (e) {
        return e === this.password;
      },
      message: "Password are not the same",
    },
  },

  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordTokenExpires: {
    type: Date,
  },

  active: {
    type: Boolean,
    default: true,
  },
});

// // 1  UserSchema password Changed At
// UserSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) {
//     return next();
//   }
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// 2 Dont show the user whose id 's active is to false
// It means it deactivate the account
UserSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

// // 3 Bcrypting the password before saving into the database
// UserSchema.pre("save", async function (next) {
//   // only run the function if password are actually modified
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   // These will delete the confirmpass field in the database
//   this.confirmpass = undefined;
//   next();
// });

// 4 Comparing the Password
UserSchema.methods.confirmpassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};

// 5 if PAssword Change after certain time by the user
UserSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimed = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTimed;
  }

  // if user does not change the password
  return false;
};

// 6 Reset token of forgot Password
UserSchema.methods.resetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(
    {
      resetToken,
    },
    this.passwordResetToken
  );

  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Creating a model
const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
