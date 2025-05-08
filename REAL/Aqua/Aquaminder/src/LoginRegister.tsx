import React, { useState } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const toggleTabs = (tab: 'login' | 'register') => {
    setActiveTab(tab);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!email) {
      alert('Email tidak boleh kosong!');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Harap masukkan email yang valid!');
      return;
    }

    if (!password) {
      alert('Password tidak boleh kosong!');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    const validAccount = accounts.find((account: { email: string; password: string }) =>
      account.email === email && account.password === password
    );

    if (validAccount) {
      alert(`Login berhasil! Selamat datang, ${validAccount.name}.`);
      navigate('/homepage'); // Redirect to homepage
    } else {
      alert('Login gagal! Email atau password salah.');
    }
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    if (!name) {
      alert('Nama lengkap tidak boleh kosong!');
      return;
    }

    if (!email) {
      alert('Email tidak boleh kosong!');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Harap masukkan email yang valid!');
      return;
    }

    if (!password) {
      alert('Password tidak boleh kosong!');
      return;
    }

    if (!isStrongPassword(password)) {
      alert('Password harus memiliki minimal 8 karakter, mengandung setidaknya 1 angka, dan 1 karakter spesial!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Password dan Ulangi Password tidak sesuai!');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const accountExists = accounts.find((account: { email: string }) => account.email === email);

    if (accountExists) {
      alert('Email sudah terdaftar! Gunakan email lain.');
      return;
    }

    accounts.push({ name, email, password });
    localStorage.setItem('accounts', JSON.stringify(accounts));

    alert('Registrasi berhasil! Silakan login dengan akun Anda.');
    toggleTabs('login');
  };

  return (
    <div className="container">
      <h1>Welcome to <span className="brand">Aquaminder</span></h1>
      <div className="form-container">
        <div className="tab">
          <button
            id="loginTab"
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => toggleTabs('login')}
          >
            Login
          </button>
          <button
            id="registerTab"
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => toggleTabs('register')}
          >
            Register
          </button>
        </div>
        {activeTab === 'login' && (
          <form
            id="loginForm"
            className="form active"
            onSubmit={handleLogin}
          >
            <input name="email" type="email" placeholder="Masukkan Email" required />
            <input name="password" type="password" placeholder="Masukkan Password" required />
            <button type="submit" className="btn">Login</button>
          </form>
        )}
        {activeTab === 'register' && (
          <form
            id="registerForm"
            className="form active"
            onSubmit={handleRegister}
          >
            <input name="name" type="text" placeholder="Nama Lengkap" required />
            <input name="email" type="email" placeholder="Masukkan Email" required />
            <input name="password" type="password" placeholder="Masukkan Password" required />
            <input name="confirmPassword" type="password" placeholder="Ulangi Password" required />
            <button type="submit" className="btn">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;