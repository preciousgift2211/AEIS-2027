// AEIS 2027 landing page interactions
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  });
});

// Theme switch: dark is the default; the choice is saved in this browser.
const themeToggle = document.getElementById("themeToggle");
try {
  if (localStorage.getItem("aeis-theme") === "light") document.body.classList.add("light-theme");
} catch (error) { console.warn("Theme preference could not be loaded.", error); }

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  try {
    localStorage.setItem("aeis-theme", document.body.classList.contains("light-theme") ? "light" : "dark");
  } catch (error) { console.warn("Theme preference could not be saved.", error); }
});

// FAQ accordion
document.querySelectorAll(".faq-question").forEach(question => {
  question.addEventListener("click", () => {
    const item = question.closest(".faq-item");
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(other => {
      other.classList.remove("open");
      other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("open");
      question.setAttribute("aria-expanded", "true");
    }
  });
});

// Accessible modal helpers
const modals = {
  attendee: document.getElementById("attendeeModal"),
  school: document.getElementById("schoolModal"),
  sponsor: document.getElementById("sponsorModal"),
  ticket: document.getElementById("ticketModal"),
  pending: document.getElementById("pendingModal")
};
let previouslyFocused = null;

function showModal(modal, trigger = null) {
  if (!modal) return;
  previouslyFocused = trigger || document.activeElement;
  Object.values(modals).forEach(item => {
    if (item) {
      item.classList.remove("show");
      item.setAttribute("aria-hidden", "true");
    }
  });
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector("input, select, button")?.focus();
}

function openModal(name, trigger) {
  const modal = modals[name];
  if (!modal) return;
  showModal(modal, trigger);

  if (name === "attendee") {
    const category = trigger?.dataset.category;
    const select = document.getElementById("attendeeCategory");
    if (select) select.selectedIndex = category ? 1 : 0;
  }
  if (name === "school") {
    const isInstitution = trigger?.dataset.kind === "institution";
    document.getElementById("schoolTitle").textContent = isInstitution ? "Register your institution" : "Register your school";
    document.getElementById("schoolType").selectedIndex = isInstitution ? 1 : 0;
  }
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  previouslyFocused?.focus?.();
}

document.querySelectorAll("[data-open-modal]").forEach(button => {
  button.addEventListener("click", () => openModal(button.dataset.openModal, button));
});
document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.closest(".modal")));
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const open = document.querySelector(".modal.show");
    if (open) closeModal(open);
  }
});

// Browser-generated IDs are suitable for this front-end preview only.
// In production, issue and store ticket IDs on the server after registration,
// and only after the backend has verified any required payment.
function makeUniqueReference(prefix = "AEIS27") {
  const randomPart = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`)
    .replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase();
  return `${prefix}-${randomPart}`;
}

function showRegistrationPass({ name, category }) {
  const ticketId = makeUniqueReference("AEIS27");
  document.getElementById("ticketName").textContent = name;
  document.getElementById("ticketCategory").textContent = category;
  document.getElementById("ticketId").textContent = ticketId;

  const qrContainer = document.getElementById("ticketQr");
  qrContainer.innerHTML = "";
  qrContainer.style.color = "#071426";

  if (typeof QRCode !== "undefined") {
    new QRCode(qrContainer, {
      text: `AEIS2027|${ticketId}`,
      width: 130,
      height: 130,
      colorDark: "#071426",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    qrContainer.textContent = "QR code library unavailable. Connect to the internet and reload.";
    qrContainer.style.fontSize = "11px";
  }
  showModal(modals.ticket);
}

// Paid categories receive a reference only at this stage. No QR pass is issued
// until a future backend confirms successful payment through Paystack.
function showPaymentPending({ title, message, reference, category, nextStep }) {
  document.getElementById("pendingTitle").textContent = title;
  document.getElementById("pendingMessage").textContent = message;
  document.getElementById("pendingReference").textContent = reference;
  document.getElementById("pendingCategory").textContent = category;
  document.getElementById("pendingNextStep").textContent = nextStep;
  showModal(modals.pending);
}

// Free individual attendee: generate a QR pass immediately after validation.
// Paid innovation challenge: create a pending reference, but do not issue a QR.
const attendeeForm = document.getElementById("attendeeForm");
attendeeForm?.addEventListener("submit", event => {
  event.preventDefault();
  if (!attendeeForm.reportValidity()) return;

  const formData = new FormData(attendeeForm);
  const name = String(formData.get("name") || "Attendee").trim();
  const selectedCategory = String(formData.get("category") || "General Attendee (Free)").trim();

  attendeeForm.reset();
  closeModal(modals.attendee);

  if (selectedCategory.startsWith("General Attendee")) {
    showRegistrationPass({ name, category: "General Attendee — Free" });
    return;
  }

  if (selectedCategory.includes("Future Tech Innovation Challenge")) {
    showPaymentPending({
      title: "Registration awaiting payment",
      message: `Thank you, ${name}. Your Future Tech Innovation Challenge registration details passed the form check.`,
      reference: makeUniqueReference("AEIS27-PENDING"),
      category: "Future Tech Innovation Challenge — ₦5,000",
      nextStep: "Paystack has not been connected yet. No payment has been collected or verified, so no QR pass has been issued. Once payment is integrated and confirmed, your unique QR pass can be generated."
    });
    return;
  }

  // Speaker / panelist participation is by invitation, not a paid attendee ticket.
  showPaymentPending({
    title: "Speaker / panelist enquiry",
    message: `Thank you, ${name}. Speaker and panelist participation is by invitation.`,
    reference: makeUniqueReference("AEIS27-ENQUIRY"),
    category: "Speaker / Panelist — By Invitation",
    nextStep: "Please contact info@tech2grassroots.africa. A QR access pass should only be issued if your participation is confirmed by the organising team."
  });
});

// School and institution registrations are paid categories. Collect details in
// the form demo, show a pending reference, and do not create a QR before payment.
const schoolForm = document.getElementById("schoolForm");
schoolForm?.addEventListener("submit", event => {
  event.preventDefault();
  if (!schoolForm.reportValidity()) return;

  const formData = new FormData(schoolForm);
  const organisation = String(formData.get("organisation") || "Organisation").trim();
  const contact = String(formData.get("contact") || "Contact person").trim();
  const type = String(formData.get("type") || "School / Institution Participation").trim();
  const isInstitution = type.toLowerCase().includes("institution");

  schoolForm.reset();
  closeModal(modals.school);
  showPaymentPending({
    title: isInstitution ? "Institution registration awaiting payment" : "School registration awaiting payment",
    message: `Thank you, ${contact}. The registration form for ${organisation} has been checked in this browser demo.`,
    reference: makeUniqueReference(isInstitution ? "AEIS27-INST-PENDING" : "AEIS27-SCHOOL-PENDING"),
    category: type,
    nextStep: "Paystack has not been connected yet. No payment has been collected or verified, so no QR pass has been issued. After payment is integrated and confirmed, the organisation can receive its unique QR registration pass."
  });
});

// Sponsorship enquiry opens a pre-filled Gmail draft addressed to the event team.
// The visitor must review the draft and press Send; this website does not send email.
const sponsorForm = document.getElementById("sponsorForm");
sponsorForm?.addEventListener("submit", event => {
  event.preventDefault();
  if (!sponsorForm.reportValidity()) return;

  const data = new FormData(sponsorForm);
  const organisation = String(data.get("organisation") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const packageName = String(data.get("package") || "").trim();
  const support = String(data.get("support") || "").trim();
  const message = String(data.get("message") || "").trim();

  const subject = `AEIS 2027 Sponsorship Enquiry - ${organisation}`;
  const body = [
    "Dear AEIS 2027 Organising Team,", "",
    "I would like to make a sponsorship enquiry for the Africa Education & Innovation Summit 2027.", "",
    `Organisation / Company: ${organisation}`,
    `Contact Person: ${contact}`,
    `Email Address: ${email}`,
    `Phone Number: ${phone}`,
    `Preferred Sponsorship Package: ${packageName}`,
    `Support Type: ${support}`, "",
    "Additional Message:", message || "No additional message provided.", "",
    "Kind regards,", contact, organisation
  ].join("\n");

  const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&" + new URLSearchParams({
    to: "info@tech2grassroots.africa", su: subject, body
  }).toString();

  const gmailTab = window.open(gmailUrl, "_blank");
  if (gmailTab) {
    gmailTab.opener = null;
    const status = document.getElementById("sponsorMessage");
    if (status) status.textContent = "Gmail opened with your sponsorship details. Review the message and press Send.";
  } else {
    window.location.assign(gmailUrl);
  }
});

// Print/download actions for the free attendee pass generated in this demo.
document.getElementById("printTicket")?.addEventListener("click", () => window.print());
document.getElementById("downloadQr")?.addEventListener("click", () => {
  const qrContainer = document.getElementById("ticketQr");
  const canvas = qrContainer.querySelector("canvas");
  const image = qrContainer.querySelector("img");
  const dataUrl = canvas?.toDataURL("image/png") || image?.src;
  if (!dataUrl) {
    alert("The QR code is not ready yet. Check your internet connection and try again.");
    return;
  }
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${document.getElementById("ticketId").textContent}-QR.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
});
