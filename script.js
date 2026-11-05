/* Nataraj Circuits — site interactions */
(function () {
  "use strict";

  // ---- Business contact details: update these in one place ----
  const CONTACT = {
    email: "sales@natarajcircuits.com",
    phoneDisplay: "+91 00000 00000",
    phoneE164: "910000000000", // digits only, used for tel: and WhatsApp
  };

  document.querySelectorAll('[data-contact="email"]').forEach((a) => {
    a.href = "mailto:" + CONTACT.email;
    a.textContent = CONTACT.email;
  });
  document.querySelectorAll('[data-contact="phone"]').forEach((a) => {
    a.href = "tel:+" + CONTACT.phoneE164;
    a.textContent = CONTACT.phoneDisplay;
  });
  const wa = document.getElementById("waBtn");
  if (wa) wa.href = "https://wa.me/" + CONTACT.phoneE164 + "?text=" + encodeURIComponent("Hi Nataraj Circuits, I'd like a PCB quote.");

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---- Sticky nav border + mobile menu ----
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") setMenu(false); });

  // ---- Toast ----
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 3200);
  };

  // ---- Instant quote estimator ----
  // Indicative pricing model (INR, excl. GST & shipping). Tune these to your real rates.
  const PRICING = {
    setup: { 1: 600, 2: 900, 4: 2800, 6: 4800, 8: 7500 },      // per order
    perCm2: { 1: 0.22, 2: 0.32, 4: 0.85, 6: 1.35, 8: 2.0 },     // per cm² of board area
    finish: { hasl: 1.0, osp: 0.95, enig: 1.35 },
    mask: { green: 1.0, black: 1.06, blue: 1.06, red: 1.06, white: 1.08 },
    thickness: { "0.8": 1.05, "1.0": 1.02, "1.6": 1.0, "2.0": 1.08 },
    lead: { std: 1.0, fast: 1.35, exp: 1.9 },
    minOrder: 1200,
  };

  const form = document.getElementById("quoteForm");
  const priceEl = document.getElementById("quotePrice");
  const subEl = document.getElementById("quoteSub");
  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const readQuote = () => {
    const d = new FormData(form);
    return {
      w: parseFloat(d.get("w")),
      h: parseFloat(d.get("h")),
      layers: d.get("layers"),
      qty: parseInt(d.get("qty"), 10),
      thk: d.get("thk"),
      finish: d.get("finish"),
      mask: d.get("mask"),
      lead: d.get("lead"),
    };
  };

  const validDim = (v) => Number.isFinite(v) && v >= 5 && v <= 500;

  const calc = () => {
    const q = readQuote();
    const wIn = form.elements.w, hIn = form.elements.h;
    wIn.classList.toggle("is-invalid", !validDim(q.w));
    hIn.classList.toggle("is-invalid", !validDim(q.h));
    if (!validDim(q.w) || !validDim(q.h)) {
      priceEl.textContent = "₹—";
      subEl.textContent = "Enter a size between 5 and 500 mm";
      return null;
    }
    const areaCm2 = (q.w * q.h) / 100;
    const totalArea = areaCm2 * q.qty;
    // Volume discount on area cost
    const volume = totalArea > 50000 ? 0.7 : totalArea > 20000 ? 0.8 : totalArea > 5000 ? 0.9 : 1;
    const mult = PRICING.finish[q.finish] * PRICING.mask[q.mask] * PRICING.thickness[q.thk];
    let total = (PRICING.setup[q.layers] + totalArea * PRICING.perCm2[q.layers] * volume) * mult * PRICING.lead[q.lead];
    total = Math.max(total, PRICING.minOrder * PRICING.lead[q.lead]);
    total = Math.round(total / 10) * 10;
    priceEl.textContent = inr.format(total);
    subEl.textContent = q.qty + " pcs · " + inr.format(total / q.qty) + " per board";
    return Object.assign(q, { total });
  };

  form.addEventListener("input", calc);
  form.addEventListener("change", calc);
  calc();

  const LEAD_LABEL = { std: "Standard (5–7 days)", fast: "Fast (3 days)", exp: "Express (24 hr)" };
  const openMail = (subject, body) => {
    window.location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = calc();
    if (!q) { showToast("Please enter a valid board size."); return; }
    const body = [
      "Hello Nataraj Circuits,",
      "",
      "I'd like a quote for the following PCB:",
      "• Size: " + q.w + " × " + q.h + " mm",
      "• Layers: " + (q.layers === "8" ? "8+" : q.layers),
      "• Quantity: " + q.qty,
      "• Thickness: " + q.thk + " mm",
      "• Surface finish: " + q.finish.toUpperCase(),
      "• Solder mask: " + q.mask,
      "• Lead time: " + LEAD_LABEL[q.lead],
      "• Indicative price shown: " + inr.format(q.total) + " (excl. GST & shipping)",
      "",
      "Delivery city / pin code: ",
      "",
      "I'm attaching my Gerber files.",
    ].join("\n");
    openMail("PCB quote request — " + q.qty + " pcs, " + q.layers + "L, " + q.w + "×" + q.h + " mm", body);
    showToast("Opening your email app — attach your Gerber .zip and send.");
  });

  // ---- Contact form ----
  const cform = document.getElementById("contactForm");
  cform.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(cform);
    const name = (d.get("name") || "").trim();
    const email = (d.get("email") || "").trim();
    const nameIn = cform.elements.name, emailIn = cform.elements.email;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    nameIn.classList.toggle("is-invalid", !name);
    emailIn.classList.toggle("is-invalid", !emailOk);
    if (!name || !emailOk) { showToast("Please add your name and a valid email."); return; }
    const body = [
      "Name: " + name,
      "Company: " + (d.get("company") || "—"),
      "Email: " + email,
      "Phone: " + (d.get("phone") || "—"),
      "City / Pin code: " + (d.get("city") || "—"),
      "",
      "Requirements:",
      d.get("msg") || "—",
    ].join("\n");
    openMail("PCB enquiry from " + name, body);
    showToast("Opening your email app — attach your files and send.");
  });

  // ---- Reveal on scroll ----
  if ("IntersectionObserver" in window) {
    const els = document.querySelectorAll(".section__head, .card, .spec, .steps li, .why__item, .chips, .ship__list, .faq__list, .cta, .quote__form");
    els.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }
})();
