# Technology Stack

## Languages
- **TypeScript**: Primary language for both client and server (`tsconfig.json` files present)
- **JavaScript/JSX**: Used in React Native components
- **JSON**: Configuration files (package.json, tsconfig.json, etc.)

## Client (Mobile App)
- **Framework**: React Native with Expo (`expo: "~54.0.33"` in client/package.json)
- **Routing**: expo-router (`~6.0.23`)
- **State Management**: Zustand (`^5.0.11`)
- **UI Library**: 
  - Gluestack UI (`@gluestack-ui/core: ^3.0.10`, `@gluestack-ui/utils: ^3.0.11`)
  - Nativewind (Tailwind CSS for React Native) (`^4.1.23`)
- **Utilities**:
  - React Hook Form (`^7.71.2`) for form handling
  - Lottie React Native (`^7.3.6`) for animations
  - GSAP (`^3.14.2`) for advanced animations
  - Socket.IO Client (`^4.8.3`) for real-time communication
  - Supabase JS Client (`^2.98.0`) for backend services
  - React Aria (`^3.33.0`) for accessible UI components
  - React Stately (`^3.39.0`) for UI state logic

## Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express (`^5.2.1`)
- **Language**: TypeScript (`^5.9.3`)
- **Real-time**: Socket.IO (`^4.8.3`)
- **Environment**: dotenv (`^17.3.1`)
- **CORS**: cors (`^2.8.6`)
- **Database**: Supabase (via `@supabase/supabase-js: ^2.97.0`)
- **Development**: 
  - nodemon (`^1.0.2`) for auto-restart
  - ts-node (`^10.9.2`) for TypeScript execution
  - @types/* packages for TypeScript definitions

## Development Tools
- **Linting**: ESLint (`^9.25.0`) with Expo config (`eslint-config-expo: ~10.0.0`)
- **Formatting**: Prettier with Tailwind plugin (`prettier-plugin-tailwindcss: ^0.5.11`)
- **Type Checking**: TypeScript (`tsc --noEmit` in client build script)
- **Tailwind CSS**: `^3.4.17` with preprocessing via Nativewind

## Project Structure
- Monorepo-like structure with separate `client` and `server` directories
- Each has its own package.json, dependencies, and configuration
- Shared Supabase configuration between client and server