const navItems = [
  ["index.html", "Home"], ["media.html", "Media"], ["future.html", "Future"],
  ["learning.html", "Learning"], ["interests.html", "Interests"], ["admin.html", "Admin"]
];

function renderShell() {
  const current = location.pathname.split("/").pop() || "index.html";
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");
  if (header) {
    header.innerHTML = `<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">+</span>STAVROS H.</a><button class="menu-toggle" aria-label="Open navigation">☰</button><nav class="site-nav">${navItems.map(([href,label]) => `<a href="${href}" class="${current === href ? "active" : ""}">${label}</a>`).join("")}</nav></header>`;
    header.querySelector(".menu-toggle").addEventListener("click", () => header.querySelector(".site-nav").classList.toggle("open"));
  }
  if (footer) footer.innerHTML = `<footer class="site-footer"><div class="footer-inner"><p>© ${new Date().getFullYear()} Stavros H. · First website project</p><a href="index.html">Back to top ↑</a></div></footer>`;
}

const mediaItems = [
  ["Portrait placeholder", "IMAGE", "Replace with a photo that clearly shows me."],
  ["A day in progress", "VIDEO", "Replace with a personal video."],
  ["A social moment", "SOCIAL POST", "Replace with a social media embed or link."],
  ["Project detail", "IMAGE", "A closer look at something I made."],
  ["Behind the scenes", "VIDEO", "A placeholder for process footage."],
  ["A favorite place", "IMAGE", "Replace with a personal photo."],
  ["A work in progress", "IMAGE", "Share something I am building."],
  ["A meaningful moment", "SOCIAL POST", "Add an original social post here."],
  ["Looking forward", "VIDEO", "A video about a future goal."]
];
function renderGallery() {
  const gallery = document.querySelector("#media-gallery");
  if (!gallery) return;
  gallery.innerHTML = mediaItems.map(([title,type,caption], index) => `<article class="gallery-card" tabindex="0" data-placeholder-card><div class="media-placeholder">${type}<br><small>placeholder ${String(index + 1).padStart(2,"0")}</small></div><h3>${title}</h3><p>${caption}</p></article>`).join("");
  const modal = document.createElement("div");
  modal.className = "media-modal";
  modal.innerHTML = `<div class="media-modal-content" role="dialog" aria-modal="true" aria-label="Media preview"><button class="media-modal-close" aria-label="Close preview">×</button><div class="media-modal-art"></div><h2></h2><p></p></div>`;
  document.body.appendChild(modal);
  const closeModal = () => modal.classList.remove("open");
  modal.querySelector(".media-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  gallery.querySelectorAll(".gallery-card").forEach((card, index) => {
    const openModal = () => {
      const [title, type, caption] = mediaItems[index];
      modal.querySelector(".media-modal-art").textContent = `${type} PLACEHOLDER`;
      modal.querySelector("h2").textContent = title;
      modal.querySelector("p").textContent = caption;
      modal.classList.add("open");
    };
    card.addEventListener("click", openModal);
    card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openModal(); } });
  });
}

async function submitContact(event) {
  event.preventDefault();
  const form = event.currentTarget, status = document.querySelector("#form-status"), button = form.querySelector("button");
  status.textContent = "Sending…"; status.className = "form-status"; button.disabled = true;
  try {
    const response = await fetch("/api/contact", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to send your message.");
    form.reset(); status.textContent = "Thanks — your message was received."; status.className = "form-status success";
  } catch (error) { status.textContent = error.message; status.className = "form-status error"; }
  finally { button.disabled = false; }
}

document.addEventListener("DOMContentLoaded", () => {
  renderShell(); renderGallery();
  document.querySelector("#contact-form")?.addEventListener("submit", submitContact);
  document.querySelectorAll("[data-placeholder-link], [data-placeholder-card]").forEach((element) => element.addEventListener("click", (event) => { if (element.matches("a")) event.preventDefault(); }));
});