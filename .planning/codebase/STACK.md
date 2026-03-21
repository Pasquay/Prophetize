# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- TypeScript 5.9.x - Used throughout client and server codebases

**Secondary:**
- JavaScript (ES6+) - Configuration files (tailwind.config.js, metro.config.js)

## Runtime

**Environment:**
- Node.js (version not specified) - Server runtime
- Expo Go / React Native - Mobile client runtime

**Package Manager:**
- npm (version from package-lock.json)
- Lockfile: Present in both client and server directories

## Frameworks

**Core:**
- Expo ~54.0.33 - React Native framework for cross-platform mobile development
- React 19.1.0 - UI library
- React Native 0.81.5 - Native mobile UI framework
- Express.js 5.2.1 - Server web framework

**Testing:**
- No testing framework detected

**Build/Dev:**
- TypeScript Compiler (tsc) - Type checking and compilation
- Expo CLI - Development, building, and deployment
- Nativewind 4.1.23 - Tailwind CSS for React Native
- Babel - JavaScript transpiler (via Expo)

## Key Dependencies

**Critical:**
- @supabase/supabase-js ^2.98.0 (client), ^2.97.0 (server) - Database and authentication client
- @react-navigation/native ^7.1.8 - Navigation library
- @react-navigation/bottom-tabs ^7.4.0 - Tab navigation
- zustand ^5.0.11 - State management
- react-hook-form ^7.71.2 - Form handling
- socket.io-client ^4.8.3 / socket.io ^4.8.3 - Real-time communication (in package.json but not yet implemented)

**Infrastructure:**
- cors ^2.8.6 - Cross-origin resource sharing
- dotenv ^17.3.1 - Environment variable loading
- expo-router ~6.0.23 - File-based routing
- expo-secure-store ~15.0.8 - Secure storage for tokens
- @react-native-async-storage/async-storage ^2.2.0 - Async storage
- @expo/vector-icons ^15.0.3 - Icon library

## Configuration

**Environment:**
- Client: `.env` file with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_BACKEND_URL`
- Server: `.env` file with `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `PORT`
- EAS: `eas.json` for Expo Application Services build configuration

**Build:**
- Client: `app.json` (Expo config), `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `tsconfig.json`
- Server: `tsconfig.json`

## Platform Requirements

**Development:**
- Node.js environment
- Expo CLI installed globally or via npx
- iOS: Xcode (for iOS simulator)
- Android: Android Studio (for Android emulator)
- Supabase account and project

**Production:**
- Mobile: Expo Application Services (EAS) for builds, distribution via app stores
- Server: Node.js hosting environment (e.g., Railway, Render, AWS)
- Database: Supabase PostgreSQL with real-time capabilities

---

*Stack analysis: 2026-03-21*