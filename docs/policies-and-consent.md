# Policies and consent

The public policy pages are served from `client/src/pages/public/PolicyPage.jsx` under `/policies/:slug`. The footer links to each page, registration requires the current account policy versions, educator applications require the educator agreement version, and joining a live room requires a Community Code acknowledgement.

## Policy content and review

The current pages are written in English for initial Ethiopia-focused use. They are not legal advice. Review the Terms, Privacy Policy, child-safety process, educator agreement, refunds, and dispute clauses against the operator's actual practices and applicable law. Prepare reviewed Amharic and Afaan Oromo translations for users who need those languages.

The current proposed guardian process asks an adult who claims to be the minor's parent or legal guardian to enter their name/email and check a declaration. It is a self-attestation only: the app does not verify the guardian's identity, email, or authority. Do not describe this as verified parental consent or rely on it as legally sufficient without counsel's approval.

## Updating policy versions

`server/config/policyVersions.js` is the authoritative server-side version check. Keep its values synchronized with `client/src/config/policyVersions.js` and the version label selected in `PolicyPage.jsx`. Bump a version whenever its policy meaningfully changes. New registrations and educator applications are rejected when they submit a stale or missing version.

Account acceptance records are stored on the `User` document with the policy name, version, and server-generated acceptance time. Educator-specific version and timestamp records are stored on the teacher or live-tutor application. Guardian contact and attestation data are private user fields and are excluded from the `/auth/me` response.

Refund timing, privacy/vendor disclosures, retention periods, and processing regions should match the operator's actual practices. The application does not enforce refund eligibility rules; support requests are handled through the in-app admin conversation, with email notifications sent to the recipient admin account when email delivery is configured.
