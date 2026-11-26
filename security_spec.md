# TypeStrike Firestore Security Specification

## Data Invariants
1. Every operative call-sign in `/operatives/{callSign}` is strictly unique (`allow create` only; `update` and `delete` denied), keyed by normalized uppercase `^[A-Z0-9_]{2,14}$`, and immutable once claimed.
2. No leaderboard entry in `/leaderboards/{entryId}` may exist without a registered operative in `/operatives/{name}` (`exists(...)` enforced on create), and `entryId` must equal `${mode}_${name}` so each user appears at most once per mode.
3. Leaderboard updates are restricted to the original `ownerHash`, cannot mutate `name`, `mode`, or `ownerHash`, cannot reduce `score`, and strictly enforce `affectedKeys().hasOnly(['score', 'wpm', 'acc', 'time', 'updatedAt'])` and `updatedAt == request.time`.
4. Zero PII (`email`, `phone`, `address`) is stored in Firestore.

## Adversarial Payloads Tested
1. Duplicate operative registration (overwrite existing `/operatives/CYBER_VIPER`) -> DENIED (`allow update: if false`).
2. Oversized or invalid call-sign ID (1KB string or special characters) -> DENIED (`isValidCallSign`).
3. Shadow field injection on operative (`isAdmin: true`) -> DENIED (`keys().hasOnly(...)`).
4. Forged client timestamp on operative (`createdAt: "2020-01-01"`) -> DENIED (`createdAt == request.time`).
5. Unbounded list scraping of `/operatives` -> DENIED (`allow list: if false`).
6. Leaderboard entry for unclaimed operative -> DENIED (`exists(...)`).
7. Duplicate leaderboard entry ID mismatch (`arcade_FAKE` with `name: "REAL"`) -> DENIED (`entryId == mode + '_' + name`).
8. Invalid game mode (`mode: "godmode"`) -> DENIED (`mode in [...]`).
9. Shadow field injection on leaderboard update (`verified: true`) -> DENIED (`affectedKeys().hasOnly(...)`).
10. Score downgrade or impossible negative score (`score: -500`) -> DENIED (`score >= 0` & `incoming().score >= existing().score`).
11. Hijacking another player's leaderboard entry (changing `ownerHash` or `name`) -> DENIED (`incoming().ownerHash == existing().ownerHash`).
12. Deleting an operative or leaderboard record -> DENIED (`allow delete: if false`).
