const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); // http param pollution
const cookieParser = require('cookie-parser');
const compression = require('compression');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const tourRouter = require('./routes/tours');
const reviewRouter = require('./routes/reviews');
const viewRouter = require('./routes/view');
const bookingRouter = require('./routes/booking');

const globalErrorHandler = require('./controllers/errors');
const AppError = require('./utils/appError');

const app = express();

app.enable('trust proxy');

// SET VIEW ENGINE TO PUG
app.set('view engine', 'pug');

// SET VIEWS DIRECTORY
app.set('views', path.join(__dirname, 'views'));

// SERVE STATIC FILES FROM A FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// 1. GLOBAL Middlewares

// set SECURITY HTTP headers
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'", 'data:', 'blob:', 'ws:', 'https://*.cloudflare.com', 'https://js.stripe.com', 'https://*.mapbox.com'],
			fontSrc: ["'self'", 'https:', 'data:'],
			styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://*.mapbox.com'],
		},
	})
);

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// LIMIT API REQUETS
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, // allow 100 requests in 1 hr from same IP
	message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body Parser - read data from body into req.body
// limits req body to 10kb
app.use(express.json({ limit: '10kb' }));

// parser to encode data from url
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// parses data from cookies
app.use(cookieParser());

// DATA SANITIZATION against NoSQL query injection
// filters out all the mongoDB operators ($, .) from req.body, req.params
app.use(mongoSanitize());

// DATA SANITIZATION against XSS
// cleans user input from malacious html code
app.use(xss());

// Prevent HTTP param pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsAverage',
			'ratingsQuantity',
			'maxGroupSize',
			'price',
		],
	})
);

// Custom Logger
// app.use((req, res, next) => {
//   console.log(
//     `${req.method} request of URL ${req.url} from ${
//       req.headers.host
//     } at ${new Date().toDateString()} - ${new Date().toTimeString()}`
//   );
//   console.log(req.cookies);
//   next();
// });

// app.get('/', (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         message: 'response from natours api'
//     })
// })

// COMPRESS RESPONSES
app.use(compression());

// 2. ROUTERS

// RENDER BASE PUG TEMPLATE
app.use('/', viewRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
	// res.status(404).json({
	//     status: 'failure',
	//     message: `Can't find ${req.method} ${req.url} on the server`
	// })

	// const err = new Error(`Can't find ${req.method} ${req.url} on the server`)
	// err.status = 'failure'
	// err.statusCode = 404
	// // passing any data to next() is treated as an error by express & sent to gobal error middleware
	// next(err)

	next(new AppError(`Can't find ${req.method} ${req.url} on the server`, 404));
});

// Global Error Middleware
app.use(globalErrorHandler);

module.exports = app;
