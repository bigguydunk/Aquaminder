import React, { useState, useContext, useEffect } from 'react';
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
        let errorMsg = userInsertError.message;
        if (errorMsg && errorMsg.toLowerCase().includes('user_id')) {
          errorMsg = 'Akun ini sudah terdaftar!';
        }
        toastCtx?.showToast({
          title: errorMsg,
          description: "Silahkan login dengan akun Anda.",
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

  // Listen for session changes (including after Google OAuth)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        // Check if user exists in users table
        const { data: userRows, error: userQueryError } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', session.user.id);
        if (!userQueryError && (!userRows || userRows.length === 0)) {
          // Insert new user with Google display name
          const displayName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email;
          const { error: insertError } = await supabase.from('users').insert([
            {
              user_id: session.user.id,
              username: displayName,
              role: 0, // default role
            },
          ]);
          if (insertError) {
            // eslint-disable-next-line no-console
            console.error('Failed to insert Google user:', insertError.message);
          } else {
            // eslint-disable-next-line no-console
            console.log('Google user inserted to users table:', displayName);
          }
        }
        navigate('/homepage', { state: { session, user: session.user } });
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

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
            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
              <span style={{ color: '#888', fontSize: '0.9em', margin: '0 8px', whiteSpace: 'nowrap' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
            </div>
            <button
              type="button"
              className="btn google-btn"
              style={{ marginTop: '0', background: '#fff', color: '#333', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={async () => {
              try {
                const { data, error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: { redirectTo: window.location.origin },
                });
                if (error) {
                toastCtx?.showToast({
                  title: 'Login Google gagal',
                  description: error.message,
                  variant: 'error',
                });
                } else if (data && data.url) {
                toastCtx?.showToast({
                  title: 'Mengalihkan ke Google...',
                  description: 'Silakan lanjutkan login dengan akun Google Anda.',
                  variant: 'success',
                });
                }
              } catch (err: any) {
                toastCtx?.showToast({
                title: 'Login Google gagal',
                description: err?.message || 'Terjadi kesalahan saat login dengan Google.',
                variant: 'error',
                });
              }
              }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} style={{ background: 'transparent' }} />
              Sign in with Google
            </button>
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
            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
              <span style={{ color: '#888', fontSize: '0.9em', margin: '0 8px', whiteSpace: 'nowrap' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
            </div>
            <button
              type="button"
              className="btn google-btn"
              style={{ marginTop: '0', background: '#fff', color: '#333', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin },
                  });
                  if (error) {
                    toastCtx?.showToast({
                      title: 'Sign up Google gagal',
                      description: error.message,
                      variant: 'error',
                    });
                  } else if (data && data.url) {
                    toastCtx?.showToast({
                      title: 'Mengalihkan ke Google...',
                      description: 'Silakan lanjutkan sign up dengan akun Google Anda.',
                      variant: 'success',
                    });
                  }
                } catch (err: any) {
                  toastCtx?.showToast({
                    title: 'Sign up Google gagal',
                    description: err?.message || 'Terjadi kesalahan saat sign up dengan Google.',
                    variant: 'error',
                  });
                }
              }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} style={{ background: 'transparent' }} />
              Sign up with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;