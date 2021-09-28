const express = require('express');
const router = express.Router()

const { protect, restrictTo } = require('../controllers/auth');
const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTop5Routes,
    getTourStats,
    getMonthlyPlan,
    getToursWithinDistance,
    getDistances
} = require('../controllers/tours');
const reviewRouter = require('./reviews');


// REVIEWS
// GET /tour/:tourId/reviews => get all reviews of a tour
// POST /tour/:tourId/reviews => create a review for this tour
// GET /tour/:tourId/reviews/:reviewId => view particular review of a tour

router.use('/:tourId/reviews', reviewRouter);


// TOURS

// router.param('id', checkID)

// Alias route
router.route('/top-5-best-cheap').get(aliasTop5Routes, getAllTours);

// Aggregation route
router.route('/tour-stats').get(getTourStats)

router.route('/monthly-plan/:year')
    .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlong/unit/:unit').get(getToursWithinDistance);

router.route('/distances/:latlong/unit/:unit').get(getDistances)

router.route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
    .route('/:id')
    .get(getTour)
    .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;