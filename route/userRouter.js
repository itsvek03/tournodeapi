const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
const userRouter = express.Router();

userRouter
    .route('/signup')
    .post(authController.signUp);

userRouter
    .route('/login')
    .post(authController.Login)

userRouter
    .route('/forgotPassword')
    .post(authController.forgotPassword)

userRouter
    .route('/resetPassword/:token')
    .patch(authController.resetPassword)

userRouter
    .route('/updatePasswordMy')
    .patch(authController.protect, authController.updatePassword)

userRouter.patch('/updateMe', authController.protect, userController.updateMe);

userRouter.delete('/deleteMe', authController.protect, userController.deleteMe);

userRouter
    .route('/')
    .get(userController.getAllUsers)
//     .post(postUser)

// userRouter
//     .route('/api/user/:id')
//     .get(getUsersByid)
//     .patch(patchUsers)
//     .delete(deleteUser)






module.exports = userRouter;