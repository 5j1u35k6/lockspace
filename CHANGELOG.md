# Changelog

## 0.10.1 - 2026-09-24

### Changed

- Browser tab titles now follow the current Lockspace page, including member home, verification task, feedback, admin, privacy, and terms pages.
- Synchronized visible page-version metadata across the static pages.

## 0.10.0 - 2026-09-24

### Added

- Expanded the built-in action task pool to 180 clearly written tasks.
- Added seven internal action categories: standing, kneeling, floor poses, mirror, props, embarrassment, and obedience.

### Changed

- Reworked action-task instructions around private-space chastity-lock verification with clearer body-position and photo requirements.
- Excluded public exposure, dangerous restraint, breathing restriction, and other high-risk tasks.

## 0.9.1 - 2026-09-24

### Fixed

- Fixed first-time daily-task loading when the member's daily task document does not yet exist.
- Removed legacy verification-code-paper instructions from action-only tasks, including already-created daily tasks.

### Changed

- Clarified the daily task model as exactly one of three categories: verification code, built-in action, or approved member idea.
- Moved member task-idea submission to the signed-in home page.
- Expanded the built-in action task pool.

## 0.9.0 - 2026-09-24

- Added per-member daily task selection across verification codes, built-in actions, and approved member ideas.
- Added alphanumeric six-character codes that remain fixed for each member for the day.
- Added member task-idea submission and administrator approval, rejection, and deletion controls.
- Renamed the profile label from penile circumference to penile thickness.

Lockspace uses semantic versioning: `major.minor.patch`.

- Major: incompatible API or data-contract changes.
- Minor: backward-compatible feature additions.
- Patch: backward-compatible fixes.

## 0.8.0 - 2026-09-24

### Added

- Added a notification center to the signed-in navigation bar.
- Added unread indicators for releases and administrator feedback replies.
- Added release history and version-number guidance inside notifications.

### Changed

- Moved the feedback page's home link to the upper-left corner.

## 0.7.2 - 2026-09-24

### Added

- Added public member-profile viewing from verification task publishers.
- Added administrator feedback replies and member notifications.
- Added privacy policy and terms pages.

### Fixed

- Stabilized authentication loading to prevent login/dashboard flicker.
