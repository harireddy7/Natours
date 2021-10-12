const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // create stripe checkout sesion
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    // create session as response
    res.status(200).json({
        status: 'success',
        session,
    })
});

// create booking doc to db once stripe success url is hit
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    
    // create booking doc to db
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0])
})

// UNSECURE way as booking params are in query params - anyone can book w/o paying!
/*
    stripe checkout success => success url with query params => 
    hit createBookingCheckout => store booking doc to db => redirect to success url w/o query params =>
    hit createBookingCheckout => redirect to home page
*/


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
