# ArtNova — Digital Art Store

A multi-page responsive website for an online store of original digital art (wallpapers, posters, pixel art).
Final project for the Frontend course.

**Team:** Dinmukhammed · Yerketay · Aldiyar

- **Live site:** https://YOUR-USERNAME.github.io/digital-art-store/  ← replace after deploying
- **Repository:** https://github.com/YOUR-USERNAME/digital-art-store

## Purpose and audience

ArtNova sells original digital artworks from independent artists. It is built for people aged 16–35
(students, content creators, home decorators and small businesses) who want unique visuals for their
screens, walls or brand instead of generic stock images.

## Pages (10)

| Page | What it does |
|------|--------------|
| `index.html` | Home: hero, categories, top-rated artworks, how it works, newsletter form |
| `shop.html` | Catalogue with search, category/price filters, sorting, favorites, quick-view modal |
| `inspiration.html` | Live artworks from the Cleveland Museum of Art API with search and "Load more" |
| `about.html` | Story, target audience, team, FAQ |
| `contact.html` | Contact details and a validated message form |
| `cart.html` | Cart with licenses, promo code (`ART10`, `AITU15`) and validated checkout |
| `signup.html` | Registration (name, email, phone, password) saved in localStorage |
| `login.html` | Login: checks credentials and redirects to the profile |
| `profile.html` | Stored user details, favorites, order history, log out |
| `404.html` | Custom "page not found" page (GitHub Pages uses it automatically) |

## How each requirement is covered

1. **Responsiveness:** CSS Grid + Flexbox, breakpoints at 1024 / 900 / 640 / 380 px, burger menu on mobile.
2. **Hosting:** GitHub Pages (see below). All paths are relative, so they work in a sub-folder.
3. **Light / dark mode:** toggle in the header, saved in `localStorage` (`artnova-theme`) and applied on every page
   before it is drawn (no flash). The first visit follows the system setting.
4. **Design & UX:** one design system with color tokens (`:root` / `[data-theme="dark"]`), Manrope font,
   Bootstrap Icons, original artwork images in `/images`.
5. **JavaScript:**
   - *Auth simulation:* `js/auth.js`, `js/profile.js`. Users in `artnova-users`, logged-in email in `artnova-session`.
   - *Validation:* `js/validation.js`. All forms use `novalidate` and **no** HTML validation attributes.
     Checks: required fields, email format, password length + complexity (with a live checklist), Kazakhstan phone
     pattern, confirm password, checkbox. Errors are shown under each field.
   - *Search / filter:* `js/shop.js` (search, category, price, sort, favorites only; saved in `artnova-shop-filters`)
     and `js/inspiration.js` (API search; recent searches saved in `artnova-art-search`).
6. **Animations:** button lift + shadow, arrow slide, theme icon spin, feature icon zoom, card image zoom,
   heart "pop", scroll-reveal sections, skeleton loading shimmer, toasts. `prefers-reduced-motion` is respected.
7. **External API:** [Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/), no key needed.
   Uses `async/await` + `fetch()`, skeleton loading state, error box with "Try again", empty-result message, pagination.
8. **Cohesion:** everything is about digital art. The API gives "inspiration from the masters" for artists and buyers.
10. **Code organization:** see the structure below; every JS file starts with a comment explaining its job.

## Project structure

```
digital-art-store/
├── index.html, shop.html, inspiration.html, about.html, contact.html
├── cart.html, signup.html, login.html, profile.html, 404.html
├── css/
│   └── style.css          # all styles: tokens, components, pages, animations, responsive
├── js/
│   ├── data.js            # product catalogue and categories
│   ├── script.js          # shared: theme, nav, storage helpers, cart, favorites, toasts, cards
│   ├── validation.js      # form validation rules and error display
│   ├── home.js            # home page sections + newsletter
│   ├── shop.js            # search, filters, sorting, quick view
│   ├── inspiration.js     # external API integration
│   ├── auth.js            # sign up + log in
│   ├── profile.js         # profile page
│   ├── cart.js            # cart + checkout
│   └── contact.js         # contact form
└── images/                # original artworks and logo (JPG)
```

## Run locally

Open `index.html` in a browser, or (better) start a small local server in this folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "ArtNova final project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/digital-art-store.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
After 1–2 minutes the site will be at `https://YOUR-USERNAME.github.io/digital-art-store/`.

## Test account

There is no backend, so every browser starts empty. Create an account on `signup.html`, for example
password `Artnova#2026` (8+ characters, upper and lower case, a number and a symbol).
