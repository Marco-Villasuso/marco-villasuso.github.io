# Marco Villasuso: Portfolio

Static site for GitHub Pages. No build step: plain HTML, CSS, and JS.

## Structure
```
index.html          page content (one <article class="project"> per project)
css/style.css       theme (colors at the top in :root)
js/stars.js         animated starfield background
js/main.js          nav, scroll reveal, image placeholders, lightbox
assets/resume.pdf   linked from the hero button
assets/img/<project>/1.jpg, 2.jpg ...   project photos
```

## Adding photos
Drop images into `assets/img/<project>/` using the filenames referenced in `index.html`.
Missing images show a dashed placeholder with the expected path. Edit each `<figcaption>`.

## Preview locally
Open `index.html` in a browser, or run `python -m http.server` and visit http://localhost:8000.

## Deploy
1. Create a repo named `<your-github-username>.github.io` (or any name).
2. Push these files to the `main` branch.
3. Repo Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
