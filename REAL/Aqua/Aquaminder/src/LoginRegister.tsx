import React, { useState } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import Background from './components/background';

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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
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
    // Supabase Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      alert('Login gagal: ' + (error?.message || 'Akun tidak ditemukan'));
      return;
    }
    alert('Login berhasil! Selamat datang');
    // Pass the session and user info to homepage
    navigate('/homepage', { state: { session: data.session, user: data.user } });
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
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
    // Supabase Auth registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      alert(`Registrasi gagal: ${error.message}`);
      return;
    }
    // Insert into users table if signUp is successful and user exists
    if (data && data.user) {
      const { error: userInsertError } = await supabase
        .from('users')
        .insert([
          {
            user_id: data.user.id, // Auth UUID
            username: name,
            role: 0, // default role, change as needed
          },
        ]);
      if (userInsertError) {
        alert(`Gagal menambahkan ke tabel users: ${userInsertError.message}`);
        return;
      }
    }
    alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi, lalu login dengan akun Anda.');
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