# System Architecture

## Overall Pattern
The Prophetize application follows a **client-server architecture** with:
- **Mobile Client**: React Native/Expo application for iOS/Android/web
- **Backend Server**: Node.js/Express API server
- **Communication**: RESTful API patterns enhanced with Socket.IO for real-time features
- **Data Layer**: Supabase (PostgreSQL) as the primary database and authentication provider

## Layers

### Client Layers
1. **Presentation Layer** (`client/components/`)
   - UI components organized by feature (auth, market, portfolio, etc.)
   - Reusable UI primitives in `client/components/ui/`
   - Feature-specific components in domain folders

2. **State Management Layer** (`client/context/`, `client/hooks/`)
   - Global state via Zustand (`useUserStore.tsx`)
   - React Context for authentication (`AuthContext.tsx`)
   - Custom hooks for theme and color scheme management

3. **Data Access Layer** (`client/utils/`)
   - Supabase client wrapper (`supabase.ts`)
   - API abstraction layer (`api.ts`)
   - Utility functions for formatting, predictions, dates

4. **Navigation Layer** (`client/app/`)
   - File-based routing via expo-router
   - Layout components (`_layout.tsx`)
   - Tab navigation structure (`client/app/tabs/`)

5. **Assets Layer** (`client/assets/`)
   - Images, icons, fonts
   - Animation assets (Lottie JSON files)

### Server Layers
1. **Controller Layer** (`server/src/controllers/`)
   - Request handling for users, markets, portfolios, transactions
   - Validation and response formatting
   - Authentication middleware integration

2. **Service Layer** (`server/src/services/`)
   - Business logic encapsulation
   - Direct database interactions via Supabase
   - Portfolio service, market service, transaction service

3. **Middleware Layer** (`server/src/middleware/`)
   - Authentication middleware (`authMiddleware.ts`)
   - Admin authorization middleware (`adminMiddleware.ts`)
   - Error handling and request logging

4. **Route Layer** (`server/src/routes/`)
   - API endpoint definitions
   - Router configuration for each domain
   - Middleware application at route level

5. **Configuration Layer** (`server/src/config/`)
   - Supabase client initialization
   - Environment variable management
   - Socket.IO setup

6. **Types Layer** (`server/src/types/`)
   - TypeScript interfaces for request/response models
   - Database schema representations

## Data Flow

### Authentication Flow
1. User initiates login via Google Sign-In or email/password
2. Client sends credentials to Supabase Auth
3. Supabase returns JWT tokens
4. Client stores tokens securely (AsyncStorage/SecureStore)
5. Client includes tokens in API requests to server
6. Server validates tokens via Supabase verification
7. Server processes request with user context

### Real-time Data Flow
1. Server establishes Socket.IO connection on specific namespaces
2. Client connects to Socket.IO server with authentication
3. Server emits events when data changes (price updates, portfolio changes)
4. Client listens for events and updates local state/UI
5. Bidirectional communication for user actions requiring immediate feedback

### CRUD Operations Flow
1. User interacts with UI component
2. Component triggers state update via Zustand or React hooks
3. State change initiates API call via client utils
4. Request sent to appropriate server controller
5. Controller validates input and delegates to service layer
6. Service performs Supabase database operations
7. Service returns result to controller
8. Controller formats response and sends to client
9. Client updates state and UI reflects changes

## Key Abstractions

### Supabase Integration
- Centralized client initialization in both client (`client/utils/supabase.ts`) and server (`server/src/config/supabaseClient.ts`)
- Abstracts database operations, authentication, and realtime subscriptions
- Provides type safety through generated TypeScript definitions

### Custom Hooks & Utilities
- `use-theme-color.ts` and `use-color-scheme.ts` for dynamic theming
- Format utilities for consistent date/currency display
- Prediction helpers for financial calculations
- API wrapper for consistent error handling and request formatting

### Component Architecture
- **Atomic Design Principles**: 
  - Atoms: Basic UI elements (Button, Input, Icon)
  - Molecules: Combinations (FormField, Card)
  - Organisms: Complex UI sections (Header, List)
  - Templates: Page layouts
  - Pages: Complete screens

### State Management
- **Zustand**: Lightweight global state for user data, market data, UI state
- **React Context**: Authentication state propagation
- **Local Component State**: UI-specific state (form inputs, loading states)
- **Server State**: Managed through Supabase queries and subscriptions

## Entry Points

### Client Entry Points
- `client/index.tsx`: Root component registered with Expo
- `client/app/_layout.tsx`: Root layout providing context providers
- `client/app/index.tsx`: Home tab screen
- Authentication screens: `login.tsx`, `signUp.tsx`

### Server Entry Points
- `server/src/index.ts`: Main server initialization
- Sets up Express middleware, routes, Socket.IO, and starts listening
- Loads environment variables and initializes Supabase client

## Cross-cutting Concerns

### Error Handling
- Client: Try/catch blocks in utils, error boundaries in components
- Server: Express error handling middleware, controller try/catch
- Supabase: Built-in error handling with custom error transformation

### Logging
- Server: Console logging with timestamps for requests and errors
- Client: Limited logging in development, relies on Expo dev tools

### Security
- Authentication: JWT tokens via Supabase, secure storage
- Authorization: Role-based checks in middleware
- Data Validation: Input validation in controllers and services
- Environment Secrets: .env files for sensitive configuration
- CORS: Configured to allow client origins

### Performance
- Lazy loading of routes and components via expo-router
- Image optimization through Expo Image component
- Memoization of expensive computations
- Efficient database queries with proper indexing
- Real-time updates minimize polling needs

## Deployment Architecture
- **Development**: Local development with Expo dev server and Node.js server
- **Testing**: Jest-like testing framework (configuration present)
- **Staging**: Likely similar to production with separate Supabase project
- **Production**: 
  - Client: Expo EAS builds for iOS/Android, web hosting
  - Server: Node.js deployment (likely Vercel, AWS, or similar)
  - Database: Supabase managed PostgreSQL