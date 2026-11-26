# AEIS 2027 Admin HQ

A responsive frontend dashboard starter matching the AEIS 2027 HQ visual direction.

## Run it
1. Extract the ZIP file.
2. Open `index.html` in a browser, or open the folder in VS Code and use Live Server.
3. Use the left sidebar to switch between dashboard sections.
4. Use the theme button to switch between dark and light themes.

## Included
- Responsive sidebar that works independently of the main content.
- Dashboard overview and five headline metrics.
- Separate school, individual, institution and sponsorship pages.
- Searchable tables, record detail modal and CSV export.
- Analytics chart, notifications and notification preferences.
- Dark and light themes.
- Demo data is stored in browser localStorage.

## Important: connect the real backend
This is a frontend prototype. It does not yet receive submissions from your public website, authenticate administrators, or count real website visitors.

The `addRegistration(category, record)` function in `script.js` is a small integration hook. After your Express API successfully saves a registration, call it with one of:
- `schools`
- `individuals`
- `institutions`
- `sponsors`

For a real deployment:
- Save submissions in a database through your Node.js/Express API.
- Fetch dashboard records from protected admin API endpoints.
- Add secure admin login and role checks on the server.
- Track website visits through a backend analytics endpoint; do not rely on a browser-only counter.
- Send email/push notifications from the backend if required.

Never expose database credentials or admin secrets in frontend JavaScript.

## Open the public AEIS landing page from Admin HQ
The sidebar now contains a **The Event** link. It opens the public landing page at `../AEIS_2027_Landing_Page/index.html`. The dashboard feature card uses the same destination.

Keep both project folders next to each other inside the same parent folder:
- `aeis_2027_admin_hq/`
- `AEIS_2027_Landing_Page/`

For example, extract both folders into one `AEIS_2027` folder. Then start Live Server from the Admin HQ `index.html`; the **The Event** link will open the landing page. If you move or rename either folder, update the relative link in the Admin HQ `index.html`.
