## Family Sharing Feature

### How it works
1. **Parent A** (the "owner") taps "Invite Co-Parent" and enters their partner's email
2. **Parent B** receives an invitation (shown in-app when they log in)
3. Once accepted, Parent B sees all of Parent A's child profiles, timers, and usage data
4. Both parents can start/stop timers and view stats — fully synced via Lovable Cloud

### Database changes
- New **`family_invites`** table — stores pending/accepted invitations between two users
- New **`family_members`** table — links users who share access (owner + member)
- Update RLS policies on `usage_logs`, `rewards`, `schedule_settings` so family members can read/write shared data

### UI changes
- **Invite Co-Parent** button in Settings/Profile area
- **Pending invitations** banner when a user has an invite waiting
- **Family badge** showing who's connected

### Premium gating
- The invite flow will check a `is_premium` flag (defaulting to `true` for now so you can test)
- When Stripe is added later, we'll tie this flag to an active subscription

### What stays the same
- Child profiles still work as they do now
- Single-parent usage is unchanged
- All existing data is preserved

Shall I proceed?