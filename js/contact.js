/* ==========================================================================
   Contact page: validated message form. Messages are kept in localStorage
   (there is no server) and a live character counter helps the user.
   ========================================================================== */

const contactForm = document.getElementById("contactForm");
const validateContact = setupValidation(contactForm);
const messageInput = document.getElementById("contactMessage");
const charCount = document.getElementById("charCount");
const MESSAGE_LIMIT = 500;

// Pre-fill name/email/phone for logged-in users
const currentUser = getCurrentUser();
if (currentUser) {
  contactForm.fullName.value = currentUser.name;
  contactForm.email.value = currentUser.email;
  contactForm.phone.value = currentUser.phone;
}

// Live character counter; text longer than the limit is cut by JavaScript
messageInput.addEventListener("input", () => {
  if (messageInput.value.length > MESSAGE_LIMIT) {
    messageInput.value = messageInput.value.slice(0, MESSAGE_LIMIT);
  }
  charCount.textContent = `${messageInput.value.length} / ${MESSAGE_LIMIT}`;
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hideFormAlert(contactForm);
  if (!validateContact()) return;

  const messages = readStorage("artnova-messages", []);
  messages.push({
    name: contactForm.fullName.value.trim(),
    email: contactForm.email.value.trim(),
    phone: contactForm.phone.value.trim(),
    topic: contactForm.topic.value,
    message: messageInput.value.trim(),
    sentAt: new Date().toISOString()
  });
  writeStorage("artnova-messages", messages);

  const firstName = escapeHTML(contactForm.fullName.value.trim().split(" ")[0]);
  resetForm(contactForm);
  charCount.textContent = `0 / ${MESSAGE_LIMIT}`;
  showFormAlert(contactForm, `Thank you, ${firstName}! We will reply within 24 hours.`, "success");
});
