(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Added here rather than inline so content stays visible if this file ever fails to load.
  root.classList.add("js");

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector(".theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return darkQuery.matches ? "dark" : "light";
  }

  function labelThemeButton() {
    if (!themeBtn) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  if (themeBtn) {
    labelThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      labelThemeButton();
    });
    darkQuery.addEventListener("change", labelThemeButton);
  }

  /* ---------- Header: border on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var navLinks = document.getElementById("nav-links");

  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("is-open", open);
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".site-header")) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var inBand = {};
    var activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          inBand[entry.target.id] = entry.isIntersecting;
        });
        // The section crossing the middle of the screen wins; none (e.g. in the hero) clears it.
        var current = null;
        sections.forEach(function (s) {
          if (inBand[s.id]) current = "#" + s.id;
        });
        links.forEach(function (a) {
          var on = a.getAttribute("href") === current;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      activeObserver.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Demo video: pause control, pause offscreen, respect reduced motion ---------- */
  var video = document.querySelector(".demo-video");
  var videoBtn = document.querySelector(".video-toggle");

  if (video && videoBtn) {
    var userPaused = false;

    function syncVideoButton() {
      var paused = video.paused;
      videoBtn.classList.toggle("is-paused", paused);
      videoBtn.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
    }

    if (reduceMotion.matches) {
      userPaused = true;
      video.removeAttribute("autoplay");
      video.pause();
    }

    videoBtn.addEventListener("click", function () {
      if (video.paused) {
        userPaused = false;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        userPaused = true;
        video.pause();
      }
    });

    video.addEventListener("play", syncVideoButton);
    video.addEventListener("pause", syncVideoButton);
    syncVideoButton();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !userPaused) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
          } else if (!entry.isIntersecting && !video.paused) {
            video.pause();
          }
        });
      }).observe(video);
    }
  }

  /* ---------- Contact form (Netlify Forms over fetch, falls back to a normal post) ---------- */
  var form = document.querySelector(".contact-form");
  if (form && window.fetch) {
    var success = document.querySelector(".form-success");
    var errorMsg = form.querySelector(".form-error");
    var submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorMsg) errorMsg.hidden = true;
      if (submitBtn) submitBtn.disabled = true;

      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.hidden = true;
          if (success) {
            success.hidden = false;
            success.focus();
          }
        })
        .catch(function () {
          if (errorMsg) errorMsg.hidden = false;
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
