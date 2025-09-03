# Shram Daan - Community Volunteering Platform

## Overview

Shram Daan is a mobile-first web application that connects volunteers with local community service projects. The platform enables users to discover, join, and organize volunteer opportunities like cleanups, tree planting, education initiatives, and construction projects. Built with a modern full-stack architecture, it features location-based project discovery, real-time messaging, user authentication, and a comprehensive reward system to encourage community participation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with organized route handlers
- **Middleware**: Custom logging, error handling, and request processing
- **Development**: Hot reloading with Vite integration for seamless full-stack development

### Database & ORM
- **Database**: PostgreSQL for robust relational data storage
- **ORM**: Drizzle ORM with type-safe database operations
- **Schema**: Comprehensive schema covering users, projects, RSVPs, messages, notifications, and badges
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Connection**: Neon serverless PostgreSQL with connection pooling

### Authentication & Session Management
- **Provider**: Replit Auth (OpenID Connect) for user authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with secure session management
- **Authorization**: Route-level protection with middleware-based authentication checks

### Core Data Models
- **Users**: Profile management with stats tracking (projects created, participated, badges earned)
- **Projects**: Categorized volunteer opportunities with location, timing, and participant limits
- **RSVPs**: Many-to-many relationship between users and projects for participation tracking
- **Messages**: Project-specific communication system for coordination
- **Notifications**: User notification system for project updates and engagement
- **Badges**: Gamification system with user achievements and recognition

### Mobile-First Design
- **Responsive**: Mobile-optimized interface with max-width container (max-w-sm)
- **Navigation**: Bottom navigation for mobile app-like experience
- **Components**: Touch-friendly UI elements and gestures
- **Performance**: Optimized for mobile networks with efficient data loading

## External Dependencies

### Authentication & Database
- **Replit Auth**: OpenID Connect authentication provider for user management
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter

### Frontend Libraries
- **UI Framework**: Radix UI component primitives for accessibility and functionality
- **Styling**: Tailwind CSS for utility-first styling approach
- **State Management**: TanStack Query for server state, caching, and synchronization
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Routing**: Wouter for lightweight single-page application routing

### Development & Build Tools
- **Build System**: Vite for fast development server and optimized production builds
- **TypeScript**: Full-stack type safety with shared types between client and server
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind CSS integration

### Utility Libraries
- **Date Handling**: date-fns for date formatting and manipulation
- **Validation**: Zod for runtime type validation and schema definition
- **Styling Utilities**: clsx and tailwind-merge for conditional CSS classes
- **Session Management**: express-session with PostgreSQL store for persistence