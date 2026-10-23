# The K–6 Studio website

## Editing the site (day to day)

1. Go to **app.pagescms.org** and sign in with GitHub.
2. Open this repository.
3. Use the menu on the left:
   - **Shop – units for sale**: add, edit or hide units. Paste the Payhip product link into "Payhip product link or key" to switch on the Buy button.
   - **Free samples**: the Lesson 1 cards. Add a Payhip link for the free product to show a "Get it free" button.
   - **Home page text**: every heading and paragraph on the page.
   - **Site settings**: email, Instagram, other stores, Google description.
4. Click **Save**. The live site updates by itself in about a minute.

Text in [square brackets] shows up highlighted on the site, so unfinished bits are easy to spot.

## Adding a unit for sale

1. In Payhip, create the product and upload the files. Copy its link (it looks like `https://payhip.com/b/AbC1`).
2. In Pages CMS, open **Shop – units for sale** and click **Add an entry**.
3. Fill in the name, description, stage, subject, price and cover image, and paste the Payhip link.
4. Save.

A unit with no Payhip link shows a "Coming soon" button, or a button to another store if you fill in that link instead.

## Hosting settings (for Cloudflare Pages or Netlify)

- Build command: `npm run build`
- Output folder: `_site`

## Where things live

- `content/`: all the words and units (what Pages CMS edits)
- `static/images/`: pictures
- `design/` and `build.js`: the look of the site. You don't need to touch these; ask Claude if you want design changes.
