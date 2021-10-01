import axios from 'axios';
import { showAlert } from './alert';

export const loginUser = async (email, password) => {
  try {
    const resp = await axios({
      method: 'POST',
      url: 'http://localhost:8080/api/v1/auth/login',
      data: {
        email,
        password,
      },
    });
    // console.log(resp.data);

    if (resp.data.status === 'success') {
      showAlert('success', 'Logged in successfully!', 1000);

      window.setTimeout(() => {
        location.replace('/');
      }, 1500);
    }
  } catch (err) {
    // alert(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};
