const Tour = require('../models/tour');
const User = require('../models/user');
const Booking = require('../models/booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // Get data from db
  const tours = await Tour.find();

  // build template
  // render that template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError(`There's no tour with that name!`, 404))
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};


exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map(b => b.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } })

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
})

exports.updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true });
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  })
});