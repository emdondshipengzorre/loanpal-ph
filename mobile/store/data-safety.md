# Google Play Data Safety Questionnaire Answers

Use these answers when filling out the Data Safety form in Google Play Console.

---

## Does your app collect or share any of the required user data types?
**Yes**

---

## Data Collection

### Personal info
- **Phone number**: Collected (for OTP authentication)
  - Purpose: App functionality (account creation and sign-in)
  - Required: Yes (unless using Google sign-in)
  - Encrypted in transit: Yes
  - Can user request deletion: Yes (account deletion in Settings)

- **Email address**: Collected (for Google sign-in users only)
  - Purpose: App functionality (account creation and sign-in)
  - Required: No (alternative to phone OTP)
  - Encrypted in transit: Yes
  - Can user request deletion: Yes

### Financial info
- **User payment info**: Collected
  - What: Loan amounts, bill amounts, payment records (user-entered, not payment card data)
  - Purpose: App functionality (core loan/bill tracking feature)
  - Required: Yes
  - Encrypted in transit: Yes
  - Can user request deletion: Yes

### Photos and videos
- **Photos**: Collected (temporarily, for OCR scanning only)
  - Purpose: App functionality (scanning loan documents to extract text)
  - Processing: On-device only via ML Kit, images are NOT uploaded or stored
  - Required: No (optional feature)
  - Encrypted in transit: N/A (never transmitted)
  - Can user request deletion: N/A (not stored)

### Device or other IDs
- **Device IDs**: Not collected

---

## Data Sharing

### Is any user data shared with third parties?
**No** — We do not share any user data with third parties.

Note: Supabase is used as our backend infrastructure provider (data processor, not a third party receiving data for their own purposes). This is disclosed in the privacy policy.

---

## Security Practices

### Is all user data encrypted in transit?
**Yes** — All data transmitted between the app and our servers uses HTTPS/TLS encryption.

### Do you provide a way for users to request that their data be deleted?
**Yes** — Users can delete their account and all associated data from the Settings screen within the app. This is a Google Play requirement.

---

## Data Handling Summary Table

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Phone number | Yes | No | Authentication | No* |
| Email | Yes | No | Authentication | Yes |
| Financial records | Yes | No | Core feature | No |
| Photos | Yes (temp) | No | OCR scanning | Yes |
| Device IDs | No | No | — | — |
| Location | No | No | — | — |
| Browsing history | No | No | — | — |
| Contacts | No | No | — | — |

*Phone is required only if not using Google sign-in
