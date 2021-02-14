const { promisify } = require("util");
const UserModel = require("../model/userModel");
let jwt = require("jsonwebtoken");
const config = require("config");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const SendEmail = require("../utils/email");
const crypto = require("crypto");

const signinToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    config.get("APP_KEY"),
    {
      expiresIn: config.get("TOKEN_EXPIRES"),
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signinToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newuser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpass: req.body.confirmpass,
    role: req.body.role,
  });

  let token = signinToken(newuser._id);
  createSendToken(newuser, 201, res);
  // res.status(200).json({
  //     status: "Successfully Inserted . Congrats you are signup successfully",
  //     tokengen: token,
  //     data: {
  //         newuser
  //     }
  // })
});

// Step 1: check the user email and password

// Step 2: Check the user

//Step 3 : Everything is clear to login

exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Step 1:
  if (!email || !password) {
    return next(new AppError("Please insert both email and password", 400));
  }

  // Step 2
  const user = await UserModel.findOne({
    email,
  }).select("+password");
  if (!user || !(await user.confirmpassword(password, user.password))) {
    return next(new AppError("Please insert proper email Id and password"));
  }
  // Everything is okay
  createSendToken(user, 200, res);
  // const token = signinToken(user._id);
  // res.status(200).json({
  //     status: "Token generated",
  //     token: token,
  //     message: "Login Done"
  // })
});

// Protected route
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Getting of token and check its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //console.log(token);

  if (!token) {
    return next(
      new AppError(
        "You are not log in the website.Please login first because token is not present",
        401
      )
    );
  }

  // Verifying the token
  const decoded = await promisify(jwt.verify)(token, config.get("APP_KEY"));
  console.log(decoded);

  //Verify the user if the id is deleted
  const freshUser = await UserModel.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // Check if user has changed the password after the token has expired
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently change Password .. Please log in", 401)
    );
  }
  // iat means issued at
  //res.send(decoded);
  // Enter body of the user
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Check the email is present or not
  const email = await UserModel.findOne({
    email: req.body.email,
  });
  if (!email) {
    return next(new AppError("Invalid Email ID", 403));
  }

  // 2) Generate Reset Token
  const resetToke = email.resetToken();
  await email.save({
    validateBeforeSave: false,
  });

  // Send the email to users
  const restURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToke}`;
  const message = `Forgot Password ?${restURL}`;
  try {
    await SendEmail({
      email: email.email,
      subject: "Your password token will expires in 10 min",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    email.passwordResetToken = "undefined";
    email.passwordTokenExpires = "undefined";
    await email.save({
      validateBeforeSave: false,
    });
    return next(new AppError("There was some error!!!!!!!!!", 500));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user bsed on the token
  const createHas = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetToken: createHas,
    passwordTokenExpires: {
      $gt: Date.now(),
    },
  });

  //2) If token has not expired and there is user set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.confirmpass = req.body.confirmpass;
  user.passwordResetToken = undefined;
  user.passwordTokenExpires = undefined;
  await user.save();
  //3) Update the changePasswordAt

  //4) Log the user in send JWT

  createSendToken(user, 200, res);
  // const token = signinToken(user._id);
  // res.status(200).json({
  //     status: "Token generated",
  //     token: token,
  //     message: "Login Done"
  // })
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  let token;
  // Get user from collection
  const user = await UserModel.findById(req.user.id).select("+password");
  //Check if posted current password is correct
  if (!(await user.confirmpassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  //If so update password
  user.password = req.body.password;
  user.confirmpass = req.body.confirmpass;
  await user.save();
  //Log user in ,send JWT
  createSendToken(user, 200, res);
  // user.signinToken();
  // res.status(200).json({
  //     status: "Successfully",
  //     token: token
  // })
});
