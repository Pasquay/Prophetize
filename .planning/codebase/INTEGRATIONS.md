# External Integrations

## Backend Services
- **Supabase**: Primary backend service used for:
  - Authentication (`@supabase/supabase-js` in both client and server)
  - Database (PostgreSQL via Supabase)
  - Storage (likely for user assets)
  - Realtime subscriptions
  - Client: `@supabase/supabase-js: ^2.98.0`
  - Server: `@supabase/supabase-js: ^2.97.0`
  - Configuration: `client/utils/supabase.ts` and `server/src/config/supabaseClient.ts`

## Authentication
- **Google Sign-In**: 
  - Package: `@react-native-google-signin/google-signin: ^16.1.1`
  - Used in: `client/components/auth/google-login.tsx`
  - Configuration: Likely in app.json or eas.json for OAuth setup
- **Email/Password**: Supabase auth (standard email/password providers)
- **Secure Storage**: 
  - `expo-secure-store: ~15.0.8` for sensitive data
  - `@react-native-async-storage/async-storage: ^2.2.0` for persistent storage

## Real-time Communication
- **Socket.IO**:
  - Client: `socket.io-client: ^4.8.3`
  - Server: `socket.io: ^4.8.3`
  - Used for live updates (likely market prices, portfolio updates, transaction notifications)

## APIs & External Services
- **Expo SDK**: 
  - `expo: ~54.0.33` provides access to various native APIs
  - Specific Expo packages used:
    - `expo-linking: ~8.0.11` (deep linking)
    - `expo-web-browser: ~15.0.10` (OAuth flows)
    - `expo-font: ~14.0.11` (custom fonts)
    - `expo-haptics: ~15.0.8` (haptic feedback)
    - `expo-image: ~3.0.11` (optimized image loading)
    - `expo-linear-gradient: ~15.0.8` (gradient backgrounds)
    - `expo-splash-screen: ~31.0.13` (custom splash screens)
    - `expo-status-bar: ~3.0.9` (status bar control)
    - `expo-system-ui: ~6.0.9` (system UI integration)
    - `expo-constants: ~18.0.13` (app constants)
    - `expo-dev-client: ~6.0.20` (development client)
    - `expo-build-properties: ~1.0.10` (native build configuration)
    - `expo-symbols: ~1.0.8` (SF Symbols)
    - `expo-router: ~6.0.23` (file-based routing)
    - `expo-font: ~14.0.11` (font loading)
    - `expo-html-elements: ^0.10.1` (HTML component rendering)

## UI/UX Enhancements
- **Animations**:
  - Lottie: `@lottiefiles/dotlottie-react: ^0.13.5` (Lottie animations)
  - GSAP: `^3.14.2` (advanced JavaScript animations)
  - Reanimated: `react-native-reanimated: ~4.1.0` (worklet-based animations)
  - `@legendapp/motion: ^2.3.0` (motion primitives)
- **Icons**: `@expo/vector-icons: ^15.0.3` (icon set including FontAwesome, Material, etc.)
- **Fonts**: 
  - `@expo-google-fonts/inter-tight: ^0.4.2`
  - `@expo-google-fonts/jetbrains-mono: ^0.4.1`
  - `@expo-google-fonts/space-grotesk: ^0.4.1`
  - Custom fonts in `client/assets/fonts/`

## Navigation & Routing
- **React Navigation**:
  - `@react-navigation/native: ^7.1.8`
  - `@react-navigation/bottom-tabs: ^7.4.0`
  - `@react-navigation/elements: ^2.6.3`
  - Combined with expo-router for hybrid navigation approach

## Forms & Validation
- **React Hook Form**: `^7.71.2` (form state management and validation)
- Used with `@react-native-async-storage/async-storage` for persistence

## State Management
- **Zustand**: `^5.0.11` (lightweight state management)
- Used in client for global state (likely user data, market data, etc.)
- File: `client/context/useUserStore.tsx`

## Image Processing
- **React Native SVG**: `react-native-svg: ^15.13.0` (SVG rendering)
- Used for charts, icons, and custom graphics

## Utility Libraries
- **Date Formatting**: Custom utils in `client/utils/formatDate.ts`
- **Prediction Helpers**: Custom utils in `client/utils/prediction-helpers.ts`
- **API Wrapper**: Custom utils in `client/utils/api.ts` (likely Axios/fetch wrapper)
- **Deep Equality**: Not detected, may use lodash or custom implementations

## Development & Testing
- **TypeScript**: Both client and server use TypeScript with strict settings
- **ESLint**: `^9.25.0` with Expo configuration
- **Prettier**: With Tailwind CSS plugin for consistent formatting
- **Tailwind CSS**: `^3.4.17` processed via Nativewind for React Native