const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
		this.from = `Natours <${process.env.EMAIL_FROM}>`;
	}

	generateTransport() {
		if (process.env.NODE_ENV === 'production') {
			// SendinBlue Email service
			return nodemailer.createTransport({
				service: 'SendinBlue',
				auth: {
					user: process.env.SENDINBLUE_USERNAME,
					pass: process.env.SENDINBLUE_PASSWORD,
				}
			})
		}
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	async send(template, subject) {
		//   Render hmt based pug template
		const html = pug.renderFile(
			`${__dirname}/../views/emails/${template}.pug`,
			{
				firstName: this.firstName,
				url: this.url,
				subject,
			}
		);

		// email options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText.convert(html),
		};

		//   create a transport and send mail
		await this.generateTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send('welcome', 'Welcome to Natours family!');
	}

	async sendResetPassword() {
		await this.send(
			'passwordReset',
			'Your password reset token (valid for only 10 minutes)!'
		);
	}
};
