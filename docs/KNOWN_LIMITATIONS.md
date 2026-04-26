# Known Limitations & Roadmap

**Last Updated**: 2026-04-26  
**Phase**: MVP Phase 1  
**Status**: Feature-complete for MVP, production-ready with caveats

---

## Overview

AIStudy MVP is a working learning platform with core flows. This document outlines what's **not** implemented yet and why, plus the Phase 2+ roadmap.

---

## Known Limitations

### Phase 1 MVP Scope (Implemented)

✅ **Auth & Accounts**
- Email signup/login (Supabase)
- Session persistence
- User profiles
- Role-based admin access

✅ **Content Management**
- Create/edit workbooks
- Add questions with multiple choice
- Publish for sharing
- Fork workbooks
- Comments (flat, not threaded deeply)

✅ **Learning Experience**
- Practice mode (timed + untimed)
- Practice exams
- Attempt tracking
- Immediate feedback
- Score reporting

✅ **Gamification**
- 12 badge types
- XP tracking
- Learning analytics dashboard
- Badge collection

✅ **Notifications**
- In-app notification system
- 10 notification types
- Read/unread tracking
- Navigation to relevant content

✅ **Admin & Governance**
- Admin dashboard
- Report moderation
- Workbook curation
- Question management
- Basic audit logging

---

## Not Implemented (Planned for Phase 2+)

### Mobile App

**Issue**: Web-only right now.

**Impact**: Users must use desktop/tablet for full functionality.

**Timeline**: Phase 2 (Q2 2026)
- Expo React Native app
- Shared TypeScript types via monorepo
- Feature parity with web
- iOS + Android

**Workaround**: PWA (progressive web app) not enabled yet; use responsive web on mobile.

---

### AI-Powered Features (P13 Onwards)

**Issue**: `POST /api/study/ai-generate/upload` and `/process` exist but are scaffolds.

**Impact**: Cannot import PDFs or generate workbooks from text yet.

**What's missing**:
- PDF parsing (we'd use pdf2json or similar)
- LLM-powered question generation (Claude API or GPT-4)
- OCR for scanned PDFs
- Auto-concept extraction

**Timeline**: Phase 2 (Q2 2026) - `P13-A: AI PDF to Workbook Pipeline`

**Current state**:
- API routes exist and are protected
- Frontend form exists at `/study/generate`
- Backend can receive uploads
- Job queue infrastructure needs to be built

---

### Real-Time Features

**Issue**: No WebSocket subscriptions for live updates.

**Impact**:
- Comments don't appear for other users until page reload
- No live leaderboard updates
- No push notifications
- Notifications list requires manual refresh

**Timeline**: Phase 2 (Q2 2026) - `P14: Realtime Updates`

**What's missing**:
- Supabase Realtime integration
- tRPC subscriptions
- WebSocket middleware
- Client-side listener setup

**Workaround**: User can manually refresh page to see updates.

---

### Advanced Notifications

**Issue**: Current notifications are basic (no email, no push to phone, no grouping).

**Impact**:
- Users must check in-app bell to be aware
- No email digests
- No mobile push (Phase 2)
- No notification preferences

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Email service integration (SendGrid/Mailgun)
- Push notification service (Firebase Cloud Messaging)
- Notification preferences UI
- Digest scheduling (daily/weekly summaries)

---

### User Management (Admin)

**Issue**: Limited admin self-service for user management.

**Impact**:
- Cannot promote/demote users without DB access
- Cannot disable abusive users
- Cannot ban users
- Role changes require platform owner

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- User listing in admin panel
- Bulk user actions
- Ban/suspend functionality
- Role assignment UI
- User activity logs

---

### Appeal System

**Issue**: No way for users to appeal moderation decisions.

**Impact**: Deleted content or account issues cannot be reviewed.

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Appeal form UI
- Appeal queue in admin panel
- Higher-tier review workflow
- Communication back to users

---

### Advanced Search

**Issue**: Search is basic keyword-only (not full-text indexed).

**Impact**:
- No fuzzy matching
- No synonym support
- Slower on large datasets
- No ranking by relevance

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- PostgreSQL full-text search (tsvector, GIN indexes)
- Elasticsearch integration (if scaling further)
- Synonym/thesaurus support
- Relevance ranking algorithm

---

### Bulk Actions

**Issue**: Admin cannot bulk-delete, bulk-edit, or bulk-resolve reports.

**Impact**: 
- Spam influx requires clicking each item individually
- Slow moderation for large incidents
- Admin time inefficient

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Multi-select checkboxes in tables
- Bulk action buttons (delete, feature, resolve, etc.)
- Confirmation dialogs for safety
- Undo for bulk actions

---

### Soft Deletes & Restore

**Issue**: Deleted content is permanent (no 30-day trash bin).

**Impact**: 
- Admin cannot recover accidentally deleted content
- No recovery for user-deleted accounts
- Compliance issues (data retention)

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- `deleted_at` timestamp column on tables
- Soft delete logic in queries (WHERE deleted_at IS NULL)
- Trash bin UI for admins
- Restore functionality
- Auto-purge after 30 days

---

### Soft Launch Tooling

**Issue**: No feature flags, A/B testing, or gradual rollout.

**Impact**: New features are all-or-nothing (risky).

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Feature flag service (LaunchDarkly or custom)
- Gradual rollout % (0%, 25%, 50%, 100%)
- A/B test bucketing
- Kill switches
- Dashboards for monitoring flags

---

### Analytics & Monitoring

**Issue**: Limited dashboards for platform metrics.

**Impact**: 
- Can't see user engagement metrics
- Can't track feature adoption
- Can't identify performance issues proactively
- No SLA monitoring

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Grafana/Datadog dashboards
- Key metrics (DAU, MAU, engagement rate, retention)
- Alerts for anomalies
- Performance profiling
- User cohort analysis

---

### Compliance & Privacy

**Issue**: Limited tooling for GDPR/data privacy.

**Impact**:
- No data export (users cannot get their data)
- No right to be forgotten (hard delete)
- No audit trail for sensitive actions
- No DPA (Data Processing Agreement) signed

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Data export UI (JSON, CSV)
- GDPR delete request flow
- Audit logging (more comprehensive)
- Privacy policy UI integration
- CCPA/GDPR compliance checklist

---

### Payment & Monetization

**Issue**: No payment processing or subscriptions.

**Impact**: Platform is free (no revenue yet).

**Timeline**: Phase 3+ (Q3+ 2026)

**What's missing**:
- Stripe/Paddle integration
- Subscription tiers (free, pro, enterprise)
- Payment UI
- Billing dashboard
- Invoice generation

---

### Offline Mode

**Issue**: No offline-first support (requires internet).

**Impact**: Users cannot work offline and sync later.

**Timeline**: Phase 3+ (Q3+ 2026)

**What's missing**:
- Service worker + IndexedDB caching
- Sync queue for offline changes
- Conflict resolution
- Offline indicators in UI

---

### Integrations

**Issue**: No third-party integrations.

**Impact**: Cannot import from Google Sheets, export to LMS, etc.

**Timeline**: Phase 3+ (Q3+ 2026)

**What's missing**:
- Google Classroom/Sheets API
- Canvas LMS integration
- Slack/Teams notifications
- Webhook support for external apps
- OAuth for third-party login

---

### Performance Optimization

**Issue**: No CDN or advanced caching yet.

**Impact**: 
- Media loads slower for geographically distant users
- Database queries not optimized for scale (1M+ users)
- No query result caching

**Timeline**: Phase 2-3 (ongoing)

**What's missing**:
- Cloudflare or Vercel Edge caching
- Redis for session/query cache
- Database query optimization (indexes, denormalization)
- Image optimization (WebP, lazy loading hooks)
- Code splitting beyond Next.js defaults

---

### Internationalization (i18n)

**Issue**: UI is Korean-only; no multi-language support.

**Impact**: Non-Korean users have limited access.

**Timeline**: Phase 3+ (Q3+ 2026)

**What's missing**:
- next-intl or similar library
- Translation strings extraction
- Language switcher UI
- Right-to-left (RTL) support for Arabic, Hebrew
- Date/time localization

---

### Accessibility (a11y)

**Issue**: No comprehensive accessibility audit; some WCAG 2.1 AA gaps.

**Impact**: Users with disabilities may struggle.

**Timeline**: Phase 2 (Q2 2026)

**What's missing**:
- Color contrast improvements (some text may not meet AA)
- Keyboard navigation (some interactive elements not tab-able)
- Screen reader testing
- ARIA labels (some missing)
- Focus indicators (visible focus states)

---

## Workarounds & Mitigations

### For Users

| Limitation | Workaround |
|-----------|-----------|
| No mobile app | Use responsive web on phone/tablet |
| No email notifications | Check in-app notifications regularly |
| No real-time updates | Refresh page manually |
| No offline mode | Stay online while using |
| No advanced search | Use keyword search, filter by topic manually |
| No content restore | Be careful with deletes (contact admin if needed) |

### For Admins

| Limitation | Workaround |
|-----------|-----------|
| No bulk actions | Use bulk SQL commands directly (dangerous, requires care) |
| No user management UI | Access Supabase dashboard directly |
| No appeal system | Email protocol: discuss with user privately first |
| No soft deletes | Keep daily backups; restore from backup if needed |
| No audit search | Export logs, search manually |

### For Developers

| Limitation | Workaround |
|-----------|-----------|
| No feature flags | Use git branches; merge for full rollout |
| No A/B testing | Manual cohort: split users by ID % |
| No real-time | Use polling (not ideal): refetch every 30s |
| No analytics | Query database directly; build custom dashboard |
| No CI/CD alerts | Set Vercel email notifications for build failures |

---

## Performance Notes

### Current Bottlenecks

1. **Database Queries**: Unindexed or inefficient queries slow down analytics dashboard
   - **Solution**: Add missing indexes, optimize aggregations (Phase 2)

2. **Large Workbooks**: Loading workbook with 1000+ questions is slow
   - **Solution**: Pagination for questions; lazy-load concepts (Phase 2)

3. **Image Uploads**: No compression or CDN caching
   - **Solution**: Image optimization pipeline (Phase 2)

4. **API Latency**: No caching; every request hits database
   - **Solution**: Redis caching, query optimization (Phase 2)

### Estimated Performance at Scale

| Metric | Current | at 10k Users | at 100k Users |
|--------|---------|--------------|---------------|
| Page Load | ~1-2s | ~2-3s | ~5-10s (needs scaling) |
| API Latency (p95) | ~100ms | ~200ms | ~1000ms (unacceptable) |
| Database Connections | 5-10 | 50+ | 500+ (pool exhaustion) |
| Concurrent Users | 100 | 100 (ok) | 100 (bottleneck) |

**Scaling Path**:
- 10k users: Current setup fine with minor optimization
- 100k users: Needs Redis, read replicas, query optimization
- 1M users: Needs sharding, microservices, multi-region

---

## Security Notes

### Current Gaps

1. **No rate limiting**: API can be hammered (DOS risk)
   - **Fix**: Add Vercel rate limiting or custom middleware (Phase 2)

2. **No CSRF tokens**: Form submissions not protected against CSRF
   - **Fix**: Add CSRF middleware (Phase 2)

3. **No IP whitelist**: Admin actions not restricted by IP
   - **Fix**: Add IP allowlist in admin middleware (Phase 2)

4. **Audit logs basic**: Not all sensitive actions logged
   - **Fix**: Comprehensive audit for compliance (Phase 2)

5. **No 2FA**: Admin accounts vulnerable to phishing
   - **Fix**: TOTP/SMS 2FA (Phase 2)

6. **No content encryption**: Sensitive data not encrypted at rest
   - **Fix**: Column-level encryption for sensitive fields (Phase 3)

### Compliance

- ✅ HTTPS/TLS (via Vercel)
- ✅ JWT-based auth (Supabase)
- ✅ SQL injection protected (Drizzle ORM)
- ✅ XSS protected (React sanitization, CSP not set)
- ❌ GDPR data export (Phase 2)
- ❌ CCPA compliance (Phase 2)
- ❌ SOC 2 audit (Phase 3)

---

## Roadmap

### Phase 2 (Q2 2026 - 8 weeks)

**Focus**: Scale, reliability, user engagement

- [ ] P13: AI PDF to Workbook (LLM-powered content generation)
- [ ] P14: Real-time Updates (WebSocket, live notifications)
- [ ] Mobile app (Expo React Native)
- [ ] Email notifications (SendGrid)
- [ ] Advanced moderation (soft deletes, appeals)
- [ ] Feature flags (gradual rollout)
- [ ] Performance optimization (caching, indexing)

### Phase 3 (Q3 2026 - 8 weeks)

**Focus**: Monetization, advanced features, internationalization

- [ ] Stripe payments
- [ ] Subscription tiers
- [ ] Internationalization (i18n)
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Offline mode (Service Worker)
- [ ] Microservices (if scaling demands it)

### Phase 4+ (Q4 2026+)

**Focus**: Platform extensions, ecosystem

- [ ] Enterprise SSO (SAML/OIDC)
- [ ] API marketplace
- [ ] B2B sales dashboard
- [ ] Learning management system (LMS) mode
- [ ] Certification programs
- [ ] Corporate team management

---

## Getting Help

### For Limitations / Workarounds

- **Slack**: #product (discuss feature gaps)
- **GitHub Issues**: Label `limitation` (track requests)
- **Product Meetings**: Weekly roadmap review

### For Reporting Bugs Related to Limitations

If you find a bug caused by a Phase 2 feature not being ready, file as:
- Title: `[LIMITATION] Describe bug`
- Label: `limitation`, `phase-2`

Example: `[LIMITATION] AI generation endpoint returns 501 Not Implemented`

---

## Changelog

| Date | Change | Impact |
|------|--------|--------|
| 2026-04-26 | MVP Phase 1 released | Core features working |
| TBD (Q2) | Phase 2 started | Mobile, AI, real-time planned |
| TBD (Q3) | Phase 3 started | Monetization, i18n planned |

---

**Last Updated**: 2026-04-26  
**Next Review**: 2026-05-26 (post-soft-launch)

---

## Summary for Deployment

✅ **Ready for soft launch** (limited users, internal team):
- All MVP features working
- Known limitations documented
- Workarounds provided
- Scaling limits understood

⚠️ **Not ready for 1M+ users**:
- No real-time
- No mobile
- Limited analytics
- Performance will degrade >100k users

🚀 **Production deployment checklist**:
- [ ] All smoke tests pass
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database backups automated
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Team on-call rotation set up
