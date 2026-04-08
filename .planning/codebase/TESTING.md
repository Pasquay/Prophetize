# Testing Practices

## Current State
The Prophetize codebase currently has **minimal automated testing infrastructure**. Testing practices are primarily manual or rely on Expo's development tools.

### Test Configuration
- **Server**: 
  - `package.json` contains a test script: `"test": "echo \"Error: no test specified\" && exit 1"`
  - No test framework configured or dependencies installed
  - No test files found in the codebase

- **Client**:
  - No test script in package.json
  - No test framework configuration (Jest, Vitest, etc.)
  - No test files found in the codebase

### Testing Dependencies
- No testing libraries appear in either client or server package.json dependencies
- No devDependencies related to testing (Jest, @types/jest, Vitest, React Testing Library, etc.)
- No test-specific configuration files (jest.config.js, vitest.config.ts, etc.)

## Manual Testing Practices

### Expo Development Tools
- **Expo Go**: Primary testing method - run `expo start` and scan QR code with Expo Go app
- **Expo Dev Client**: Custom development client for testing native modules
- **Web Testing**: Run `expo start --web` to test in browser
- **Device Testing**: 
  - Android: `expo run:android`
  - iOS: `expo run:ios`
- **Fast Refresh**: React Native fast refresh for rapid UI iteration

### Backend Testing
- **Direct API Testing**: 
  - Tools like Postman or Thunder Client for manual API testing
  - Direct curl requests to localhost endpoints
- **Socket.IO Testing**: 
  - Manual testing with socket.io-client in browser console
  - Custom test scripts for real-time features
- **Database Testing**: 
  - Direct Supabase dashboard queries
  - Manual verification of data changes

### UI/UX Testing
- **Visual Inspection**: Manual verification of UI appearance and behavior
- **Interaction Testing**: Manual testing of user flows and edge cases
- **Performance Observation**: Subjective assessment of responsiveness and animations
- **Platform Testing**: Testing on both iOS and Android simulators/devices

## Recommended Testing Strategy

### Unit Testing
- **Utilities**: Test pure functions in `client/utils/` and `server/src/utils/`
  - Date formatting functions
  - Prediction helpers
  - API wrapper functions
  - Supabase client initialization
- **Services**: Test business logic in `server/src/services/`
  - Portfolio service calculations
  - Market data processing
  - Transaction validation
- **Components**: Test presentational components
  - UI components with various props
  - Form validation components
  - Display components with mock data

### Integration Testing
- **API Endpoints**: Test server routes with various inputs
  - Authentication flows
  - CRUD operations for markets, portfolios, transactions
  - Error cases and validation
- **Supabase Integration**: 
  - Database query correctness
  - Authentication flows
  - Real-time subscription behavior
- **Client-Server Integration**:
  - API request/response handling
  - Error propagation
  - Loading and empty states

### End-to-End Testing
- **User Journeys**: Test complete user flows
  - Authentication → Market exploration → Portfolio updates
  - Transaction creation → Confirmation → History viewing
  - Settings modification → Persistence verification
- **Cross-platform**: Test on both iOS and Android
- **Network Conditions**: Test offline behavior and reconnection

### Testing Tools to Consider
- **Jest**: Most common for React Native/Node.js testing
  - `@testing-library/react-native` for component testing
  - `@testing-library/jest-dom` for custom assertions
- **Vitest**: Modern alternative to Jest with better ESM support
- **React Native Testing Library**: For testing React Native components
- **MSW (Mock Service Worker)**: For API mocking in tests
- **Supabase Mock**: For mocking Supabase client in tests
- **Socket.IO Client Mock**: For testing real-time features

## Code Quality and Linting

### ESLint
- **Client**: Configured with `eslint-config-expo`
  - Enforces React Native best practices
  - Consistent code style
  - Identifies potential bugs
- **Server**: No ESLint configuration found
  - Opportunity to add standard Node.js ESLint configuration

### TypeScript
- **Strict Mode**: Both client and server use `"strict": true`
  - Catches type-related errors at compile time
  - Enforces better code documentation through types
- **Type Checking**: `tsc --noEmit` in client build script

### Formatting
- **Prettier**: Configured via `prettier-plugin-tailwindcss`
  - Consistent code formatting
  - Integrated with Tailwind CSS class sorting

## Testing Gaps and Recommendations

### Immediate Improvements
1. **Add Basic Test Framework**:
   - Install Jest or Vitest in both client and server
   - Configure basic test setup
   - Add npm test scripts that actually run tests

2. **Create Test Directory Structure**:
   - `client/__tests__/` or colocated test files
   - `server/src/__tests__/` or colocated test files
   - Follow existing file naming conventions

3. **Start with Utility Testing**:
   - Test `client/utils/formatDate.ts`
   - Test `client/utils/prediction-helpers.ts`
   - Test `server/src/utils/` (once identified)

### Medium-term Goals
1. **Component Testing**:
   - Test presentational components in isolation
   - Test form components with validation
   - Test navigation and layout components

2. **Service Layer Testing**:
   - Mock Supabase client for service tests
   - Test business logic with various inputs
   - Test error handling and edge cases

3. **Integration Testing**:
   - Test API endpoints with supertest (server)
   - Test API wrapper functions (client)
   - Test authentication flows

### Long-term Vision
1. **End-to-End Testing**:
   - Consider Detox for React Native E2E testing
   - Consider Cypress or Playwright for web E2E testing
   - Test critical user journeys automatically

2. **Continuous Integration**:
   - Set up GitHub Actions to run tests on push/PR
   - Include linting and type checking in CI
   - Add test coverage reporting

3. **Test-Driven Development**:
   - Encourage writing tests before new features
   - Use testing to drive better design decisions
   - Maintain high test coverage over time

## Environment Considerations

### Test Environment Variables
- Need separate `.env.test` or similar for testing
- Should use test Supabase project to avoid polluting production data
- API endpoints should point to test server instances

### Mocking Strategy
- **Supabase**: Mock client methods to return predictable data
- **External APIs**: Mock services like Google Sign-In
- **Async Storage**: Mock @react-native-async-storage/async-storage
- **Timers**: Use jest fake timers for animation/time-based tests

## Documentation of Testing
- **Test File Headers**: Describe what is being tested
- **Test Case Descriptions**: Clear `it()` or `test()` descriptions
- **Arrange-Act-Assert**: Clearly separate test phases
- **Positive and Negative Tests**: Test both valid and invalid inputs
- **Edge Cases**: Test boundary conditions and error scenarios

## Current Manual Testing Checklist
When performing manual testing, consider verifying:

### Authentication
- [ ] Google Sign-In flow
- [ ] Email/password sign up/login
- [ ] Token refresh and expiration handling
- [ ] Secure storage of credentials
- [ ] Logout functionality

### Market Features
- [ ] Market listing and filtering
- [ ] Market detail views
- [ ] Price data accuracy and freshness
- [ ] Category-based filtering

### Portfolio Features
- [ ] Portfolio creation and editing
- [ ] Position tracking and valuation
- [ ] Transaction history
- [ ] Performance calculations

### Transaction Features
- [ ] Buying and selling assets
- [ ] Transaction confirmation
- [ ] Fee calculations
- [ ] Settlement timing

### UI/UX
- [ ] Responsive layout on different screen sizes
- [ ] Dark/light theme switching
- [ ] Loading and empty states
- [ ] Error messaging and recovery
- [ ] Navigation and tab switching
- [ ] Animation performance
- [ ] Accessibility basics (touch targets, contrast)

### Performance
- [ ] App launch time
- [ ] Screen transition performance
- [ ] List scrolling performance
- [ ] Memory usage during extended use
- [ ] Battery impact assessment

### Platform-Specific
- [ ] iOS-specific behavior and appearance
- [ ] Android-specific behavior and appearance
- [ ] Web responsiveness (if applicable)
- [ ] Device permissions handling
- [ ] Deep linking functionality