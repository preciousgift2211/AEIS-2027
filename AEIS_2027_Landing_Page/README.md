# AEIS 2027 Landing Page

A responsive public-facing landing page for the Africa Education & Innovation Summit 2027.

## Files
- `index.html` — page structure and content
- `style.css` — responsive styling and dark/light themes
- `script.js` — navigation, theme switch, FAQ accordion, registration flows and modals

## Run it in VS Code
1. Extract `AEIS_2027_Landing_Page.zip`.
2. Open the extracted folder in VS Code.
3. Open `index.html` in a browser, or use the Live Server extension.
4. Keep all three files in the same folder.
5. Keep an internet connection available for Google Fonts, Font Awesome and the QRCode.js library.

## Included features
- Responsive desktop, tablet and mobile layouts
- Dark navy/cyan theme and light white/gold theme; the selection is saved in the browser
- Mobile navigation menu and FAQ accordion
- Summit details, initiatives, participation categories, sponsorship packages and contact information
- Speakers and host profile gallery with clearly marked sample portrait placeholders
- Free general attendee registration generates a unique demo QR pass immediately, with print and QR-download controls
- Paid Future Tech Innovation Challenge registration displays a unique pending reference but does NOT issue a QR pass
- School and institution registration display unique pending references but do NOT issue QR passes
- Sponsorship enquiry opens a pre-filled Gmail compose draft addressed to `info@tech2grassroots.africa`; the visitor reviews it and presses Send

## Payment and QR ticket rules in this version
Paystack is intentionally NOT connected yet.

- General Attendee (free): a QR pass is generated after the form validates.
- Future Tech Innovation Challenge (₦5,000): registration is marked as awaiting payment; no QR pass is generated.
- School Exhibition + Workshop (₦15,000): registration is marked as awaiting payment; no QR pass is generated.
- Institution Participation + Exhibition (₦30,000): registration is marked as awaiting payment; no QR pass is generated.
- Paid QR passes must only be issued after a future backend verifies successful payment. Do not issue them based only on a user clicking a button or returning from a payment page.
- Speaker and panelist participation is by invitation; the form does not create an attendee QR pass for this enquiry.
- Sponsorship enquiries are separate from attendee ticketing and open a pre-filled Gmail draft. The sponsor must press Send.

The pending references and free QR pass are browser-side demonstrations. Form submissions are not stored in a server database or Admin HQ. Browser-generated QR codes are not secure check-in credentials. Before the event, connect a backend and database, create IDs server-side, store registrations, verify payments on the server, and validate each QR code at check-in. A ticket should also be marked as checked in after it is scanned.

## Future Paystack integration point
After Paystack is added, the backend should:
1. Create a pending registration and unique registration reference.
2. Initiate Paystack payment from the server.
3. Verify payment server-side using the Paystack transaction verification API or a validated webhook.
4. Mark the registration as paid in the database.
5. Only then create/activate the ticket ID and QR pass and send/show it to the registrant.

Do not put Paystack secret keys in browser JavaScript.

## Content notes
- Venue is shown as "To be announced".
- Speaker names are not invented. The speaker and host gallery uses clearly disclosed sample portraits and generic profile labels; replace them with confirmed names, biographies and approved photos before publishing.
- Participation prices and event details are based on the information supplied for AEIS 2027.
- UOP.Academy is linked to `https://uop.academy/`; update this link if the official destination changes.

## Sponsorship email flow
The sponsor enquiry form validates required fields, then opens Gmail Compose with the organisation, contact name, email, phone, selected sponsorship package, support type and additional message filled in. The recipient is `info@tech2grassroots.africa`. The visitor must review and send the email; the website does not send it automatically.
