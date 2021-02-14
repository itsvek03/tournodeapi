const reviewController = require('../controller/reviewController')
const authController = require('../controller/authController')
const express = require('express')
const reviewrouter = express.Router({ mergeParams: true });

reviewrouter
    .route('/')
    .get(reviewController.getReview)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.postReview
    )

module.exports = reviewrouter



