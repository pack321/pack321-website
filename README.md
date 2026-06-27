# Pack 321 Full Site v0.2

Leadership preview build with homepage and supporting pages.

## Includes
- Homepage matching the approved direction with business card hero artwork
- Events & Calendar page with embedded Google Calendar
- Cub Scout Journey using official rank images provided
- Why Pack 321, Adventures, Resources, Team, Volunteer, Join, and Contact pages

## Update notes
- Upcoming event cards are currently manual placeholders.
- Replace card text as dates become final.
- Add real Google Form / Drive / Facebook / BAND links when ready.

## Interest / Contact Request Form
This GitHub Pages site does not save form submissions directly. Keep all form handling inside Google Forms / Google Drive.

Setup steps:
1. Create a Google Form for Pack 321 interest/contact requests.
2. Do not collect sensitive youth information directly on the website.
3. Link Google Form responses to a Google Sheet.
4. Turn on email notifications for new responses in Google Forms or the linked Google Sheet workflow.
5. Copy the published Google Form embed iframe URL.
6. Replace `FORM_ID_HERE` in `join.html` and `contact.html` with the published Google Form embed link.
7. Keep submissions, response storage, and follow-up tracking inside Google Forms / Google Drive.


## Photo Framework v2

This site is built so Pack 321 leaders can update photos without editing code. Replace images in the folders below using the same filenames and the pages will update automatically.

### Hero Images

Place page hero photos here:

- Home: `assets/images/hero/home.png`
- Why Pack 321: `assets/images/hero/why-pack321.jpg`
- Cub Scouts: `assets/images/hero/cub-scouts.jpg`
- Adventures: `assets/images/hero/adventures.jpg`
- Calendar: `assets/images/hero/calendar.jpg`
- Resources: `assets/images/hero/resources.jpg`
- Team: `assets/images/hero/team.jpg`
- Join: `assets/images/hero/join.jpg`
- Volunteer: `assets/images/hero/volunteer.jpg`
- Contact: `assets/images/hero/contact.jpg`

If a hero image is missing, the site falls back to `assets/images/placeholders/hero-placeholder.jpg`.

### Adventure Images

Adventure cards use these replaceable files:

- `assets/images/adventures/camping.jpg`
- `assets/images/adventures/fishing.jpg`
- `assets/images/adventures/pinewood-derby.jpg`
- `assets/images/adventures/raingutter-regatta.jpg`
- `assets/images/adventures/hiking.jpg`
- `assets/images/adventures/service.jpg`
- `assets/images/adventures/blue-gold.jpg`
- `assets/images/adventures/graduation.jpg`

If an adventure image is missing, the card falls back to `assets/images/placeholders/card-placeholder.jpg`.

### Image Guidelines

Use real Pack 321 photography. Do not use AI-generated Scout photos in the production site. JPG or PNG images work best. The site uses `object-fit: cover`, so images should be large enough to crop gracefully without stretching or distortion.

### Google Form Setup

This static GitHub Pages site does not save form submissions directly. Form handling stays inside Google Forms and Google Drive.

1. Create a Google Form for Pack 321 interest/contact requests.
2. Link responses to a Google Sheet.
3. Turn on email notifications for new responses.
4. Copy the published Google Form embed URL.
5. Replace `FORM_ID_HERE` in `join.html` and `contact.html`.

Do not collect sensitive youth information directly on the website.
