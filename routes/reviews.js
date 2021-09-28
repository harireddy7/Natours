const express = require('express');
const { protect, restrictTo } = require('../controllers/auth');
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserForReview, getReview } = require('../controllers/reviews');

const router = express.Router({ mergeParams: true }) // mergeParams provides params in the nested route even if that path is not in current router

// Only logged in users can post reviews
router.use(protect);

router.route('/')
    .get(getAllReviews)
    .post(
        restrictTo('customer'),
        setTourUserForReview,
        createReview
    );

// only admin & customer can provide/update/delete reviews
router.route('/:id')
    .get(getReview)
    .patch(restrictTo('customer', 'admin'), updateReview)
    .delete(restrictTo('customer', 'admin'), deleteReview);

module.exports = router;