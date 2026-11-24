# FraudShield AI — Firestore Security Specification (Phase 0)

## Data Invariants
1. **Default Deny**: All unspecified document paths deny reads and writes.
2. **Verified Authentication**: Every client read/write requires `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Identity & Ownership**: Every `/transactions/{transactionId}`, `/fraudRules/{ruleId}`, and `/modelConfigs/{configId}` document MUST set `ownerId == request.auth.uid` on creation and preserve `ownerId` immutably on update.
4. **PII Isolation**: User email, displayName, and photoURL live exclusively under `/users/{userId}/private/{docId}` and are accessible only to `isOwner(userId)` or `isAdmin()`.
5. **Anti-Update-Gap & Strict Keys**: Every `create` validates exact `hasAll` + `hasOnly` keys and types/sizes; every `update` runs `isValid[Entity](incoming())` AND uses action-specific `affectedKeys().hasOnly(...)` allowlists.
6. **Privilege Escalation Guard**: Client writes to `/admins/{adminId}` are forbidden (`allow write: if false`). Users creating `/users/{userId}/private/profile` MUST set `role == 'analyst'` and cannot elevate `role` on update.
7. **Terminal State Locking**: Once a transaction's `verificationResult.decision` is `'GENUINE_APPROVED'` or `'FRAUD_BLOCKED'`, non-admin users cannot re-open or alter `status`, `riskLevel`, or `verificationResult`.
8. **Temporal Integrity**: `createdAt == request.time` on create (immutable on update) and `updatedAt == request.time` on create and update.

## Dirty Dozen Adversarial Payloads (Must All Yield PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Reading `/transactions` or creating `/transactions/TXN_01` with `request.auth == null`.
2. **Unverified Email Spoofing**: Request with `request.auth.token.email == 'saranyasasikumarsaranya@gmail.com'` and `request.auth.token.email_verified == false`.
3. **Cross-Tenant List Scraping**: Authenticated user `userB` calling `list` on `/transactions` without `where('ownerId', '==', 'userB')`.
4. **Cross-Tenant Ownership Spoof**: User `userA` creating `/transactions/TXN_SPOOF` with `ownerId: 'userB'`.
5. **Shadow / Ghost Field Injection**: Creating a transaction with an unexpected extra key `isAdminOverride: true`.
6. **Self-Assigned Admin Escalation**: User `userA` writing to `/admins/userA` or setting `role: 'admin'` on `/users/userA/private/profile`.
7. **Cross-User PII Read**: User `userB` attempting `get` on `/users/userA/private/profile`.
8. **Path ID Poisoning**: Creating `/transactions/..$invalid!id..` or an ID exceeding 64 characters.
9. **Denial-of-Wallet String/Array Flooding**: Creating a transaction with `merchant` > 160 chars or `riskFactors` > 16 items or `riskFactors[0]` being a number instead of string.
10. **Immutable Field Tampering**: Updating `createdAt` or `ownerId` on an existing `/transactions/{id}` document.
11. **Terminal State Bypass**: Non-admin user flipping an already-verified `'Blocked'` (`verificationResult.decision == 'FRAUD_BLOCKED'`) transaction back to `'Approved'`.
12. **Client Timestamp Forgery**: Creating a `/fraudRules/{ruleId}` document with a forged past `createdAt` string instead of `serverTimestamp()`.
