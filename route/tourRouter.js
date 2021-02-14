const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController')
const tourrouter = express.Router();
const reviewrouter = require('../route/reviewRoute')


//tourrouter.param('id',tourController.checkId);

tourrouter
    .route('/getStats')
    .get(tourController.getTourStats)


tourrouter
    .route('/getMonth/:year')
    .get(tourController.getPlan)

tourrouter
    .route('/top5cheap')
    .get(tourController.aliasTopTours, tourController.getAlltours)

tourrouter
    .route('/')
    .get(authController.protect, tourController.getAlltours)
    .post(tourController.posttour)

tourrouter
    .route('/:id')
    .get(tourController.gettoursByid)
    .patch(tourController.patchtour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.delettour
    )


// Nested Route

//For creating the reviews
//the user id comes from the login and the tour comes in from the tour
//POST/tour/868(tourid)/reviews
// tourrouter
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.postReview
//     )

// These router can be written as in mounting way
tourrouter.use('/:tourId/review', reviewrouter)


// GET tour review by id
//GET/tour/686(tourid)/reviews/798098(id)
//GET/tour/686(tourid)/reviews


module.exports = tourrouter;