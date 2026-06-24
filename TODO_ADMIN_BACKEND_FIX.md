# Admin backend notes

- `GET /api/admin/metrics` currently estimates `month_revenue` using last 30 days and Payment.paid_at.
- Fixed: changed from `datetime.utcnow().timestamp() - 30 * 24 * 3600` (float comparison) to `datetime.utcnow() - timedelta(days=30)` using proper SQLAlchemy datetime comparison.

