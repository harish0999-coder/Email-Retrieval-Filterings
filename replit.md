# Overview

This is an AI-Powered Communication Assistant built as a full-stack web application that helps organizations manage incoming support emails efficiently. The application automatically processes emails, analyzes their sentiment and priority, generates AI-powered responses, and provides a comprehensive dashboard for email management. It uses modern web technologies including React for the frontend, Express.js for the backend, PostgreSQL with Drizzle ORM for data persistence, and OpenAI's GPT models for intelligent email analysis and response generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js for analytics visualization
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript with strict type checking
- **API Design**: RESTful API endpoints with structured error handling
- **Email Processing**: Asynchronous email processing pipeline with AI analysis
- **Middleware**: Request logging, JSON parsing, and error handling middleware

## Data Storage
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Normalized relational schema with separate tables for users, emails, responses, and analytics
- **Migrations**: Database schema versioning through Drizzle Kit

## Authentication & Authorization
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Basic username/password authentication system
- **Security**: Password hashing and session-based authentication

## AI Integration
- **LLM Provider**: OpenAI GPT-5 for email analysis and response generation
- **Email Analysis**: Sentiment analysis, priority classification, and information extraction
- **Response Generation**: Context-aware, professional response drafting with quality scoring
- **Processing Pipeline**: Automatic urgent email prioritization and AI response generation

## Email Processing Workflow
- **Ingestion**: CSV-based sample data loading with support for real email integration
- **Analysis**: Multi-dimensional email classification (sentiment, priority, category)
- **Response Generation**: AI-powered draft responses with tone and context awareness
- **Dashboard**: Real-time email management interface with filtering and search capabilities

## Development Environment
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Development Tools**: Hot module replacement, runtime error overlay, and development banner
- **Code Quality**: ESLint configuration with TypeScript support

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: TypeScript-first ORM with automatic migrations

## AI Services
- **OpenAI API**: GPT-5 model for email analysis, sentiment detection, and response generation
- **Natural Language Processing**: Automated email categorization and priority assessment

## UI Framework Dependencies
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon system for consistent visual elements

## Development Tools
- **Vite**: Modern frontend build tool with TypeScript support
- **TanStack Query**: Server state management and caching
- **Chart.js**: Data visualization for email analytics and reporting

## Runtime Dependencies
- **Express.js**: Web application framework for API endpoints
- **WebSocket Support**: Real-time features through ws library
- **Date Utilities**: date-fns for date manipulation and formatting
- **Validation**: Zod schema validation for type-safe data handling