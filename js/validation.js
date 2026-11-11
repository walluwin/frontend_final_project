/* ==========================================================================
   Form validation — written by hand in JavaScript.
   Forms use the `novalidate` attribute and NO HTML validation attributes
   (required, pattern, minlength, type="email"…). All checks live here and
   errors are shown under each field, not in alerts.
   ========================================================================== */

const PATTERNS = {
  // something@something.domain (domain part at least 2 letters)
  email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
  // Latin or Cyrillic (incl. Kazakh) letters, spaces, hyphens, apostrophes
  name: /^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі' -]+$/,
  // Kazakhstan mobile: +7 7XX XXX XX XX or 8 7XX XXX XX XX (spaces, dashes, brackets allowed)
  phone: /^(\+7|8)7\d{9}$/
};

/* Each rule returns an error message, or "" when the value is fine */
const RULES = {
  required(value, label) {
    return value.trim() === "" ? `Please enter your ${label}.` : "";
  },

  name(value) {
    const trimmed = value.trim();
    if (trimmed.length < 2) return "Name must be at least 2 characters long.";
    if (trimmed.length > 50) return "Name must be 50 characters or fewer.";
    if (!PATTERNS.name.test(trimmed)) return "Name can contain only letters, spaces and hyphens.";
    return "";
  },

  email(value) {
    return PATTERNS.email.test(value.trim()) ? "" : "Enter a valid email, for example name@mail.com.";
  },

  phone(value) {
    const digitsOnly = value.replace(/[\s()-]/g, "");
    return PATTERNS.phone.test(digitsOnly) ? "" : "Enter a valid phone number, for example +7 777 123 45 67.";
  },

  password(value) {
    const missing = getPasswordChecks(value).filter((check) => !check.ok).map((check) => check.text);
    return missing.length ? `Password needs: ${missing.join(", ")}.` : "";
  },

  message(value) {
    return value.trim().length < 10 ? "Message should be at least 10 characters long." : "";
  },

  select(value, label) {
    return value === "" ? `Please choose a ${label}.` : "";
  },

  checkbox(checked) {
    return checked ? "" : "You need to accept the terms to continue.";
  }
};

/* Password complexity checks, also used for the live checklist on Sign Up */
function getPasswordChecks(password) {
  return [
    { key: "length", text: "at least 8 characters", ok: password.length >= 8 },
    { key: "upper", text: "an uppercase letter", ok: /[A-Z]/.test(password) },
    { key: "lower", text: "a lowercase letter", ok: /[a-z]/.test(password) },
    { key: "number", text: "a number", ok: /\d/.test(password) },
    { key: "special", text: "a special character", ok: /[^A-Za-z0-9]/.test(password) }
  ];
}

/* ---------- Showing / clearing errors ---------- */
function setFieldError(input, message) {
  const group = input.closest(".form-group");
  const errorBox = group.querySelector(".error-msg");
  group.classList.toggle("has-error", Boolean(message));
  group.classList.toggle("is-valid", !message);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorBox) errorBox.innerHTML = message ? `<i class="bi bi-exclamation-circle"></i> ${message}` : "";
}

function clearFieldState(input) {
  const group = input.closest(".form-group");
  group.classList.remove("has-error", "is-valid");
  input.removeAttribute("aria-invalid");
}

/*
 * Validates one field. The rules to apply are listed in its data-validate
 * attribute, e.g. data-validate="required email". data-label is used in
 * messages ("Please enter your email.").
 * data-match="otherFieldId" checks that two fields are equal (confirm password).
 */
function validateField(input) {
  const rules = (input.dataset.validate || "").split(" ").filter(Boolean);
  const label = input.dataset.label || "value";
  const value = input.type === "checkbox" ? input.checked : input.value;
  let message = "";

  for (const rule of rules) {
    if (rule === "required" && input.type !== "checkbox") message = RULES.required(value, label);
    else if (rule === "checkbox") message = RULES.checkbox(value);
    else if (rule === "select") message = RULES.select(value, label);
    else if (RULES[rule]) message = RULES[rule](value, label);
    if (message) break;
  }

  if (!message && input.dataset.match) {
    const other = document.getElementById(input.dataset.match);
    if (other && other.value !== input.value) message = "Passwords do not match.";
  }

  setFieldError(input, message);
  return !message;
}

/*
 * Connects live validation to a form:
 *  - validates a field when the user leaves it (blur / change)
 *  - re-validates while typing once the field has shown an error
 * Returns a function that validates the whole form and focuses the first error.
 */
function setupValidation(form) {
  const fields = form.querySelectorAll("[data-validate]");

  fields.forEach((field) => {
    const eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "blur";
    field.addEventListener(eventName, () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-group").classList.contains("has-error")) validateField(field);
    });
  });

  return function validateForm() {
    let firstInvalid = null;
    fields.forEach((field) => {
      const ok = validateField(field);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };
}

/* Resets a form and removes red/green states */
function resetForm(form) {
  form.reset();
  form.querySelectorAll("[data-validate]").forEach(clearFieldState);
}

/* Shows a message box at the top of a form (success or error) */
function showFormAlert(form, message, type = "error") {
  const alert = form.querySelector(".form-alert");
  if (!alert) return;
  const icon = type === "error" ? "bi-exclamation-triangle" : "bi-check-circle";
  alert.className = `form-alert show ${type}`;
  alert.innerHTML = `<i class="bi ${icon}"></i><span>${message}</span>`;
}

function hideFormAlert(form) {
  const alert = form.querySelector(".form-alert");
  if (alert) alert.className = "form-alert";
}
