## Architecture rules
- Keep login presentation in the login page and use global semantic tokens for its image overlay; preserve the existing authentication service when updating the design.
- Route login through the KYC-only helper in the profile module and render the client dashboard directly; this portal has no role-selected experiences.
- Render records from existing API modules without sample-data fallbacks; unavailable services must show an error or empty state, not fabricated records.