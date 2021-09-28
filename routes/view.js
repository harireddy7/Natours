const express = require('express');
const { getOverview, getTour } = require('../controllers/views');

const router = express.Router();

// router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         title: 'Exciting tours for adventurous people',
//         tour: 'Forest Hiker',
//         user: 'Barry'
//     });
// })

router.get('/', getOverview)

router.get('/tour/:slug', getTour)

module.exports = router;