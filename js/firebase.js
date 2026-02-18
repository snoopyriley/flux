
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyDcLRsZN_9Nry-94m7XvhqffNW_KJcYZwI",
authDomain: "fluxbyriley.firebaseapp.com",
projectId: "fluxbyriley",
storageBucket: "fluxbyriley.firebasestorage.app",
messagingSenderId: "148508659841",
appId: "1:148508659841:web:4c4b96abf8f82177c5fd80",
measurementId: "G-LEKGR9TZRD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── REGISTER ──
window.handleRegister = async () => {
const first    = document.getElementById('reg-first').value.trim();
const last     = document.getElementById('reg-last').value.trim();
const email    = document.getElementById('reg-email').value.trim();
const password = document.getElementById('reg-password').value;
const terms    = document.getElementById('terms-checkbox').classList.contains('checked');

if (!first)             { showError('err-first', 'reg-first'); return; }
if (!isValidEmail(email)) { showError('err-email', 'reg-email'); return; }
if (password.length < 8)  { showError('err-password', 'reg-password'); return; }
if (!terms)             { alert('Please agree to the terms.'); return; }

const btn = document.getElementById('reg-submit');
btn.innerHTML = '<div class="spinner"></div>';
btn.disabled = true;

try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${first} ${last}`.trim() });
    showSuccess();
} catch (e) {
    btn.innerHTML = 'Create My Account';
    btn.disabled = false;
    handleFirebaseError(e);
}
};

// ── LOGIN ──
window.handleLogin = async () => {
const email    = document.getElementById('login-email').value.trim();
const password = document.getElementById('login-password').value;

if (!isValidEmail(email)) { showError('err-login-email', 'login-email'); return; }
if (!password)            { showError('err-login-password', 'login-password'); return; }

const btn = document.getElementById('login-submit');
btn.innerHTML = '<div class="spinner"></div>';
btn.disabled = true;

try {
    await signInWithEmailAndPassword(auth, email, password);
    showSuccess();
} catch (e) {
    btn.innerHTML = 'Sign In';
    btn.disabled = false;
    handleFirebaseError(e);
}
};

// ── GOOGLE ──
window.handleGoogleSignIn = async () => {
try {
    await signInWithPopup(auth, googleProvider);
    showSuccess();
} catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') handleFirebaseError(e);
}
};

// ── SIGN OUT ──
window.handleSignOut = async () => {
await signOut(auth);
};

// ── AUTH STATE — updates the nav when logged in/out ──
onAuthStateChanged(auth, (user) => {
const navActions = document.querySelector('.nav-actions');
if (user) {
    const name = user.displayName || user.email;
    navActions.innerHTML = `
    <span style="font-size:13px;color:var(--text-muted)">Hey, ${name.split(' ')[0]} ⚡</span>
    <button class="btn-ghost" onclick="handleSignOut()">Sign Out</button>
    `;
} else {
    navActions.innerHTML = `
    <button class="btn-ghost" onclick="openModal('login')">Sign In</button>
    <button class="btn-primary" onclick="openModal('register')">Get Early Access</button>
    `;
}
});

// ── ERROR HANDLER ──
function handleFirebaseError(e) {
const messages = {
    'auth/email-already-in-use': ['err-email', 'reg-email', 'Email already in use.'],
    'auth/invalid-email':        ['err-email', 'reg-email', 'Invalid email address.'],
    'auth/weak-password':        ['err-password', 'reg-password', 'Password is too weak.'],
    'auth/invalid-credential':   ['err-login-password', 'login-password', 'Incorrect email or password.'],
    'auth/too-many-requests':    [null, null, null],
};
const m = messages[e.code];
if (m && m[0]) {
    document.getElementById(m[0]).textContent = m[2];
    showError(m[0], m[1]);
} else if (e.code === 'auth/too-many-requests') {
    alert('Too many attempts. Please try again later.');
} else {
    alert(e.message);
}
}