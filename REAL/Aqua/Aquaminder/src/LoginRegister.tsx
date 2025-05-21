import React, { useState, useContext } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { ToastContext } from './components/ui/toast';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const toastCtx = useContext(ToastContext);

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
      toastCtx?.showToast({
        title: 'Email tidak boleh kosong!',
        variant: 'error',
      });
      return;
    }
    if (!isValidEmail(email)) {
      toastCtx?.showToast({
        title: 'Harap masukkan email yang valid!',
        variant: 'error',
      });
      return;
    }
    if (!password) {
      toastCtx?.showToast({
        title: 'Password tidak boleh kosong!',
        variant: 'error',
      });
      return;
    }
    // Supabase Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      toastCtx?.showToast({
        title: 'Login gagal',
        description: error?.message || 'Akun tidak ditemukan',
        variant: 'error',
      });
      return;
    }
    toastCtx?.showToast({
      title: 'Login berhasil!',
      description: 'Selamat datang',
      variant: 'success',
    });
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
      toastCtx?.showToast({
        title: 'Nama lengkap tidak boleh kosong!',
        variant: 'error',
      });
      return;
    }
    if (!email) {
      toastCtx?.showToast({
        title: 'Email tidak boleh kosong!',
        variant: 'error',
      });
      return;
    }
    if (!isValidEmail(email)) {
      toastCtx?.showToast({
        title: 'Harap masukkan email yang valid!',
        variant: 'error',
      });
      return;
    }
    if (!password) {
      toastCtx?.showToast({
        title: 'Password tidak boleh kosong!',
        variant: 'error',
      });
      return;
    }
    if (!isStrongPassword(password)) {
      toastCtx?.showToast({
        title: 'Password lemah!',
        description: 'Password harus memiliki minimal 8 karakter, mengandung setidaknya 1 angka, dan 1 karakter spesial!',
        variant: 'error',
      });
      return;
    }
    if (password !== confirmPassword) {
      toastCtx?.showToast({
        title: 'Password tidak sesuai!',
        description: 'Password dan Ulangi Password tidak sesuai!',
        variant: 'error',
      });
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
      toastCtx?.showToast({
        title: 'Registrasi gagal',
        description: error.message,
        variant: 'error',
      });
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
        toastCtx?.showToast({
          title: 'Gagal menambahkan ke tabel users',
          description: userInsertError.message,
          variant: 'error',
        });
        return;
      }
    }
    toastCtx?.showToast({
      title: 'Registrasi berhasil!',
      description: 'Silakan cek email Anda untuk verifikasi, lalu login dengan akun Anda.',
      variant: 'success',
    });
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