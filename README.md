# Book Management System - Frontend

This is a React-based frontend for the Book Management System. It allows users to manage books and handle library operations like checking books in and out.

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn (v1.22 or later)
- Backend API server (see [Backend Repository](https://github.com/your-org/book-management-backend) for setup)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/book-management-frontend.git
   cd book-management-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables (see [Environment Variables](#environment-variables) section)

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Base URL for the backend API (required)
REACT_APP_API_URL=http://localhost:5000/api

# Enable/disable debug logging (optional, default: false)
REACT_APP_DEBUG=false

# Authentication token expiration in hours (optional, default: 24)
REACT_APP_TOKEN_EXPIRATION_HOURS=24

# Google Analytics ID (optional)
# REACT_APP_GA_TRACKING_ID=UA-XXXXX-Y

# Sentry DSN for error tracking (optional)
# REACT_APP_SENTRY_DSN=your-sentry-dsn
```

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── config.ts           # Axios instance and interceptors
│   ├── bookService.ts      # Book-related API calls
│   └── authService.ts      # Authentication API calls
│
├── assets/               # Static assets (images, fonts, etc.)
│   └── images/
│
├── components/            # Reusable UI components
│   ├── common/            # Common components (buttons, inputs, etc.)
│   ├── layout/            # Layout components (header, footer, etc.)
│   └── ui/                # UI components (modals, dialogs, etc.)
│
├── contexts/             # React context providers
│   └── AuthContext.tsx    # Authentication context
│
├── hooks/                # Custom React hooks
│   └── useAuth.ts         # Authentication hook
│
├── pages/                # Page components
│   ├── HomePage.tsx       # Home/Dashboard page
│   ├── LoginPage.tsx      # Login page
│   ├── RegisterPage.tsx   # Registration page
│   ├── BooksPage.tsx      # Book listing page
│   ├── BookDetailsPage.tsx # Book details page
│   ├── CheckoutsPage.tsx  # User's checkouts page
│   └── Admin/             # Admin-only pages
│       └── DashboardPage.tsx
│
├── routes/               # Application routes
│   └── AppRoutes.tsx      # Main routing configuration
│
├── styles/               # Global styles and themes
│   ├── theme.ts
│   └── global.css
│
├── types/                # TypeScript type definitions
│   ├── book.ts
│   ├── user.ts
│   └── index.ts
│
├── utils/                # Utility functions
│   ├── api.ts            # API helpers
│   └── formatters.ts     # Data formatting utilities
│
├── App.tsx              # Main application component
└── index.tsx             # Application entry point
```

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run build` - Build the app for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run eject` - Eject from create-react-app (not recommended)

## Authentication Flow

The application uses JWT (JSON Web Tokens) for authentication. The token is stored in `localStorage` and automatically included in API requests via an Axios interceptor.

## Error Handling

- API errors are intercepted and handled centrally in `api/config.ts`
- User-friendly error messages are displayed using Material-UI's Snackbar component
- Network errors are automatically retried with exponential backoff

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
