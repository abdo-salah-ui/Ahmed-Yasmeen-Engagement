/*
  EDIT YOUR INVITATION HERE
  Keep dateISO in a format with a timezone, for example:
  "2027-06-20T17:00:00+02:00"
*/
const invitationDetails = {
  nameOne: "Ahmed Salah",
  nameTwo: "Yasmeen Hassan",
  dateISO: "2026-11-12T18:00:00+02:00",
  dateLabel: "Thursday, 12 November 2026",
  coverDateLabel: "November 12, 2026",
  timeLabel: "6:00 PM",
  venueName: "Lake dream compound, T29",
  venueAddress: "X2FC+WHF First 6th of October",
  mapUrl: "https://maps.app.goo.gl/UFnxJr27ZL8i9jn6A",
  rsvpDeadline: "Tuesday, 10 November 2026 at 11:59 PM",
  rsvpEmail: "a7md.sala7.1999@gmail.com",
  musicSrc: "",
  supabaseUrl: "https://xeusojhztxlriswqbngf.supabase.co",
  supabasePublishableKey: "sb_publishable_WYqNvpd2sGCWKLrcZzH9eg_cBD3XPhL"
};

const byId = (id) => document.getElementById(id);
const isPlaceholder = (value) => !value || /^\[.*\]$/.test(value.trim());
const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
};

setText("[data-couple-one]", invitationDetails.nameOne);
setText("[data-couple-two]", invitationDetails.nameTwo);
setText("[data-initial-one]", invitationDetails.nameOne.trim().charAt(0).toUpperCase());
setText("[data-initial-two]", invitationDetails.nameTwo.trim().charAt(0).toUpperCase());
setText("[data-couple-short]", `${invitationDetails.nameOne} & ${invitationDetails.nameTwo}`);
setText("[data-date-label]", invitationDetails.dateLabel);
setText("[data-cover-date]", invitationDetails.coverDateLabel);
setText("[data-time-label]", invitationDetails.timeLabel);
setText("[data-venue-name]", invitationDetails.venueName);
setText("[data-venue-address]", invitationDetails.venueAddress);
setText("[data-rsvp-deadline]", invitationDetails.rsvpDeadline);
document.title = `${invitationDetails.nameOne} & ${invitationDetails.nameTwo} — Wedding Invitation`;
byId("copyrightYear").textContent = String(new Date().getFullYear());

// Open the envelope, then reveal the invitation page.
const openButton = byId("openInvitation");
const confettiLayer = byId("openingConfetti");
const envelopeReveal = byId("envelopeReveal");
const envelopeScene = byId("envelopeScene");

function launchOpeningConfetti() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#d8b776", "#fff2e5", "#c77a7f", "#9a3140"];
  const shapes = ["dot", "petal", "star"];
  const count = 32;
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const distance = 140 + Math.random() * 220;
    const piece = document.createElement("span");
    piece.className = `confetti-piece confetti-${shapes[index % shapes.length]}`;
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--confetti-rotate", `${Math.random() * 540 - 270}deg`);
    piece.style.setProperty("--confetti-size", `${5 + Math.random() * 7}px`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.1}s`);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    confettiLayer.append(piece);
  }
  envelopeReveal.classList.add("is-celebrating");
}

function playOpenChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  let context;
  try {
    context = new AudioContextClass();
    context.resume().then(() => {
      const startAt = context.currentTime;
      [659.25, 783.99, 987.77].forEach((frequency, index) => {
        const noteStart = startAt + index * 0.13;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        envelope.gain.setValueAtTime(0.0001, noteStart);
        envelope.gain.exponentialRampToValueAtTime(0.07, noteStart + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.95);
        oscillator.connect(envelope);
        envelope.connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 1);
      });
      window.setTimeout(() => { context.close().catch(() => {}); }, 1450);
    }).catch(() => { context.close().catch(() => {}); });
  } catch {
    if (context) context.close().catch(() => {});
  }
}

function startInvitationTour(reducedMotion) {
  if (reducedMotion) return;

  const root = document.documentElement;
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  let cancelled = false;
  let frameId = 0;
  let previousTime = null;
  let scrollPosition = 0;
  const cleanup = () => {
    window.cancelAnimationFrame(frameId);
    root.classList.remove("instant-scroll");
    window.removeEventListener("wheel", cancelTour);
    window.removeEventListener("touchstart", cancelTour);
    window.removeEventListener("pointerdown", cancelTour);
    window.removeEventListener("mousedown", cancelTour);
    window.removeEventListener("keydown", cancelTour);
  };
  const cancelTour = () => {
    if (cancelled) return;
    cancelled = true;
    cleanup();
  };
  const scrollContinuously = (timestamp) => {
    if (cancelled) return;
    if (previousTime === null) previousTime = timestamp;
    const elapsed = (timestamp - previousTime) / 1000;
    previousTime = timestamp;
    // Accumulate fractional pixels so browsers that round scrollY still move steadily.
    scrollPosition = Math.min(maxScroll(), scrollPosition + elapsed * 60);
    window.scrollTo({ top: scrollPosition, behavior: "auto" });
    if (scrollPosition >= maxScroll() - 1) {
      cleanup();
      return;
    }
    frameId = window.requestAnimationFrame(scrollContinuously);
  };

  root.classList.add("instant-scroll");
  window.scrollTo({ top: 0, behavior: "auto" });
  scrollPosition = 0;
  window.addEventListener("wheel", cancelTour, { passive: true });
  window.addEventListener("touchstart", cancelTour, { passive: true });
  window.addEventListener("pointerdown", cancelTour, { passive: true });
  window.addEventListener("mousedown", cancelTour, { passive: true });
  window.addEventListener("keydown", cancelTour);
  frameId = window.requestAnimationFrame(scrollContinuously);
}

openButton.addEventListener("click", () => {
  if (openButton.disabled) return;
  openButton.disabled = true;
  playOpenChime();
  byId("inviteCover").classList.add("is-opening");
  document.body.classList.add("has-opened");
  envelopeReveal.classList.add("is-visible");
  envelopeReveal.setAttribute("aria-hidden", "false");
  envelopeScene.classList.add("is-opening");

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(launchOpeningConfetti, reducedMotion ? 0 : 700);
  window.setTimeout(() => {
    envelopeReveal.classList.add("is-leaving");
    envelopeScene.classList.add("is-leaving");
    window.setTimeout(() => {
      envelopeReveal.classList.remove("is-visible", "is-leaving", "is-celebrating");
      envelopeScene.classList.remove("is-opening", "is-leaving");
      envelopeReveal.setAttribute("aria-hidden", "true");

      const page = byId("invitation");
      page.classList.add("is-visible");
      page.setAttribute("aria-hidden", "false");
      document.body.classList.remove("intro-locked");
      byId("top").setAttribute("tabindex", "-1");
      byId("top").focus({ preventScroll: true });
      window.requestAnimationFrame(() => startInvitationTour(reducedMotion));
    }, reducedMotion ? 80 : 720);
  }, reducedMotion ? 1100 : 3200);
});

// Countdown stays neutral until a real date and timezone are entered above.
const countdownNote = byId("countdownNote");
const eventTime = invitationDetails.dateISO ? new Date(invitationDetails.dateISO).getTime() : NaN;
const countdownParts = ["days", "hours", "minutes", "seconds"];
function updateCountdown() {
  if (!Number.isFinite(eventTime)) {
    countdownNote.hidden = false;
    return;
  }
  if (eventTime <= Date.now()) {
    countdownParts.forEach((id) => { byId(id).textContent = "00"; });
    countdownNote.textContent = "The celebration is here — thank you for being part of it.";
    return;
  }
  const remaining = Math.floor((eventTime - Date.now()) / 1000);
  const values = [
    Math.floor(remaining / 86400),
    Math.floor((remaining % 86400) / 3600),
    Math.floor((remaining % 3600) / 60),
    remaining % 60
  ];
  countdownParts.forEach((id, index) => {
    byId(id).textContent = String(values[index]).padStart(2, "0");
  });
  countdownNote.hidden = true;
}
updateCountdown();
if (Number.isFinite(eventTime) && eventTime > Date.now()) window.setInterval(updateCountdown, 1000);

// A free Google Maps search link and embed need no API key.
const mapQueryParts = [invitationDetails.venueName, invitationDetails.venueAddress].filter((part) => !isPlaceholder(part));
if (mapQueryParts.length) {
  const mapQuery = mapQueryParts.join(" ");
  const encodedQuery = encodeURIComponent(mapQuery);
  const frame = byId("mapFrame");
  frame.src = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  frame.hidden = false;
  byId("mapFallback").hidden = true;
  const mapLink = byId("mapLink");
  mapLink.href = invitationDetails.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
} else {
  byId("mapPlaceholderLabel").textContent = "Add venue details in script.js to show the map";
  byId("mapLink").textContent = "Set your venue";
  byId("mapLink").href = "#details";
  byId("mapLink").removeAttribute("target");
}

// Music is optional. Add a licensed audio file and enter its path in musicSrc.
const musicButton = byId("musicToggle");
const audio = byId("weddingMusic");
if (invitationDetails.musicSrc) {
  audio.src = invitationDetails.musicSrc;
  musicButton.hidden = false;
  musicButton.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        musicButton.setAttribute("aria-pressed", "true");
        byId("musicLabel").textContent = "Pause music";
      } catch {
        byId("musicLabel").textContent = "Music unavailable";
      }
    } else {
      audio.pause();
      musicButton.setAttribute("aria-pressed", "false");
      byId("musicLabel").textContent = "Play music";
    }
  });
  audio.addEventListener("ended", () => {
    musicButton.setAttribute("aria-pressed", "false");
    byId("musicLabel").textContent = "Play music";
  });
}

// Static-site RSVP: build a prefilled email so no guest data is sent to a server.
byId("rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const status = byId("rsvpStatus");
  if (!invitationDetails.rsvpEmail || !invitationDetails.rsvpEmail.includes("@")) {
    status.textContent = "To enable RSVP, add your email address to rsvpEmail in script.js.";
    return;
  }
  const formData = new FormData(event.currentTarget);
  const guestName = String(formData.get("guestName") || "").trim();
  const attendance = String(formData.get("attendance") || "");
  const guests = String(formData.get("guests") || "1");
  const note = String(formData.get("note") || "").trim();
  const subject = `Wedding RSVP — ${invitationDetails.nameOne} & ${invitationDetails.nameTwo}`;
  const body = [
    `Name: ${guestName}`,
    `Reply: ${attendance}`,
    `Number of guests: ${guests}`,
    note ? `Note: ${note}` : ""
  ].filter(Boolean).join("\n");
  status.textContent = "Your email app is opening with your RSVP. Please press Send to finish.";
  window.location.href = `mailto:${encodeURIComponent(invitationDetails.rsvpEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Public guestbook. Configure a Supabase project and the policies in README.md.
const guestbookForm = byId("guestbookForm");
const guestbookList = byId("guestbookMessages");
const guestbookStatus = byId("guestbookStatus");
const guestbookSubmit = guestbookForm.querySelector("button[type='submit']");
const guestbookUrl = invitationDetails.supabaseUrl.replace(/\/$/, "");
const guestbookKey = invitationDetails.supabasePublishableKey;
const guestbookReady = Boolean(guestbookUrl && guestbookKey);

function addGuestbookEntry(entry) {
  const card = document.createElement("article");
  card.className = "guestbook-entry";
  const header = document.createElement("div");
  header.className = "guestbook-entry-head";
  const name = document.createElement("strong");
  name.className = "guestbook-entry-name";
  name.textContent = entry.name;
  const date = document.createElement("time");
  const dateValue = new Date(entry.created_at);
  if (Number.isFinite(dateValue.getTime())) {
    date.dateTime = dateValue.toISOString();
    date.textContent = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(dateValue);
  }
  const message = document.createElement("p");
  message.className = "guestbook-entry-message";
  message.textContent = entry.message;
  header.append(name, date);
  card.append(header, message);
  guestbookList.append(card);
}

async function loadGuestbook() {
  if (!guestbookReady) return;
  guestbookStatus.textContent = "Loading guest messages…";
  try {
    const query = "?select=id,name,message,created_at&order=created_at.desc&limit=50";
    const response = await fetch(`${guestbookUrl}/rest/v1/guestbook_messages${query}`, {
      headers: { apikey: guestbookKey, Authorization: `Bearer ${guestbookKey}` }
    });
    if (!response.ok) throw new Error("Could not load messages");
    const entries = await response.json();
    guestbookList.replaceChildren();
    byId("guestbookCount").textContent = String(entries.length);
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "guestbook-empty";
      empty.textContent = "Be the first to leave a message.";
      guestbookList.append(empty);
    } else {
      entries.forEach(addGuestbookEntry);
    }
    guestbookStatus.textContent = "Messages are shared with everyone who visits this invitation.";
  } catch {
    guestbookStatus.textContent = "The guestbook is temporarily unavailable. Please try again in a little while.";
  }
}

if (guestbookReady) {
  loadGuestbook();
  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(guestbookForm);
    const name = String(formData.get("guestName") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (!name || !message) {
      guestbookStatus.textContent = "Please add your name and a message.";
      return;
    }
    guestbookSubmit.disabled = true;
    guestbookStatus.textContent = "Posting your message…";
    try {
      const response = await fetch(`${guestbookUrl}/rest/v1/guestbook_messages`, {
        method: "POST",
        headers: {
          apikey: guestbookKey,
          Authorization: `Bearer ${guestbookKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ name, message })
      });
      if (!response.ok) throw new Error("Could not post message");
      guestbookForm.reset();
      guestbookStatus.textContent = "Thank you! Your message is now in the guestbook.";
      await loadGuestbook();
    } catch {
      guestbookStatus.textContent = "Your message couldn’t be posted. Please try again.";
    } finally {
      guestbookSubmit.disabled = false;
    }
  });
} else {
  guestbookSubmit.disabled = true;
  guestbookStatus.textContent = "The guestbook needs its Supabase connection before guests can post.";
}

// Share with the phone's share sheet, or copy the page URL.
byId("shareButton").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const originalLabel = "Share invitation ↗";
  try {
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        text: "You're invited to celebrate with us.",
        url: window.location.href
      });
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "Link copied ✓";
    } else {
      window.prompt("Copy your invitation link:", window.location.href);
    }
  } catch (error) {
    if (error.name !== "AbortError") window.prompt("Copy your invitation link:", window.location.href);
  }
  if (button.textContent !== originalLabel) {
    window.setTimeout(() => { button.innerHTML = 'Share invitation <span aria-hidden="true">↗</span>'; }, 2400);
  }
});

