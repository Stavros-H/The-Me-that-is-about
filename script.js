const navItems = [
  ["index.html", "Home"], ["media.html", "Media"], ["future.html", "Future"],
  ["choice1-learning.html", "Learning"], ["choice2-the-pit.html", "The Pit"], ["admin.html", "Admin"]
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
  ["Pikmin", "IMAGE", "I went to Universal once, and they had Nintento World there. Mostly Mario stuff, but i found some Pikmin.", "assets/media-first-image.jpeg"],
  ["Im So Smart", "IMAGE", "I just wanted some cereal.", "assets/media-second-image.jpeg"],
  ["Game", "IMAGE", "This is Earthbound, a very old game. I like games, and old ones are no acception.", "assets/media-third-image.jpeg"],
  ["Doom Scrolling", "IMAGE", "I do do stuff. But, i also doom scroll a lot. Not shorts content, but Youtube.", "assets/media-fourth-image.jpeg"],
  ["Hand of Mine", "VIDEO", "It's my hand. How inspired. How... unique.", "assets/media-fifth-video.mp4"],
  ["Games, but BOARD", "IMAGE", "I like games. I also like board games. And, i have a lot of board games.", "assets/media-sixth-image.jpeg"],
  ["A work in progress", "IMAGE", "A current work in progress.", "assets/media-seventh-image.jpeg"],
  ["A meaningful moment", "IMAGE", "A photo shared by Stavros.", "assets/media-eighth-image.png"],
  ["Looking forward", "VIDEO", "A video about a future goal."]
];
function renderGallery() {
  const gallery = document.querySelector("#media-gallery");
  if (!gallery) return;
  gallery.innerHTML = mediaItems.map(([title,type,caption,src], index) => `<article class="gallery-card" tabindex="0" data-placeholder-card>${src ? type === "VIDEO" ? `<video class="gallery-video" src="${src}" controls playsinline preload="metadata" aria-label="${title}"></video>` : `<img class="gallery-image" src="${src}" alt="${title}">` : `<div class="media-placeholder">${type}<br><small>placeholder ${String(index + 1).padStart(2,"0")}</small></div>`}<h3>${title}</h3><p>${caption}</p></article>`).join("");
  const modal = document.createElement("div");
  modal.className = "media-modal";
  modal.innerHTML = `<div class="media-modal-content" role="dialog" aria-modal="true" aria-label="Media preview"><button class="media-modal-close" aria-label="Close preview">×</button><div class="media-modal-art"></div><h2></h2><p></p></div>`;
  document.body.appendChild(modal);
  const closeModal = () => {
    modal.classList.remove("open");
    modal.querySelectorAll("video").forEach((video) => video.pause());
  };
  modal.querySelector(".media-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  gallery.querySelectorAll(".gallery-card").forEach((card, index) => {
    const openModal = () => {
      const [title, type, caption, src] = mediaItems[index];
      modal.querySelector(".media-modal-art").innerHTML = src ? type === "VIDEO" ? `<video class="modal-video" src="${src}" controls playsinline preload="metadata" aria-label="${title}"></video>` : `<img class="modal-image" src="${src}" alt="${title}">` : `${type} PLACEHOLDER`;
      modal.querySelector("h2").textContent = title;
      modal.querySelector("p").textContent = caption;
      modal.classList.add("open");
    };
    card.addEventListener("click", openModal);
    card.querySelector("video")?.addEventListener("click", (event) => event.stopPropagation());
    card.addEventListener("keydown", (event) => { if (event.target !== card) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openModal(); } });
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