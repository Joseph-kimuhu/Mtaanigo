# MtaaniGo - Admin Control Panel Implementation

## Plan (approved)
1. Wire existing backend endpoints into the AdminDashboard UI for all current sidebar menus (data-driven pages, real tables/forms, action buttons where backend supports).
2. Replace hardcoded dashboard charts and recent activity with backend-driven data.
3. Add missing UI wiring for menus that currently show placeholders (Bookings, Companies, Services, Coupons, Announcements, Disputes, Reports, Audit Logs) using existing `adminService` calls.
4. Add lightweight client-side filtering/search where backend doesn’t yet support query params.
5. Add “stage list” notes for features that need backend work (dispute evidence/chat/photos, verification center docs, withdraw requests, roles/permissions, fraud detection, system settings, report exports).
6. Validate by running frontend build + manual API checks.

## Step Tracker
- [ ] Step 1: Update TODO structure complete
- [ ] Step 2: Refactor/upgrade AdminDashboard UI to be data-driven
- [ ] Step 2.1: Replace hardcoded dashboard charts with admin reports/audit logs

- [ ] Step 3: Implement missing menu sections with action buttons using existing endpoints
- [ ] Step 3.1: Add Disputes/Coupons/Announcements/Categories/Bookings UI actions wired to adminService

- [ ] Step 4: Dashboard charts + recent activity from metrics/reports/audit logs
- [ ] Step 5: Add client-side search/filter/export (where possible)
- [ ] Step 6: Ensure no runtime errors; run `npm run build` for frontend
- [ ] Step 7: Document staged backend gaps

