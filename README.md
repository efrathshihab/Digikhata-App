# DigiKhata Mobile

This project contains the complete React Native + Expo frontend for the DigiKhata application. 

It is designed to connect to the **same backend and database** currently powering the DigiKhata web application, establishing a unified mobile experience while retaining the exact same business logic and database.

## Technology Stack

- **React Native** & **Expo**
- **TypeScript** (Strict Mode)
- **Expo Router** for file-based navigation
- **Zustand** for client-side global state management
- **TanStack Query (React Query)** for server state and API data
- **Axios** as the HTTP client
- **Socket.IO Client** for real-time bi-directional synchronization
- **Expo SecureStore** for secure token storage
- **React Hook Form** + **Zod** for complex form validation

## Folder Structure

The project adopts a highly scalable, **Feature-Based Architecture**:

- `src/app/` - **ONLY** Expo Router route definitions and navigation layouts. Keep route files strictly for navigation and importing feature screens.
- `src/features/` - Contains all actual UI screens, localized components, hooks, services, and types, grouped by feature module (auth, dashboard, customers, etc.).
- `src/components/` - Global, reusable UI and layout components (e.g., AppButton, AppCard, AppInput).
- `src/services/` - Centralized API clients, endpoint configurations, and Socket.IO initialization.
- `src/store/` - Zustand stores for global client-side state (e.g., Auth State).
- `src/providers/` - Top-level React context providers (QueryProvider, SocketProvider).
- `src/constants/` - Centralized theme, colors, and configuration settings.

## Getting Started

### 1. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

Copy the example environment variables file and configure your API URL:

\`\`\`bash
cp .env.example .env
\`\`\`

Update \`.env\` with your backend URL:
\`\`\`env
EXPO_PUBLIC_API_URL=https://logistic-backend-beta.vercel.app/api/v1
\`\`\`

### 3. Run the App

Start the Expo development server:

\`\`\`bash
npm start
\`\`\`

You can then run the app on:
- **Android**: Press \`a\` in the terminal
- **iOS**: Press \`i\` in the terminal (Requires macOS)
- **Web**: Press \`w\` in the terminal (For testing)
- **Physical Device**: Scan the QR code using the Expo Go app.

## Project Philosophy & Rules

- **No large UI in routes:** Never write extensive React components inside \`src/app/\`. Route files should purely export screens from \`src/features/\`.
- **Reusable components:** Use existing UI components in \`src/components/ui/\` before building ad-hoc local elements.
- **Data fetching:** Use TanStack Query for any data coming from the backend. Use Zustand only for client UI state.

*Next phase of development will focus on integrating Auth and Dashboard modules.*
