# jonasmogilnicki.netlify.app

My personal site. Plain HTML, CSS and JavaScript with no build step, hosted on Netlify.

```
index.html          the whole site (one page)
style.css           styles, including light and dark themes
script.js           theme toggle, mobile menu, scroll reveals, demo video, contact form
success/index.html  page shown after the contact form is sent without JavaScript
404.html            page-not-found
images/             web-sized images, the Agent Office demo video and the social preview (og.jpg)
netlify.toml        Netlify settings (publish folder, cache headers)
```

## Editing

- **Projects, experience, skills:** edit the matching section in `index.html`. Each section is marked with a comment banner.
- **Colours and fonts:** the variables at the top of `style.css` (`--accent` and the rest). Dark-theme values are in the two blocks right below.
- **Images:** add web-sized files (about 1000–1500 px wide, WebP or JPEG) to `images/` and reference them as `/images/name.webp`.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Contact form

The form uses Netlify Forms (`data-netlify="true"`), so submissions only work on the deployed site. Email notifications for new messages are set in the Netlify dashboard under **Site configuration → Notifications → Emails and webhooks → Form submission notifications**.
