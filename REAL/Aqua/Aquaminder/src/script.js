// Toggle between Login and Register Tabs
document.getElementById('loginTab').addEventListener('click', function () {
    toggleTabs('login');
});

document.getElementById('registerTab').addEventListener('click', function () {
    toggleTabs('register');
});

function toggleTabs(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength validation function
function isStrongPassword(password) {
    // Password must be at least 8 characters long and contain at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
}

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.querySelector('#loginForm input[type="email"]').value.trim();
    const password = document.querySelector('#loginForm input[type="password"]').value;

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

    // Retrieve accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    // Check if account exists and password matches
    const validAccount = accounts.find(account => account.email === email && account.password === password);

    if (validAccount) {
        alert(`Login berhasil! Selamat datang, ${validAccount.name}. Anda akan diarahkan ke halaman utama.`);
        window.location.href = 'index.html'; // Redirect to index.html
    } else {
        alert('Login gagal! Email atau password salah.');
    }
});

// Handle Register Form Submission
document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.querySelector('#registerForm input[placeholder="Nama Lengkap"]').value.trim();
    const email = document.querySelector('#registerForm input[placeholder="Masukkan Email"]').value.trim();
    const password = document.querySelector('#registerForm input[placeholder="Masukkan Password"]').value;
    const confirmPassword = document.querySelector('#registerForm input[placeholder="Ulangi Password"]').value;

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

    // Save account to localStorage
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const accountExists = accounts.find(account => account.email === email);

    if (accountExists) {
        alert('Email sudah terdaftar! Gunakan email lain.');
        return;
    }

    accounts.push({ name, email, password });
    localStorage.setItem('accounts', JSON.stringify(accounts));

    alert('Registrasi berhasil! Silakan login dengan akun Anda.');
    toggleTabs('login'); // Pindahkan ke tab login setelah registrasi berhasil
});