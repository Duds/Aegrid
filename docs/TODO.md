# Product Backlog

Last updated: 18/03/2026

## Epics

- #203 E22: Demo Environment & User Experience - PI4
- #202 E21: Maintenance Planner Journey Optimization - PI4
- #201 E20: Community Signal Detection & Citizen Engagement - PI4
- #200 E19: Resilience Dashboards & Critical Control Monitoring - PI4
- #199 E18: Risk-Driven Adaptive Scheduling - PI4
- #125 F2.7: Document Management & Storage System - Moved to PI4
- #35 E6: Citizen Integration
- #34 E5: Dashboards & Reporting
- #33 E4: Mobile Inspections (PWA)
- #32 E3: RCM-lite Templates & Scheduling
- #31 E2: Asset Register & GIS Integration
- #8 E7: Advanced Analytics & Forecasting
- #7 E8: ERP & System Integrations

## Features

- #97 F1.30: Unit & integration test setup (Jest, Playwright for auth flows)
- #95 F1.29: Storybook/Component docs scaffold
- #85 F1.24: User status management (enable/disable, force reset)
- #83 F1.23: User assignment UI (assign/change roles)
- #79 F1.21: Activity log (logins, sessions, recent actions)
- #77 F1.20: Notification preferences
- #75 F1.19: Profile management (name, email, password, avatar)
- #73 F1.18: User avatar upload
- #71 F1.17: Session management (JWT refresh rotation & device tracking)
- #69 F1.16: Multifactor authentication (TOTP + SMS/email fallback)
- #67 F1.15: Password reset (time-limited token)
- #65 F1.14: Secure login (rate limiting & lockout)
- #63 F1.13: Registration with email verification
- #61 F1.12: Auth providers (email/password + Google + Microsoft)
- #55 F1.11: Changelog/Release notes section
- #54 F1.10: Documentation/help page scaffold
- #53 F1.9: Landing/marketing page (overview + CTA for login/register)
- #48 F1.8: Theming & branding setup (tokens, typography, branding hooks)
- #47 F1.7: Logging & monitoring (pino/winston + Sentry)
- #46 F1.6: Database initialisation (PostgreSQL + Prisma migrations)
- #45 F1.5: Environment management (.env for local/dev/test/prod)
- #44 F1.4: CI/CD pipeline (GitHub Actions: build, test, deploy)
- #39 F4.1: Progressive Web App (PWA) Development
- #38 F2.1: Asset Import from CSV/Excel Files
- #16 F7.1: Carbon Footprint Tracking
- #15 F6.1: Citizen Reporting Portal
- #14 F5.1: Risk and Compliance Dashboard
- #13 F4.2: Offline Inspections with Photo Upload
- #12 F3.1: Preventive Maintenance Scheduling
- #11 F3.2: RCM Template Creation and Editing
- #10 F2.2: Interactive GIS Map Visualisation

## User Stories

- #98 US1.29: As a developer, I want tests so I can prevent regressions
- #96 US1.28: As a developer, I want Storybook so I can build UI consistently
- #94 US1.27: As a developer, I want seed data so I can test flows quickly
- #92 US1.26: As a developer, I want docker-compose so I can run everything locally
- #90 US1.25: As an admin, I want a dashboard to view user security
- #88 US1.24: As an admin, I want an audit log of changes
- #86 US1.23: As an admin, I want to disable accounts and force resets
- #84 US1.22: As an admin, I want to assign roles to users
- #82 US1.21: As an admin, I want to enforce roles so access is controlled
- #80 US1.20: As a user, I want to see my recent activity and sessions
- #78 US1.19: As a user, I want to set my notification preferences
- #76 US1.18: As a user, I want to update my profile details
- #74 US1.17: As a user, I want to upload a profile picture
- #72 US1.16: As a user, I want to see and revoke my active sessions
- #70 US1.15: As a user, I want MFA to protect my account
- #68 US1.14: As a user, I want to reset my password securely
- #66 US1.13: As a user, I want secure login that protects my account
- #64 US1.12: As a new user, I want to register and verify my email
- #62 US1.11: As a user, I want to sign in with email or Google/Microsoft
- #60 US1.7: As a designer/dev, I want theming & branding so the UI is consistent
- #59 US1.6: As a developer, I want logging & error tracking so I can diagnose issues
- #58 US1.10: As a user, I want a changelog so I can see recent changes
- #57 US1.9: As a user, I want a help page so I can self-serve onboarding
- #56 US1.8: As a visitor, I want a landing page so I can understand and sign in/register
- #52 US1.5: As a developer, I want a baseline database so I can run migrations and seed
- #51 US1.4: As a developer, I want environment configs so I can run safely across envs
- #50 US1.3: As a developer, I want CI/CD so code is built, tested, and deployed automatically
- #49 US1.2: As a developer, I want the app scaffolded so I can run and iterate locally
- #42 US4.1: As a Crew member, I want to perform inspections offline
- #41 US2.1: As an Asset Manager, I want to import assets from Excel
- #40 US1.1: As an Admin, I want to set up my council organisation
- #20 US5.1: As an Executive, I want to export audit-ready reports
- #19 US3.1: As a Supervisor, I want work orders to be generated automatically

## Bugs

- #22 Bug: Incorrect Risk Score Calculation in RCM Template
- #21 Bug: Data Sync Issues in Offline Mode

## Tasks

- #121 T13: Configure rate limiting and DDoS protection
- #120 T7: Set up monitoring and logging with OpenTelemetry
- #119 T6: Configure Azure Container Apps deployment
- #27 Task: Containerise API and Database
- #26 Task: Implement JWT-based RBAC Middleware
- #25 Task: Design Playground RCM Template
- #24 Task: Build Asset Import Endpoint
- #23 Task: Set up Database Schema Migration Pipeline
