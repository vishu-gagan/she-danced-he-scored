/**
 * Google Apps Script — RSVP Google Sheet writer for Gagan & Vishu's wedding site.
 *
 * ── SETUP (one-time) ──────────────────────────────────────────────────────
 *
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    (e.g. name it "Wedding RSVPs").
 *
 * 2. In row 1, add these column headers, in this exact order:
 *    Submitted At | Name | Contact | Response | Number of Guests | Guest Names & Ages |
 *    Arrival Date | Departure Date | Mode of Travel | Flight/Train Number |
 *    Number of Nights | Food Preference | Special Requirements
 *
 * 3. In that spreadsheet, go to Extensions > Apps Script.
 *
 * 4. Delete whatever starter code is there and paste in this entire file.
 *
 * 5. Click "Deploy" > "New deployment".
 *      - Click the gear icon next to "Select type" and choose "Web app".
 *      - Description: RSVP endpoint (or anything you like).
 *      - Execute as: Me.
 *      - Who has access: Anyone.
 *    Click Deploy, then click "Authorize access" and approve the permissions —
 *    this script only ever touches this one spreadsheet.
 *
 * 6. Copy the "Web app URL" shown after deploying. It looks like:
 *    https://script.google.com/macros/s/AKfycb.../exec
 *
 * 7. Open index.html, find this line near the top of the main <script> block:
 *      var RSVP_ENDPOINT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
 *    and replace the placeholder string with the URL you just copied.
 *
 * ── IMPORTANT: updating this script later ───────────────────────────────────
 * If you ever edit this file (e.g. to add a column), the live Web app URL will
 * NOT pick up the change automatically. You must go to "Deploy" > "Manage
 * deployments" > click the pencil/edit icon on the existing deployment >
 * change Version to "New version" > Deploy. Only then does the change go live.
 *
 * ── NOTE on the "no-cors" request from the website ──────────────────────────
 * The site sends this request in "no-cors" mode, which means the browser can't
 * read Google's response (a CORS quirk of Apps Script web apps). The website
 * shows a "Thank you" message as soon as the request is sent, without waiting
 * for confirmation it succeeded. If you want to double check things are
 * working, submit a test RSVP from the site and check that a new row appears
 * in your spreadsheet.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    data.contact || '',
    data.response || '',
    data.numGuests || '',
    data.guestDetails || '',
    data.arrivalDate || '',
    data.departureDate || '',
    data.travelMode || '',
    data.travelNumber || '',
    data.numNights || '',
    data.foodPreference || '',
    data.specialRequirements || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
