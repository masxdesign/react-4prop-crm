# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development (CRM only)
npm run dev:crm

# Full development with backend services
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Deploy to GitHub Pages
npm run deploy

# Generate TanStack Router routes
npm run generate
```

## Architecture Overview

This is a React CRM application built with:

- **Vite** as the build tool with SSL enabled for development
- **TanStack Router** for file-based routing with type-safe navigation
- **TanStack Query** for server state management
- **Zustand** for client-side state management (look for zustand-extras.js utility)
- **Radix UI** as the primary component library
- **Tailwind CSS** for styling with custom utility classes
- **React Hook Form** with Yup/Zod validation

### Key Architecture Patterns

**Routing Structure**: Uses TanStack Router with file-based routing. Routes are organized with:
- `_auth` prefix for authenticated routes
- `_dashboard` for main dashboard functionality  
- `_com` for communication/messaging features
- `mag.*` routes for Magazine functionality

**Component Organization**: Components are organized by feature in `/src/components/` with:
- Individual component directories containing index.js and main component file
- UI components in `/ui/` folder (Radix-based)
- Custom UI variants in `/ui-custom/`
- Magazine components organized in dedicated subdirectories

**State Management**: 
- Server state handled by TanStack Query with queryClient configuration
- Local state uses Zustand stores (no centralized store directory found)
- Custom hooks for specific state patterns (e.g., use-sheetState.js, use-DialogModel.js)

**Data Layer**:
- API calls primarily through axios
- Custom utilities for data transformation (propertyTypesCombiner, lowerKeyObject, etc.)
- Backend integration with bizchat and db-sync services

### Magazine Module

The Magazine component is a complex feature for property listing management with:
- **AdvertiserManagement**: Handle advertiser CRUD operations and statistics
- **AgentPropertiesTable**: Display property listings with scheduling capabilities  
- **MagazineDashboard**: Overview and listing management interface
- **ScheduleManagement**: Week-based scheduling system for property listings

All Magazine components have been refactored to use a week-based scheduling system.

### Development Environment

- Development server runs on HTTPS (basic SSL plugin)
- Base path is `/crm` in development, `/new/agentab_crm` in production
- Build output goes to `../4prop-backend/web/volumes/html/seo/agentab_crm`
- Iframe support with custom transport utilities for embedded usage

### Key Utilities

- **EACH System**: Custom utilities for password generation and core functionality (EACH-core.js)
- **Data Formatters**: numberWithCommas, displaySize, displayTenure, formatBytes
- **Route Mapping**: routeSearchMapping.js for URL parameter handling
- **Form Utilities**: Custom hooks and components for form state management

When working with this codebase:
- Follow the existing component structure with index.js exports
- Use the established Radix UI + Tailwind pattern for new components
- Leverage TanStack Query for all server state operations
- Maintain the file-based routing conventions for new routes
- ES Modules throughout, no TypeScript or TDD
- Backend: Node v20, Express.js, MSSQL 2017