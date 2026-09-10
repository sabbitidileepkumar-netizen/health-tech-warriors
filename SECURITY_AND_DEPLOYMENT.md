# SIH deployment checklist

## Privacy and roles

The React interface filters citizen data by `patientId`/profile identity. Deploy `firestore.rules` before a public demo so Firestore also enforces that separation. New citizen-owned records must carry `patientId: FirebaseAuth.uid`; migrate legacy demo records before enabling the strict rules.

## Required configuration

- Firebase Authentication: enable Email/Password and Google; authorize localhost and the Vercel domain.
- Firestore: deploy `firestore.rules`, then verify a citizen cannot read another account's appointment or health record.
- Vercel: set `GEMINI_API_KEY`; optional `GEMINI_MODEL=gemini-3.6-flash`.

## Accurate SIH claim

The FHIR JSON export is FHIR R4-compatible and supports an interoperability demonstration. It is not a live ABDM/ABHA integration. Live ABHA connectivity needs approved credentials and consent workflows.
