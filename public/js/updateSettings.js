import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async ({ type, data }) => {
	const apiPath =
		type === 'password' ? 'auth/updatepassword' : 'users/updateme';
	try {
		const resp = await axios({
			method: 'PATCH',
			url: `/api/v1/${apiPath}`,
			data,
		});
		// console.log(resp.data);

		if (resp.data.status === 'success') {
			if (type === 'password') {
				showAlert('success', 'Password updated successfully!', 800);

				// RESET FORM FIELDS AFTER PASSWORD UPDATED
				document.getElementById('password-current').value = '';
				document.getElementById('password').value = '';
				document.getElementById('password-confirm').value = '';

				document.getElementById('save-password-btn').textContent =
					'Save password';
			} else if (type === 'user-data') {
				showAlert('success', 'User data updated successfully!', 800);
				setTimeout(() => location.reload(true), 1000);
			}
		}
	} catch (err) {
		// alert(err.response.data.message);
		showAlert('error', err.response.data.message);
		if (type === 'password') {
			document.getElementById('save-password-btn').textContent =
				'Save password';
		}
	}
};
