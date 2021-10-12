import axios from 'axios';

export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51JjQQnSGRpo6XkVHFV3yxc0S6YxWqoLYiUsDzjmYpKPiLjbNL14TBqsjy4S0pJLTV8Unn1T0vgUfOejCiB93EJZo004PBXJkwR');
    try {
        // get session from /checkout-session
        const response = await axios.get(`/api/v1/booking/checkout-session/${tourId}`);
        if(response.data.session) {
            document.querySelector('#book-tour').textContent = 'Book tour now!'
        }
    
        // create checkout from stripe & charge from card
        await stripe.redirectToCheckout({
            sessionId: response.data.session.id
        });
    } catch (err) {
        console.log(err);
    }
}