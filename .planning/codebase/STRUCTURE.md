# Project Structure

## Root Level
```
Prophetize/
├── .github/                 # GitHub workflows and agent definitions
│   ├── agents/             # GSD agent configurations
│   ├── get-shit-done/      # GSD workflows and templates
│   ├── skills/             # GSD skill definitions
│   └── copilot-instructions.md
├── .idea/                  # JetBrains IDE configuration
├── .opencode/              # Opencode agent and command definitions
├── .planning/              # GSD planning artifacts
│   └── codebase/           # Codebase mapping documents (this directory)
├── client/                 # React Native/Expo mobile application
├── server/                 # Node.js/Express backend API
├── .gitignore              # Git ignore rules
└── package-lock.json       # Locked dependencies (root level)
```

## Client Structure
```
client/
├── app/                    # Expo router-based navigation
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Home tab screen
│   ├── login.tsx           # Authentication login
│   ├── signUp.tsx          # Authentication registration
│   ├── categories.tsx      # Market categories listing
│   ├── marketDetails.tsx   # Individual market detail view
│   ├── explore-details.tsx # Deep dive into exploration topics
│   └── tabs/               # Bottom tab navigation
│       ├── _layout.tsx     # Tab layout wrapper
│       ├── explore.tsx     # Explore tab content
│       ├── home.tsx        # Home tab content
│       ├── leaderboard.tsx # Leaderboard tab content
│       └── profile.tsx     # Profile tab content
├── assets/                 # Static assets
│   ├── app-icons/          # Application icons
│   ├── fonts/              # Custom font files
│   │   ├── JetBrainsMono-Bold.ttf
│   │   └── JetBrainsMono-Regular.ttf
│   └── images/             # Image assets
│       └── icon.png        # App icon
├── components/             # Reusable UI components
│   ├── auth/               # Authentication-related components
│   │   ├── google-login.tsx
│   │   ├── backbtn.tsx
│   │   ├── input-field.tsx
│   │   ├── logo-anim.tsx
│   │   ├── logo-hint.tsx
│   │   └── wide-button.tsx
│   ├── common/             # Shared components across features
│   │   ├── empty-state.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── themed-view.tsx
│   │   ├── themed-text.tsx
│   │   ├── loading-screen.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   └── claim-allowance.tsx
│   ├── dev/                # Development/debugging components
│   │   └── temp.tsx
│   ├── explore/            # Explore tab components
│   │   ├── card-skeleton.tsx
│   │   ├── category-card.tsx
│   │   ├── predication-card.tsx
│   │   └── search-header.tsx
│   ├── home/               # Home tab components
│   │   ├── home-list-skeleton.tsx
│   │   ├── category-btn.tsx
│   │   ├── home-header.tsx
│   │   ├── animated-gift.tsx
│   │   └── no-markets.tsx
│   ├── jsonAnim/           # Lottie animation JSON files
│   │   ├── logo.json
│   │   └── lellel.json
│   ├── leaderboard/        # Leaderboard tab components
│   │   ├── leaderboard-p.tsx
│   │   ├── leaderboard-r.tsx
│   │   ├── leaderboard-s.tsx
│   │   ├── my-position-c.tsx
│   │   └── (additional leaderboard components)
│   ├── market/             # Market tab components
│   │   ├── market-detail-balance.tsx
│   │   ├── market-detail-heading.tsx
│   │   ├── market-detail-summary.tsx
│   │   └── (additional market components)
│   ├── profile/            # Profile tab components
│   │   ├── settings-item.tsx
│   │   ├── stat-card.tsx
│   │   ├── profile-avatar.tsx
│   │   └── activity-item.tsx
│   ├── skeleton/           # Loading skeleton components
│   │   └── skeleton-shell.tsx
│   └── ui/                 # Base UI components
│       ├── gluestack-ui-provider/ # Gluestack UI theme providers
│       └── icon-symbol.tsx   # Icon component
├── constants/              # Application constants
│   ├── backendUrl.ts       # API endpoint configuration
│   ├── categories.ts       # Market category definitions
│   ├── explore-theme.ts    # Theme exploration settings
│   ├── theme.ts            # Application theming
│   ├── ui-mappings.ts      # UI component mappings
│   └── ui-tokens.ts        # UI token definitions
├── context/                # React Context providers
│   ├── AuthContext.tsx     # Authentication context
│   └── useUserStore.tsx    # Zustand store for user state
├── hooks/                  # Custom React hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
├── scripts/                # Utility scripts
│   └── reset-project.js    # Project reset utility
├── utils/                  # Utility functions and services
│   ├── supabase.ts         # Supabase client initialization
│   ├── api.ts              # API request wrapper
│   ├── formatDate.ts       # Date formatting utilities
│   └── prediction-helpers.ts # Financial prediction helpers
├── configuration files:
│   ├── app.json            # Expo application configuration
│   ├── babel.config.js     # Babel transpilation settings
│   ├── eas.json            # Expo Application Services config
│   ├── eslint.config.js    # ESLint configuration
│   ├── global.css          # Global CSS styles
│   ├── metro.config.js     # Metro bundler configuration
│   ├── nativewind-env.d.ts # Nativewind TypeScript definitions
│   ├── package.json        # npm dependencies and scripts
│   ├── package-lock.json   # Locked dependency versions
│   ├── tsconfig.json       # TypeScript configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
└── README.md               # Client documentation
```

## Server Structure
```
server/
├── src/                    # Source code
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts       # Authentication endpoints
│   │   ├── marketController.ts     # Market data endpoints
│   │   ├── portfolioController.ts  # Portfolio management endpoints
│   │   └── transactionController.ts # Transaction processing
│   ├── middleware/         # Custom Express middleware
│   │   ├── authMiddleware.ts       # Authentication verification
│   │   └── adminMiddleware.ts      # Admin authorization
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.ts       # Authentication endpoints
│   │   ├── marketRoutes.ts     # Market data endpoints
│   │   ├── portfolioRoutes.ts  # Portfolio management endpoints
│   │   └── transactionRoutes.ts # Transaction processing
│   ├── services/           # Business logic layer
│   │   ├── portfolioService.ts     # Portfolio operations
│   │   ├── whereDBInteractionsAre.ts # Database interaction helpers
│   │   └── (additional services)
│   ├── types/              # TypeScript type definitions
│   │   ├── authRequest.ts        # Authentication request types
│   │   ├── marketCategories.ts   # Market category enum/types
│   │   ├── portfolio.ts          # Portfolio data types
│   │   └── (additional type files)
│   ├── config/             # Configuration files
│   │   └── supabaseClient.ts   # Supabase client initialization
│   ├── index.ts            # Server entry point
│   └── utils/              # Utility functions
│       └── (utility files)
├── configuration files:
│   ├── package.json        # npm dependencies and scripts
│   ├── package-lock.json   # Locked dependency versions
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env                # Environment variables
└── README.md               # Server documentation
```

## Key Directories Explained

### client/app/
- Uses expo-router for file-based routing
- Each .tsx file represents a route
- _layout.tsx files provide layout wrappers
- tabs/ directory contains bottom tab navigation

### client/components/
- Organized by feature/domain for maintainability
- ui/ contains primitive/shared components
- Feature folders contain components specific to that tab/section

### client/utils/
- supabase.ts: Centralized Supabase client
- api.ts: Wrapper for API requests with error handling
- formatDate.ts: Consistent date formatting across app
- prediction-helpers.ts: Financial calculation utilities

### server/src/
- Follows MVC-inspired structure
- Controllers handle HTTP requests and responses
- Services contain business logic
- Routes define API endpoints
- Middleware handles cross-cutting concerns
- Types provide TypeScript interfaces

## Naming Conventions

### Files
- PascalCase for React components (`MarketDetail.tsx`)
- camelcase for utility files (`formatDate.ts`)
- Descriptive names that indicate purpose

### Directories
- lowercase with no separators (`components`, `utils`)
- Plural names for collections (`controllers`, `services`)

### Variables/Functions
- camelcase for variables and functions (`useUserState`, `formatDate`)
- PascalCase for types and interfaces (`UserState`, `MarketData`)
- UPPERCASE for constants (`MAX_RETRIES`, `DEFAULT_PAGE_SIZE`)

### Imports
- Relative paths with aliases where configured (`@/*` maps to `./*`)
- Named imports preferred over default imports
- Grouped: React, third-party, local imports

## Configuration Files

### Client
- `package.json`: Dependencies, scripts, Expo configuration
- `tsconfig.json`: TypeScript configuration extending Expo base
- `tailwind.config.js`: Tailwind CSS configuration processed by Nativewind
- `app.json`: Expo app configuration (name, slug, version, etc.)
- `eas.json`: Expo Application Services build configurations
- `babel.config.js`: Babel plugin configuration
- `metro.config.js`: Metro bundler customization
- `eslint.config.js`: ESLint rules for code quality
- `global.css`: Global CSS styles (used with Nativewind)

### Server
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration for Node.js
- `.env`: Environment variables (API keys, database URLs, etc.)

## Documentation
- README.md files in client/ and server/ directories
- Inline JSDoc/TSDoc comments for complex functions
- Commit messages following conventional commits format