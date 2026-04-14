# Code Conventions

## Language Standards

### TypeScript
- **Strict Mode**: Both client and server use `"strict": true` in tsconfig.json
- **Type Definitions**: Prefer interfaces over types for object shapes
- **Nullable Types**: Use explicit null/undefined checks rather than non-null assertion (!) when possible
- **Async/Await**: Preferred over .then() chains for asynchronous operations
- **Error Handling**: Try/catch blocks for async operations, proper error propagation
- **Module Resolution**: 
  - Client: Uses path mapping `@/*` → `./*` for absolute imports
  - Server: Standard Node.js module resolution
- **JSX**: React JSX syntax for components, functional components preferred

### JavaScript/JSX
- **Equality**: Use `===` and `!==` instead of `==` and `!=`
- **Variable Declaration**: Prefer `const` for values that don't change, `let` for reassignment, avoid `var`
- **Template Literals**: Use backticks for string interpolation
- **Destructuring**: Object/array destructuring for cleaner code
- **Spread/Rest**: Use for object/array manipulation when appropriate

## File Organization

### Component Files
- **Extension**: `.tsx` for React components with JSX, `.ts` for pure TypeScript
- **Naming**: PascalCase for component files (`MarketDetail.tsx`)
- **Structure**: 
  - Import statements at top (React, third-party, local)
  - Component function declaration
  - Export default at bottom
- **Size**: Aim for focused components (<200 lines when possible)

### Utility Files
- **Extension**: `.ts` for utility functions
- **Naming**: camelCase for utility files (`formatDate.ts`)
- **Structure**: 
  - Import statements
  - Utility function declarations
  - Export named functions or object containing utilities

### Configuration Files
- **Naming**: Descriptive names matching purpose (`tsconfig.json`, `tailwind.config.js`)
- **Location**: Root of relevant directory (client/, server/)
- **Comments**: Include purpose and usage notes when non-obvious

## Import Conventions

### Order
1. React imports
2. Third-party library imports
3. Relative/local imports
4. Type-only imports (when using `import type`)

### Path Usage
- **Client**: 
  - Absolute imports via `@/` alias (e.g., `@/components/ui/icon-symbol`)
  - Relative imports for nearby files (`./components`, `../utils`)
- **Server**:
  - Relative imports based on directory structure
  - No path aliases configured

### Specific Examples
```typescript
// Good: Grouped imports
import React from 'react';
import { View, Text } from 'react-native';
import { useUserStore } from '@/context/useUserStore';
import { formatDate } from '@/utils/formatDate';

// Good: Type-only imports when only using types
import type { UserState } from '@/context/useUserStore';
```

## Naming Conventions

### Components
- **PascalCase**: `MarketDetail`, `UserProfileCard`, `Button`
- **Descriptive**: Names should clearly indicate purpose
- **Avoid Abbreviations**: Unless universally understood (`Btn` is discouraged)

### Functions & Variables
- **camelCase**: `formatDate`, `useUserState`, `isAuthenticated`
- **Descriptive**: Clear intent in naming
- **Boolean Prefixes**: Use `is`, `has`, `should` for boolean values (`isLoading`, `hasError`)
- **Function Names**: Start with verb (`fetchData`, `calculateTotal`, `handleSubmit`)

### Constants
- **UPPER_CASE**: With underscores for separation (`MAX_RETRIES`, `DEFAULT_PAGE_SIZE`)
- **Location**: Near top of file or in dedicated constants files
- **Export**: Named export for reuse across files

### Files & Directories
- **kebab-case**: Not used in this codebase
- **snake_case**: Not used in this codebase
- **PascalCase**: For component files (`MarketDetail.tsx`)
- **camelCase**: For utility and configuration files (`formatDate.ts`, `tsconfig.json`)

### Types & Interfaces
- **PascalCase**: `UserState`, `MarketData`, `AuthRequest`
- **Descriptive**: Clear representation of data shape
- **Optional Properties**: Mark with `?` when applicable
- **Readonly**: Use `readonly` modifier for immutable properties

## Code Formatting

### Indentation
- **Spaces**: 2 spaces per indent (configured via Prettier/Eslint)
- **Tabs**: Not used

### Line Length
- **Target**: 80-100 characters
- **Enforcement**: ESLint and Prettier configuration

### Quotes
- **String Literals**: Single quotes (`'`) for strings
- **Template Literals**: Backticks (`` ` ``) for interpolation/multiline
- **JSX Attributes**: Double quotes (`"`) for HTML attributes in JSX

### Trailing Commas
- **Objects**: Use trailing commas in object literals
- **Arrays**: Use trailing commas in array literals
- **Function Parameters**: Use trailing commas in multi-line function parameters
- **Imports**: Use trailing commas in multi-line import statements

### Braces
- **Same Line**: Opening braces on same line as statement
- **Block Braces**: Always use braces for control structures (if, for, etc.)
- **Empty Objects**: `{ }` with space between braces
- **Destructuring**: Consistent spacing in destructuring

### Semicolons
- **Optional**: Due to Prettier configuration, semicolons are used consistently
- **Never Rely on ASI**: Always include semicolons for clarity

## React Specific Conventions

### Hooks
- **Naming**: Custom hooks start with `use` (`useThemeColor`, `useUserStore`)
- **Rules**: Only call hooks at top level, never in loops/conditions
- **Dependencies**: Exhaustive dependency arrays for `useEffect`, `useCallback`, `useMemo`
- **Cleanup**: Return cleanup function from `useEffect` when needed

### Components
- **Functional Components**: Preferred over class components
- **Props Destructuring**: Destructure props in function signature when simple
- **Prop Types**: Use TypeScript interfaces rather than PropTypes
- **Children**: Explicitly type children prop when used (`React.ReactNode`)
- **Memoization**: Use `React.memo()` for components that render frequently with same props
- **Callbacks**: Use `useCallback()` for functions passed as props to prevent re-renders

### Styling
- **Nativewind**: Tailwind CSS classes for styling (primary method)
- **Inline Styles**: StyleSheet.create() for complex dynamic styles
- **Conditional Classes**: Use `clsx` or tailwind-merge for conditional class application
- **Constants**: Extract repeated style values to constants

### Performance
- **Keys**: Unique keys for list items (use IDs when available, not index)
- **Lazy Loading**: `React.lazy()` and `Suspense` for code splitting (where applicable)
- **Image Optimization**: Use Expo Image component with appropriate resize modes
- **Animation**: Use Reanimated worklets for performant animations

## Error Handling

### Synchronous
- **Try/Catch**: For operations that might throw
- **Validation**: Input validation at function boundaries
- **Default Values**: Provide sensible defaults for optional parameters

### Asynchronous
- **Try/Catch**: Around await expressions
- **Error Boundaries**: React error boundaries for UI error recovery (limited in React Native)
- **User Feedback**: Show error messages to users via toast/snackbar/modal
- **Logging**: Log errors to console in development, monitoring service in production

### Supabase Specific
- **Check Error Objects**: Supabase errors have `error` property on response
- **Network Errors**: Handle offline/connectivity scenarios
- **Authentication Errors**: Redirect to login when token expired/invalid

## Testing Conventions
*Note: Limited test files observed in codebase*

### File Naming
- **Test Files**: Same name as source file with `.test.` or `.spec.` prefix
- **Location**: `__tests__` directory alongside source or colocated

### Test Structure
- **Arrange-Act-Assign**: Clear separation of test phases
- **Descriptive Names**: `it('should do X when Y', () => { ... })`
- **Mocking**: Jest mocks for external dependencies
- **Setup/Cleanup**: `beforeEach`, `afterEach` for test isolation

### What to Test
- **Utilities**: Pure functions with various inputs
- **Components**: Rendering, props handling, user interactions
- **Business Logic**: Service layer functions
- **Edge Cases**: Invalid inputs, boundary conditions, error states

## Documentation

### Comments
- **JSDoc**: Use for complex functions and components
- **TODO**: Mark technical debt with `// TODO: description`
- **FIXME**: Mark known issues with `// FIXME: description`
- **HACK**: Mark temporary solutions with `// HACK: description`
- **NOTE**: Mark important information with `// NOTE: description`

### File Headers
- **Module Description**: Brief description at top of complex files
- **Dependencies**: Note non-obvious dependencies
- **Usage Examples**: For complex utilities or hooks

### README
- **Project Overview**: Purpose and key features
- **Setup Instructions**: Development environment setup
- **Scripts**: Available npm scripts and their purposes
- **Architecture**: High-level overview of system design