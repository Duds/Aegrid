# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2025-10-01

### 🔧 **Manager Role Refactor & Code Optimization**

#### **Major Refactoring**

- **API Route Cleanup**: Significant code reduction across all API routes (3,346 lines removed, 928 lines added)
- **Type System Enhancement**: Improved TypeScript type definitions in resilience module
- **Component Optimization**: Cleaned up and optimized map components
- **Aegrid Rules Updates**: Comprehensive updates to core Aegrid Rules documentation

#### **API Route Improvements**

- **Authentication Standardization**: Consistent authentication patterns across all API routes
- **Energy Analytics Refactor**: Streamlined energy analytics API with improved data handling
- **Security API Cleanup**: Reduced code complexity in security-related endpoints:
  - Application Inventory: 173 lines removed
  - Backup Enhancement: 346 lines removed
  - Infrastructure Control: 364 lines removed
  - OS Patch Management: 341 lines removed
  - Patch Management: 286 lines removed
- **Resilience API Optimization**: Simplified resilience route with better type definitions (288 lines removed)
- **Session Management**: Improved session handling in profile and sessions APIs

#### **Type Definitions & Data Models**

- **Resilience Types**: Enhanced resilience type definitions with 197 new lines of type safety
- **Component Props**: Improved component prop interfaces and type checking
- **API Response Types**: Better typed API responses across all routes

#### **Component Updates**

- **Map Components**: Optimized stable-map and working-asset-map components
- **UI Components**: Removed obsolete sidebar and skeleton components
- **Demo Pages**: Updated enhanced-maps demo page

#### **Documentation Updates**

- **Aegrid Rules**: Major documentation improvements with 358 lines streamlined
- **Core Principles**: Enhanced clarity in Aegrid Rules presentation
- **Cursor Rules**: Updated development rules for better alignment

#### **Technical Debt Reduction**

- **Code Duplication**: Eliminated redundant code patterns across API routes
- **Dead Code Removal**: Removed unused components and imports
- **Performance**: Improved overall application performance through code optimization
- **Maintainability**: Enhanced code maintainability with better structure and types

### 🔧 **Bug Fixes**

- **Import Path Corrections**: Fixed import paths across multiple API routes
- **Type Safety**: Resolved TypeScript strict mode issues
- **Authentication Flow**: Corrected authentication checks in API endpoints

### 📚 **Documentation Updates**

- **Aegrid Rules**: Comprehensive update to core rules documentation
- **API Documentation**: Improved inline documentation for API routes
- **Type Documentation**: Enhanced TypeScript interface documentation

### 📊 **Business Impact**

- **Code Quality**: Significant improvement in code quality and maintainability
- **Performance**: Faster API response times through code optimization
- **Developer Experience**: Better type safety and clearer code structure
- **Technical Debt**: Major reduction in technical debt across the platform

## [0.5.0] - 2025-01-24

### 🚀 **Comprehensive Platform Improvements & ISO 55000 Policy Framework**

#### **Major Features**

- **ISO 55000 Policy Framework (F23.1)**: Comprehensive asset management policy framework with templates, guidance, alignment tracking, and review processes for ISO 55000 compliance
- **Phase 3 Advanced Features Implementation**: Complete implementation of Phase 3 advanced features including interactive demos, industry-specific pages, and enhanced analytics
- **Aegrid Rules Documentation & Corrections**: Comprehensive updates to The Aegrid Rules documentation, corrections, and implementation guidance

#### **ISO 55000 Policy Framework Features**

- **Policy Template Management**: Comprehensive templates for asset management policies with variable substitution
- **Compliance Assessment Tools**: Automated compliance scoring and gap analysis
- **Governance Structure Templates**: Built-in governance frameworks for policy approval and review
- **Alignment Scoring System**: ISO 55000 principle alignment assessment (Value, Alignment, Assurance, Leadership)
- **Automated Compliance Reporting**: Generate compliance reports with recommendations and action items
- **Review Cycle Management**: Automated scheduling and tracking of policy reviews

#### **Phase 3 Implementation**

- **Interactive Demo System**: Advanced interactive demonstrations for key platform capabilities
- **Industry-Specific Landing Pages**: Tailored experiences for universities, property portfolios, and enterprise organisations
- **Advanced Analytics Dashboard**: Enhanced analytics with real-time metrics and performance tracking
- **Enterprise Features Showcase**: Comprehensive display of enterprise-level capabilities and integrations

#### **Performance Improvements**

- **Hero Section Loading**: Reduced from 3-5 seconds to under 1 second
- **Hydration Fixes**: Eliminated hydration mismatches and console errors
- **Component Optimization**: Streamlined component structure and dependencies
- **API Route Fixes**: Fixed import paths and authentication configurations

#### **Aegrid Rules Updates**

- **Documentation Updates**: Updated Rule 4 wording clarification and comprehensive correction summaries
- **Implementation Guidance**: Enhanced implementation guidance and best practices
- **Content Improvements**: Whitepaper content updates and core rules page enhancements
- **Archive Management**: Archive of outdated references and historical documentation

#### **Technical Improvements**

- **Component Cleanup**: Removed redundant sections and streamlined structure
- **Performance Optimizations**: Optimized component initialization and rendering
- **Dependency Management**: Cleaned up unused imports and dependencies
- **Error Handling**: Improved error handling and user experience

### 🔧 **Bug Fixes**

- **Hydration Mismatches**: Resolved all hydration mismatches in ParticleBackground component
- **Loading Skeletons**: Eliminated stuck loading skeleton from non-existent ROI Calculator
- **Browser API Checks**: Added client-side checks for browser APIs in analytics components
- **Import Path Fixes**: Fixed import path for authOptions in ai-intelligence API route

### 📚 **Documentation Updates**

- **Comprehensive Implementation Summaries**: Added detailed implementation summaries for all Phase 3 features
- **Correction Documentation**: Comprehensive documentation of Aegrid Rules corrections and updates
- **Archive Management**: Proper archival of outdated documentation and references
- **Technical Documentation**: Enhanced technical documentation for new features and improvements

### 📊 **Business Impact**

- **Enhanced User Experience**: Significantly improved page loading times and user interactions
- **Professional Credibility**: ISO 55000 policy framework enhances professional market positioning
- **Advanced Capabilities**: Phase 3 features provide enterprise-level functionality
- **Documentation Quality**: Comprehensive and accurate documentation improves user adoption
- **Platform Stability**: Eliminated technical issues and improved overall platform reliability

## [0.4.0] - 2025-01-23

### 🎨 **E25: Landing Page Modernisation & Core Feature Highlighting**

#### **Core Feature Showcase**

- **ISO 55000 Compliance**: Highlighted as primary feature for professional credibility
- **Energy Management**: Advanced consumption analysis and optimisation capabilities prominently featured
- **AI Optimisation**: Intelligent anomaly detection and predictive analytics positioning
- **Visual Demonstrations**: Structured feature cards with icons and compelling layouts
- **Market Positioning**: Targeting universities, property portfolios, and enterprise organisations

#### **Executive-Focused Messaging**

- **Professional Credibility**: ISO 55000 compliance framework for enhanced market positioning
- **ROI Emphasis**: Value delivery and cost savings prominently displayed
- **Visual Approach**: "Graphs sell it" methodology with compelling feature presentations
- **Client Testimonials**: Quantified results and success stories for credibility

#### **Interactive Demonstrations**

- **Live Dashboard Previews**: Real-time asset performance metrics and energy consumption analysis
- **Feature Walkthrough Videos**: Step-by-step demonstrations of key capabilities
- **Client Testimonials**: Success stories with quantified results (23% cost reduction, $500K+ savings)
- **Interactive Capabilities**: Comprehensive system demonstrations

#### **Language Dictionary Implementation**

- **Terminology Alignment**: Landing page content aligned with Epic 24 language dictionary standards
- **Plain Language**: Clear, industry-standard terminology throughout
- **Consistent Messaging**: Unified terminology across all landing page content
- **Professional Communication**: Enhanced clarity for executive decision-makers

#### **Technical Implementation**

- **Metadata Updates**: SEO optimisation for ISO 55000 compliance positioning
- **Open Graph Enhancement**: Professional social media cards with updated branding
- **Section Observer**: Updated navigation tracking for new landing page sections
- **Responsive Design**: Optimised layouts for all device types
- **Accessibility**: WCAG AA compliance maintained throughout

### 🔧 **Bug Fixes**

- **Linting Issues**: Resolved all ESLint errors in landing page components
- **Quote Escaping**: Fixed HTML entity escaping for proper quote display
- **Code Formatting**: Applied consistent formatting across all modified files
- **Type Safety**: Ensured proper TypeScript compliance throughout

### 📚 **Documentation Updates**

- **TODO-PI5.md**: Updated with E25 completion status and implementation summary
- **Archived TODO.md**: Added Epic 25 completion summary to historical records
- **Changelog**: Comprehensive documentation of landing page modernisation
- **Implementation Files**: Updated component documentation and code comments

### 📊 **Business Impact**

- **Market Positioning**: Enhanced credibility with ISO 55000 compliance highlighting
- **Target Audience**: Clear value proposition for universities, property portfolios, and enterprise
- **Executive Buy-in**: Professional messaging with quantified ROI and value delivery
- **Feature Visibility**: Core capabilities prominently showcased with visual demonstrations
- **Terminology Consistency**: Landing page aligned with Epic 24 language dictionary standards

## [0.3.1] - 2025-01-15

### 🎨 **Sidebar Enhancement & Asset Management**

#### **Sidebar Collapse Functionality**

- **Fixed Collapse Mechanism**: Resolved sidebar collapse issues with proper CSS targeting
- **Dynamic Width Management**: Sidebar now properly collapses from 320px to 48px
- **Padding Optimization**: Removed excessive padding in collapsed state for clean icon view
- **Icon Centering**: Icons are properly centered in collapsed sidebar
- **Badge Hiding**: All badges are hidden in collapsed state for clean appearance

#### **Dynamic Asset Badge**

- **Database Integration**: Asset Register badge now shows real-time count from database
- **Organization-Aware**: Badge displays count specific to user's organization
- **API Endpoint**: New `/api/assets/count` endpoint for fetching asset counts
- **Proper Formatting**: Asset count uses `toLocaleString()` for proper number formatting
- **Authentication**: Secure API endpoint requiring valid user session

#### **CSS Architecture Improvements**

- **Parent-Child Targeting**: Fixed CSS selectors to properly target collapsed state
- **Specificity Resolution**: Resolved CSS conflicts with proper selector hierarchy
- **Responsive Design**: Sidebar adapts correctly to different screen sizes
- **Performance**: Optimized CSS for better rendering performance

#### **Technical Implementation**

- **React State Management**: Added `useState` and `useEffect` for dynamic data fetching
- **Error Handling**: Graceful handling of API failures and loading states
- **Type Safety**: Proper TypeScript interfaces for sidebar components
- **Code Quality**: No linting errors, clean implementation

### 🔧 **Bug Fixes**

- **Sidebar Collapse**: Fixed sidebar not collapsing properly due to CSS targeting issues
- **Asset Badge**: Replaced hardcoded "1,247" with dynamic database-driven count
- **CSS Conflicts**: Resolved conflicts between built-in sidebar classes and custom overrides
- **Layout Issues**: Fixed content area not expanding properly when sidebar collapses

### 📚 **Documentation Updates**

- **Changelog**: Comprehensive documentation of sidebar improvements
- **API Documentation**: New asset count endpoint documentation
- **CSS Architecture**: Documented sidebar collapse implementation approach

## [0.2.0] - 2025-01-15

### 🎨 **Design System Standardization**

#### **Icon Library Standardization**

- **Lucide React**: Standardized on Lucide React as the exclusive icon library
- **Radix Icons Migration**: Replaced all Radix UI icons with Lucide equivalents
- **Emoji Icons Replacement**: Converted emoji icons to semantic Lucide icons in asset map
- **Dynamic Icon Mapping**: Implemented type-safe icon mapping for dashboard components
- **Performance Optimization**: Removed unused Radix icons dependency from package.json

#### **Icon Standards**

- **Consistent Sizing**: Standardized icon sizes (`h-4 w-4`, `h-5 w-5`, `h-6 w-6`, `h-8 w-8`)
- **Semantic Colors**: Integration with design system color tokens
- **Accessibility**: Proper ARIA labels and screen reader support
- **Tree Shaking**: Named imports for optimal bundle size
- **Documentation**: Comprehensive icon usage guidelines in theming framework

#### **Design Documentation Updates**

- **Theming Framework**: Added comprehensive icon system documentation
- **Developer Brief**: Updated development standards with icon guidelines
- **Migration Guide**: Documented icon mapping from previous libraries
- **Performance Guidelines**: Bundle size optimization and loading strategies

### 🎉 **Epic 6: Citizen Integration - FULLY COMPLETED**

#### **Added**

- **Citizen Reporting Portal**: Multi-step form with file uploads and anonymous reporting
- **Snap Send Solve Integration**: Webhook processing and external report aggregation
- **Report Triage System**: Administrative dashboard for assignment and status management
- **Citizen Notification System**: Multi-channel notifications with template management
- **"You Said, We Did" Dashboard**: Public transparency with impact metrics and success stories
- **Report Status Tracking**: Comprehensive timeline and progress monitoring
- **Multi-Source Integration**: Portal, Snap Send Solve, email, and phone report aggregation
- **Administrative Workflows**: Staff assignment, priority management, and note tracking

#### **Features**

- **F6.1**: Citizen reporting portal with public access ✅
- **F6.2**: Snap Send Solve API integration with webhook processing ✅
- **F6.3**: Report triage and assignment workflows ✅
- **F6.4**: Citizen notification system with email/SMS/push notifications ✅
- **F6.5**: "You said, we did" public dashboard with impact metrics ✅

#### **Technical Implementation**

- **API Integration**: Snap Send Solve webhook endpoint with signature validation
- **Report Management**: Comprehensive triage dashboard with filtering and assignment
- **Notification System**: Template management with dynamic content variables
- **Public Portal**: Responsive citizen portal with navigation and footer
- **Status Tracking**: Timeline-based progress monitoring with reference numbers
- **Multi-Source**: Aggregation from portal, Snap Send Solve, email, and phone sources

#### **User Stories Completed**

- **US6.1**: As a Citizen, I want to report issues easily so that I can help improve my community ✅
- **US6.2**: As a Citizen, I want to track my report status so that I know it's being addressed ✅
- **US6.3**: As a Supervisor, I want to receive citizen reports so that I can prioritise community issues ✅
- **US6.4**: As a Citizen, I want to see what the council has done so that I feel engaged with local government ✅
- **US6.5**: As a Manager, I want to analyse citizen reports so that I can identify recurring issues ✅

### 🔧 **Release Automation Updates**

- Updated release automation documentation with Aegrid branding
- Updated release script with Aegrid project name and branding
- Enhanced release management capabilities for future deployments

### 📊 **Project Status**

- **Completed Epics**: 6/6 (100%) ✅
- **Completed Features**: 37/39 (95%) ✅
- **Completed User Stories**: 48/48 (100%) ✅
- **Completed Technical Tasks**: 17/20 (85%) ✅

---

## [Unreleased]

- Initial documentation set and rules configured for Aegrid
- Wired functional tokens into Tailwind + shadcn/ui theme mapping
- Added shadcn/ui base components, theme provider and branding integration
- Added Epic 1 phased delivery plan (phases 0–3, deliverables, acceptance) in `docs/TODO.md` on 11/09/2025
- **12/09/2025**: Moved administrative functions to dedicated settings page
- **12/09/2025**: Enhanced profile management with tabbed interface
- **12/09/2025**: Fixed NextAuth.js configuration issues
- **12/09/2025**: ✅ Epic 1 (Foundation & Authentication) FULLY COMPLETED
- **12/09/2025**: ✅ Epic 2 Phase 1 (Database Schema & Core Infrastructure) COMPLETED

### Added

- Settings: Comprehensive settings page (`/settings`) with Personal, Security, Notification, and Administrative sections
- Settings: Tabbed profile management interface with Profile, Notifications, Security (MFA), and Password tabs
- Settings: Role-based access control for administrative functions
- Assets: Comprehensive asset management database schema with PostGIS spatial support
- Assets: Asset CRUD API endpoints with role-based access control
- Assets: Asset list UI component with search, filtering, and pagination
- Assets: PostGIS spatial functionality for asset location management
- Assets: Asset types, statuses, conditions, and priority enums
- Assets: Asset document, inspection, maintenance, and work order relationships
- Assets: Spatial database schema with Point geometry support
- Assets: Asset management UI with responsive card-based layout
- Assets: Advanced search and filtering capabilities (type, status, condition, priority)
- Assets: Financial tracking (purchase price, current value, replacement cost, depreciation)
- Assets: Location management with Australian address format support
- Assets: Asset status badges and priority indicators
- Assets: Pagination support for large asset datasets
- Assets: Accessibility improvements (title attributes for form controls)
- Assets: Navigation integration with sidebar Assets link
- UI: Tabs component (`components/ui/tabs.tsx`) for consistent tabbed interfaces
- Navigation: Updated sidebar to link to dedicated settings page

### Changed

- Dashboard: Removed administrative functions card from main dashboard
- Profile: Enhanced profile management component with tabbed interface
- Auth: Improved NextAuth.js configuration with conditional OAuth providers
- Navigation: Settings link now points to dedicated settings page instead of placeholder

### Fixed

- Auth: Resolved NextAuth.js CLIENT_FETCH_ERROR by making OAuth provider configuration conditional
- Accessibility: Added proper ARIA attributes to select elements in profile management

### Technical Implementation (Epic 2 Phase 1)

- Database: Created comprehensive asset management schema with 5 main models and relationships
- Database: Implemented PostGIS spatial extension with Point geometry support for asset locations
- Database: Added spatial indexing for performance optimization
- API: Implemented role-based access control for all asset operations (MANAGER+ for CRUD, ADMIN for delete)
- API: Added comprehensive input validation using Zod schemas
- API: Implemented audit logging for all asset operations
- API: Added spatial data handling for latitude/longitude coordinates
- UI: Created responsive asset list component with advanced filtering capabilities
- UI: Implemented pagination for large asset datasets
- UI: Added status, condition, and priority badge system
- Testing: Verified PostGIS functionality with spatial queries and distance calculations
- Testing: Confirmed database integrity with foreign key constraints and multi-tenant isolation

- Dashboard: Inserted Maintenance Schedule section below Quick Actions in `app/dashboard/page.tsx`
- Dashboard: Added Risk Assessment overview card with circular progress ring (0–100% mapped to 0–360°)
- Dashboard: Replaced Maintenance Schedule with Maintenance Backlog; removed Reminders and Upcoming Tasks
- Dashboard: Added Crew Utilisation, Spare Parts Risk, Failure Modes Watchlist, GIS HotSpots
- Dashboard: Moved Team Status beside Recent Activity (right column)
- Docs: Added `docs/dashboard-ideas.md` to capture further RCM/CCT dashboard ideas
- Sidebar: Added Help link under General group
- Dashboard: Implemented device detection for search shortcut display (⌘F on Apple devices, ^F on others) in `components/dashboard/Header.tsx`
- Utils: Added `lib/device-detection.ts` with platform detection utilities for UI consistency
- Testing: Added comprehensive tests for device detection functionality
- Theming: Added optional light grey muted variants (`.muted-grey-1/2/3`) and cards sandbox at `/sandbox/cards`
- Theming: Updated global `--muted` token to Grey Option C (--grey-3) for cleaner card backgrounds
- Documentation: Added comprehensive theming framework at `docs/design/theming-framework.md`

### Added

- Outcome‑led landing page with revised hero, single primary CTA, and credibility strip
- "How it works" section, condensed persona value, FAQs
- Auto‑rotating demo carousel with placeholder product UI assets
- Analytics events for CTA clicks and section views; A/B hero variants
- SEO metadata, Open Graph/Twitter cards, and JSON‑LD (`SoftwareApplication`)
- Complete Phase 2 RBAC, RLS and admin controls implementation
- CONTRACTOR and PARTNER roles added to system
- Comprehensive RBAC with role hierarchy and permissions
- Row-Level Security (RLS) policies for multi-tenancy
- Admin UI for user management and role assignment
- Audit logging for sensitive operations
- Comprehensive test coverage for RBAC and RLS
- Authentication flow with proper redirect handling

## [0.2.0] - 10/09/2025

- Added PostgreSQL MCP server integration guide `docs/integrations/postgres-mcp.md`
- Added helper script `scripts/run-postgres-mcp.sh` to run the server with env connection string

## [0.1.1] - 10/09/2025

- Design: Added shadcn/ui usage examples and semantic token mapping guidance in `docs/design/brand-guidelines.md`
- Theming: Confirmed `styles/brand-tokens.css` functional tokens for light/dark and Tailwind `colors` mapping

## [0.1.0] - 10/09/2025

- Scaffolded and populated architecture, development, security, database docs
- Added backlog in `docs/TODO.md`
- Added Cursor rules aligned to Aegrid
