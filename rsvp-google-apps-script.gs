/**
 * Google Apps Script — RSVP Google Sheet writer for Gagan & Vishu's wedding site.
 *
 * ── SETUP (one-time) ──────────────────────────────────────────────────────
 *
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    (e.g. name it "Wedding RSVPs").
 *
 * 2. In that spreadsheet, create two sheets: "Punjab" and "Goa".
 *
 * 3. In the Punjab sheet, row 1, add these column headers:
 *    Submitted At | Name | Contact | Response | Number of Guests | Guest Names & Ages |
 *    Arrival Date | Departure Date | Mode of Travel | Flight/Train Number |
 *    Number of Nights | Food Preference | Special Requirements | Note for Couple
 *
 * 4. In the Goa sheet, row 1, add these column headers:
 *    Submitted At | Name | Contact | Response | Number of Guests | Note for Couple
 *
 * 5. In that spreadsheet, go to Extensions > Apps Script.
 *
 * 6. Delete whatever starter code is there and paste in this entire file.
 *
 * 7. Click "Deploy" > "New deployment".
 *      - Click the gear icon next to "Select type" and choose "Web app".
 *      - Description: RSVP endpoint (or anything you like).
 *      - Execute as: Me.
 *      - Who has access: Anyone.
 *    Click Deploy, then click "Authorize access" and approve the permissions —
 *    this script only ever touches this one spreadsheet.
 *
 * 8. Copy the "Web app URL" shown after deploying. It looks like:
 *    https://script.google.com/macros/s/AKfycb.../exec
 *
 * 9. Open index.html, find this line near the top of the main <script> block:
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
  var data = JSON.parse(e.postData.contents);
  var sheetName = data.sheet || 'Punjab';
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var timestamp = data.submittedAt || new Date().toISOString();

  if (sheetName === 'Punjab') {
    sheet.appendRow([
      timestamp,
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
      data.specialRequirements || '',
      data.noteForCouple || ''
    ]);
  } else if (sheetName === 'Goa') {
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.contact || '',
      data.response || '',
      data.numGuests || '',
      data.noteForCouple || ''
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
