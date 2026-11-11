/* ==========================================================================
   Authentication simulation (Sign Up / Log In) using localStorage.
   There is no backend, so users are stored in the browser under
   STORAGE_KEYS.users and the logged-in email under STORAGE_KEYS.session.
   NOTE: storing passwords like this is only acceptable for a student
   simulation — a real site must hash passwords on a server.
   ========================================================================== */

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// Already logged in? Go straight to the profile.
if (getCurrentUser() && (signupForm || loginForm)) {
  window.location.replace("profile.html");
}

/* ---------- Sign Up ---------- */
if (signupForm) {
  const validateSignup = setupValidation(signupForm);
  const passwordInput = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("strength");
  const rulesList = document.getElementById("passRules");

  // Live password checklist + strength meter
  passwordInput.addEventListener("input", () => {
    const checks = getPasswordChecks(passwordInput.value);
    checks.forEach((check) => {
      rulesList.querySelector(`[data-rule="${check.key}"]`).classList.toggle("ok", check.ok);
    });
    const passed = checks.filter((check) => check.ok).length;
    strengthBar.dataset.level = passwordInput.value ? Math.max(1, passed - 1) : 0;
  });

  // When the password changes, re-check the "confirm" field too
  passwordInput.addEventListener("blur", () => {
    const confirm = document.getElementById("signupConfirm");
    if (confirm.value) validateField(confirm);
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormAlert(signupForm);
    if (!validateSignup()) return;

    const email = signupForm.email.value.trim().toLowerCase();
    const users = getUsers();

    if (users.some((user) => user.email === email)) {
      const emailInput = signupForm.email;
      setFieldError(emailInput, 'This email is already registered. <a href="login.html">Log in instead?</a>');
      emailInput.focus();
      return;
    }

    const newUser = {
      name: signupForm.fullName.value.trim(),
      email,
      phone: signupForm.phone.value.trim(),
      password: signupForm.password.value,
      createdAt: new Date().toISOString(),
      orders: []
    };

    users.push(newUser);
    saveUsers(users);
    writeStorage(STORAGE_KEYS.session, email); // log the user in right away

    showFormAlert(signupForm, "Account created! Redirecting to your profile…", "success");
    setTimeout(() => { window.location.href = "profile.html"; }, 1000);
  });
}

/* ---------- Log In ---------- */
if (loginForm) {
  const validateLogin = setupValidation(loginForm);

  // Pre-fill the email if the user chose "remember me" last time
  const rememberedEmail = readStorage("artnova-remember", "");
  if (rememberedEmail) {
    loginForm.email.value = rememberedEmail;
    loginForm.remember.checked = true;
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormAlert(loginForm);
    if (!validateLogin()) return;

    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;
    const user = getUsers().find((item) => item.email === email);

    if (!user) {
      showFormAlert(loginForm, 'No account found with this email. <a href="signup.html">Create one?</a>');
      return;
    }
    if (user.password !== password) {
      showFormAlert(loginForm, "Incorrect password. Please try again.");
      loginForm.password.value = "";
      loginForm.password.focus();
      return;
    }

    writeStorage("artnova-remember", loginForm.remember.checked ? email : "");
    writeStorage(STORAGE_KEYS.session, email);
    showFormAlert(loginForm, `Welcome back, ${escapeHTML(user.name.split(" ")[0])}! Redirecting…`, "success");
    setTimeout(() => { window.location.href = "profile.html"; }, 800);
  });
}
