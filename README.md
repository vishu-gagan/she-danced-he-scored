# vishu-gagan

Vishu &amp; Gagan's wedding invite — a static website (plain HTML, CSS and JavaScript) hosted on GitHub Pages, with RSVPs saved to a Google Sheet through a Google Apps Script web app.

There is no build step, no package manager and no framework. What is in the repo is exactly what gets served.

- **Repo:** https://github.com/vishu-gagan/she-danced-he-scored
- **Combined invite (Punjab wedding + Goa reception):** https://vishu-gagan.github.io/she-danced-he-scored/
- **Goa-only invite:** https://vishu-gagan.github.io/she-danced-he-scored/goa/

## Contents

- [Folder structure](#folder-structure)
- [How the pieces fit together](#how-the-pieces-fit-together)
- [Running locally](#running-locally)
- [Making a change and merging to main](#making-a-change-and-merging-to-main)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Deploying the Apps Script to the Google Sheet](#deploying-the-apps-script-to-the-google-sheet)

## Folder structure

```
.
├── index.html                    # Combined invite: Punjab wedding + Goa reception, both RSVP forms
├── styles.css                    # Styles for the combined invite (light and dark themes)
├── intro.css                     # Opening envelope animation styles — shared by both pages
├── intro.js                      # Opening envelope animation logic — shared by both pages
├── goa/
│   ├── index.html                # Goa-only invite
│   ├── goa.css                   # Styles for the Goa-only invite
│   └── goa.js                    # Goa-only RSVP form: validation and submit
├── images/                       # Photos, envelope and seal artwork
├── rsvp-google-apps-script.gs    # Source of the Apps Script that writes RSVPs to the Google Sheet
├── .github/workflows/deploy.yml  # GitHub Actions workflow that deploys main to GitHub Pages
└── .claude/CLAUDE.md             # Project rules for Claude Code
```

Things worth knowing before you edit:

- **`index.html` holds its own JavaScript.** The theme toggle and both RSVP forms live in an inline `<script>` block near the bottom of the file, not in a separate `.js` file.
- **`intro.css` and `intro.js` are shared.** `goa/index.html` loads them as `../intro.css` and `../intro.js`, so a change to the opening animation affects both invites. Check both pages.
- **`rsvp-google-apps-script.gs` is not run by the website.** It is the version-controlled copy of code that runs inside the Google Sheet. Editing it here changes nothing until you paste it into Apps Script and redeploy (see [below](#deploying-the-apps-script-to-the-google-sheet)).

## How the pieces fit together

```
Guest's browser ──(page load)──▶ GitHub Pages  (static files from main)
       │
       └──(RSVP submit, POST JSON)──▶ Apps Script web app ──▶ Google Sheet
                                                               ├── "Punjab" tab
                                                               └── "Goa" tab
```

Each RSVP form sends a JSON payload with a `sheet` field (`"Punjab"` or `"Goa"`). The Apps Script uses it to pick the tab and appends one row.

The web app URL is hardcoded in **two** places, and both must match:

| File | Variable |
| --- | --- |
| `index.html` | `RSVP_ENDPOINT_URL` |
| `goa/goa.js` | `endpoint` |

The request is sent in `no-cors` mode, so the browser cannot read the response. The site shows its thank-you message as soon as the request is sent, whether or not the row was written. The only real confirmation is a new row in the sheet.

## Running locally

Serve the repo root with any static file server:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/ — combined invite
- http://localhost:8000/goa/ — Goa-only invite

Use a server rather than opening the files directly, so relative paths such as `../intro.js` resolve the same way they do on GitHub Pages.

The opening animation plays once per browser session on the combined invite. To control it while testing:

- `?intro` — always play it
- `?nointro` — skip it

> **RSVP forms are live, even locally.** They post to the real Google Sheet. If you submit a test RSVP, use an obvious name such as "TEST" and delete the row from the sheet afterwards.

## Making a change and merging to main

`main` is the live site: every push to it deploys. Do feature work on a branch and merge through a pull request.

1. Start from an up-to-date `main`:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a branch. Use a short prefixed name such as `feat/...`, `fix/...` or `docs/...`:

   ```bash
   git checkout -b feat/short-description
   ```

3. Make your change and check it locally (see [Running locally](#running-locally)). Before you commit, check:

   - both pages, if you touched `intro.css`, `intro.js` or anything in `images/`
   - a phone-width viewport as well as desktop
   - light and dark themes on the combined invite
   - both RSVP forms, if you touched a form (see the note above about test rows)

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — for example `feat: add login button`, `fix: correct Goa venue time`, `docs: update readme`:

   ```bash
   git add -A
   git commit -m "feat: short description of the change"
   ```

5. Push the branch and open a pull request into `main`:

   ```bash
   git push -u origin feat/short-description
   ```

   ```bash
   gh pr create --base main --fill
   ```

   You can also open the pull request from the GitHub website.

6. Review the diff, then merge the pull request on GitHub. Merging triggers the deploy.

7. Tidy up locally:

   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/short-description
   ```

Avoid committing straight to `main` or merging into it locally — anything pushed to `main` goes live within a minute or two.

## Deploying to GitHub Pages

Deployment is automatic and only happens from `main`. The workflow in `.github/workflows/deploy.yml` runs on every push to `main`, uploads the whole repo root as the site, and publishes it. Other branches are never deployed.

**To deploy:** merge your pull request into `main`. Nothing else is needed.

**To check a deploy:**

1. Open the **Actions** tab of the repo and find the latest **Deploy static content to Pages** run.
2. Wait for the green tick — usually about a minute. The run summary shows the live URL.
3. Open the live site and hard-refresh (Cmd+Shift+R) to get past the browser cache.

**To redeploy without a new commit:** Actions → **Deploy static content to Pages** → **Run workflow** → select the `main` branch → **Run workflow**. Always choose `main` here.

**One-time repo setup** (already done; listed in case the repo is ever recreated):

- **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**.
- **Settings → Environments → github-pages → Deployment branches** allows only `main`. This is what blocks a manual run from another branch.

Because the whole repo root is published, every committed file is publicly reachable by URL. Never commit anything private.

## Deploying the Apps Script to the Google Sheet

The script is "container-bound": it lives inside the RSVP Google Sheet and is edited in the browser. There is no automated deploy — you copy `rsvp-google-apps-script.gs` in by hand. You need edit access to the sheet.

### Updating the existing script (the usual case)

1. Change `rsvp-google-apps-script.gs` in the repo and merge it to `main` through a pull request, like any other change. The repo copy is the source of truth.
2. Open the RSVP Google Sheet, then **Extensions → Apps Script**.
3. Replace the entire contents of the editor with the contents of `rsvp-google-apps-script.gs`, and save (Cmd+S).
4. Click **Deploy → Manage deployments**.
5. Select the existing web app deployment and click the pencil (edit) icon.
6. Set **Version** to **New version**, then click **Deploy**.

Step 6 is the one people miss: saving the code does **not** update the live web app. The live URL keeps running the old version until you publish a new version.

Editing the existing deployment keeps the same web app URL, so the website needs no change. Do not use **New deployment** for an update — it creates a different URL, and the site would keep posting to the old one.

7. Test it: submit a test RSVP from each form and confirm a new row lands in the right tab. Delete the test rows.

### If you add, remove or reorder a field

Three things must stay in step:

- the form field and JSON payload on the website (`index.html` for Punjab and the combined Goa form, `goa/goa.js` for the Goa-only form)
- the `appendRow([...])` list in `rsvp-google-apps-script.gs`
- the header row of the matching tab in the Google Sheet

`appendRow` writes by position, not by header name, so the order in the script must match the column order in the sheet.

### Setting up from scratch (new sheet)

1. Create a new Google Sheet with two tabs named exactly `Punjab` and `Goa`.
2. Add the header row to each tab.

   **Punjab:**
   `Submitted At | Name | Contact | Response | Number of Guests | Guest Names & Ages | Arrival Date | Departure Date | Mode of Travel | Flight/Train Number | Number of Nights | Food Preference | Special Requirements | Note for Couple`

   **Goa:**
   `Submitted At | Name | Contact | Response | Number of Guests | Note for Couple`

3. Go to **Extensions → Apps Script**, delete the starter code, and paste in all of `rsvp-google-apps-script.gs`.
4. Click **Deploy → New deployment**, click the gear icon next to **Select type** and choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**, then **Authorize access**, and approve the permissions.
6. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).
7. Paste it into both places on the website — `RSVP_ENDPOINT_URL` in `index.html` and `endpoint` in `goa/goa.js` — then merge that change to `main` so it deploys.

### Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Site says thank you but no row appears | The script was saved but no new version was deployed, or the site points at an old web app URL |
| Rows appear in the wrong columns | `appendRow` order does not match the sheet's header order |
| Nothing is written for one event | The tab is not named exactly `Punjab` or `Goa` |
| Still stuck | In the Apps Script editor, open **Executions** to see each request and any error |
