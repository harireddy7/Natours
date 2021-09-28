const Tour = require('../models/tour');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    // Get data from db
    const tours = await Tour.find();

    // build template
    // render that template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'Tour Name'
    })
}