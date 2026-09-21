# Fret Footy

School soccer league site for Dukes FC, Rico Footy, Team Sins, and Team Showtime.

**Live site:** [https://cgoldstein27-maker.github.io/fret-footy/](https://cgoldstein27-maker.github.io/fret-footy/)

Public pages cover standings, player overalls, the schedule, power rankings, news, and film. Admin is a private desk on the same site for updating all of that.

This is a fan-made school league page. It is not affiliated with any professional club.

## Run locally

```bash
python3 -m http.server 8788
```

Then open [http://127.0.0.1:8788/](http://127.0.0.1:8788/).

## Admin

Open **Admin** in the nav. The first visit on a browser sets a password. After that, log in with the same password on that browser.

From Admin you can:

- Edit the home News card and the spotlight card under it
- Add, edit, and remove players
- Add teams
- Enter scores and predictions
- Publish weekly power rankings
- Post YouTube links or upload video files
- Download or import a JSON backup

Saves stay in this browser through reloads and site updates. GitHub Pages and localhost are separate. Chrome and Safari are separate.

To push those edits so **everyone** sees them on the live site, go to **Admin → League**, paste a GitHub token with Contents access to `cgoldstein27-maker/fret-footy`, and use **Save & publish live**. YouTube links go public. A video file upload stays on the computer that uploaded it unless you also add a public link.

If login fails, use **Reset password** on the Admin screen and set it again.

## What’s in the repo

| Path | What it is |
| --- | --- |
| `index.html` | Single page |
| `css/styles.css` | Layout and Fret Footy colors |
| `js/app.js` | Public views and admin desk |
| `js/store.js` | Saves, admin login, live publish |
| `js/seed.js` | Default clubs, rosters, and schedule |
| `img/` | Logos and campus background |
| `.github/workflows/pages.yml` | Deploys to GitHub Pages on push to `main` |

## License

For class use. Team crests and names belong to the clubs that use them.
