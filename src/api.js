// src/api.js
const API_URL = 'https://api.goodfaceteam.ru';

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, device_id: 'gudex_web' })
    });
    return res.json();
  },

  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_URL}/forgot_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  }
};