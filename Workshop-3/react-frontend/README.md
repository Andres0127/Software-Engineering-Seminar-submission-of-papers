# React Frontend - Eventify Platform

## Overview

The **Eventify React Frontend** is a modern, responsive web application built with **React 18**, **TypeScript**, and **Tailwind CSS**. It provides an intuitive user interface for browsing events, managing tickets, and processing orders in the Eventify platform.

---

## Architecture & Design Decisions

### Technology Stack

- **Framework:** React 18.3
- **Language:** TypeScript 4.x
- **Styling:** Tailwind CSS 3.x
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Build Tool:** Create React App (Webpack)
- **Testing:** Jest + React Testing Library

### Why React?

1. **Component-Based Architecture:** Reusable UI components for maintainability
2. **Virtual DOM:** Efficient rendering and performance
3. **Rich Ecosystem:** Extensive libraries and tooling support
4. **Developer Experience:** Hot reloading, debugging tools, and strong community
5. **Industry Standard:** Widely adopted for enterprise applications
6. **Type Safety:** TypeScript provides compile-time error detection

### Why TypeScript?

- **Type Safety:** Catch errors during development, not in production
- **Better IDE Support:** Autocomplete, refactoring, and inline documentation
- **Self-Documenting Code:** Types serve as inline documentation
- **Scalability:** Easier to maintain large codebases
- **Refactoring Confidence:** Safe code changes with compiler verification

### Why Tailwind CSS?

1. **Utility-First:** Rapid UI development without writing custom CSS
2. **Consistency:** Design system enforced through utility classes
3. **Performance:** Purges unused CSS in production builds
4. **Responsive Design:** Mobile-first breakpoints built-in
5. **Customization:** Easily themed via `tailwind.config.js`
6. **No Naming Conflicts:** No need to invent class names

### Why Redux Toolkit?

- **Centralized State:** Single source of truth for application state
- **Predictable Updates:** Immutable state changes via reducers
- **DevTools Integration:** Time-travel debugging
- **Middleware Support:** Async actions, logging, persistence
- **Simplified Boilerplate:** RTK reduces Redux configuration complexity

---

## Architectural Role

In the **microservices architecture** of Eventify, the frontend serves as the **User Interface Layer**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Eventify Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  React Frontend                       │   │
│  │                   (Port 3000)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Home      │  │   Events    │  │   Tickets   │  │   │
│  │  │   Page      │  │   Browse    │  │   Purchase  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Login     │  │   Register  │  │   Profile   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                              │                      │
│         ▼                              ▼                      │
│  ┌──────────────┐              ┌──────────────┐             │
│  │  Java Auth   │              │   Python     │             │
│  │   Backend    │              │   Backend    │             │
│  │ (Port 8081)  │              │ (Port 8000)  │             │
│  └──────────────┘              └──────────────┘             │
│         │                              │                      │
│         ▼                              ▼                      │
│  ┌──────────────┐              ┌──────────────┐             │
│  │    MySQL     │              │  PostgreSQL  │             │
│  │  (Auth DB)   │              │  (Event DB)  │             │
│  └──────────────┘              └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Responsibilities

1. **User Authentication:** Login, registration, and session management
2. **Event Browsing:** Search, filter, and view event details
3. **Ticket Management:** View available tickets and pricing
4. **Order Processing:** Shopping cart and checkout flow
5. **User Profile:** Account settings and order history
6. **Responsive Design:** Mobile, tablet, and desktop support

---

## Project Structure

```
react-frontend/
├── public/
│   ├── index.html              # HTML entry point
│   ├── manifest.json            # PWA manifest
│   └── robots.txt               # SEO configuration
├── src/
│   ├── index.tsx                # Application entry point
│   ├── App.tsx                  # Root component
│   ├── index.css                # Global styles + Tailwind imports
│   ├── components/              # Reusable UI components
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── Footer.tsx           # Page footer
│   │   ├── EventCard.tsx        # Event display card
│   │   ├── TicketCard.tsx       # Ticket display card
│   │   ├── SearchBar.tsx        # Event search input
│   │   ├── FilterPanel.tsx      # Event filtering controls
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   └── ErrorMessage.tsx     # Error display
│   ├── pages/                   # Page components (routes)
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── EventsPage.tsx       # Event listing
│   │   ├── EventDetailPage.tsx  # Single event view
│   │   ├── TicketsPage.tsx      # Ticket selection
│   │   ├── CheckoutPage.tsx     # Order checkout
│   │   ├── LoginPage.tsx        # User login
│   │   ├── RegisterPage.tsx     # User registration
│   │   ├── ProfilePage.tsx      # User profile
│   │   └── NotFoundPage.tsx     # 404 page
│   ├── services/                # API integration
│   │   ├── api.ts               # Axios configuration
│   │   ├── authService.ts       # Authentication API calls
│   │   ├── eventService.ts      # Event API calls
│   │   ├── ticketService.ts     # Ticket API calls
│   │   └── orderService.ts      # Order API calls
│   ├── store/                   # Redux state management
│   │   ├── index.ts             # Store configuration
│   │   ├── authSlice.ts         # Authentication state
│   │   ├── eventSlice.ts        # Events state
│   │   ├── cartSlice.ts         # Shopping cart state
│   │   └── uiSlice.ts           # UI state (modals, notifications)
│   ├── types/                   # TypeScript type definitions
│   │   ├── event.ts             # Event-related types
│   │   ├── ticket.ts            # Ticket types
│   │   ├── order.ts             # Order types
│   │   └── user.ts              # User types
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts        # Date/currency formatting
│   │   ├── validators.ts        # Form validation
│   │   └── constants.ts         # App constants
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useEvents.ts         # Events data hook
│   │   └── useCart.ts           # Shopping cart hook
│   └── styles/                  # Additional CSS
│       └── components.css       # Component-specific styles
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── .env                         # Environment variables
```

---

## Key Features

### 1. Responsive Design

Built mobile-first with Tailwind breakpoints:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {events.map(event => <EventCard key={event.id} {...event} />)}
</div>
```

**Breakpoints:**
- `sm:` 640px+ (mobile landscape)
- `md:` 768px+ (tablet)
- `lg:` 1024px+ (desktop)
- `xl:` 1280px+ (large desktop)

### 2. Type-Safe API Integration

TypeScript interfaces ensure data consistency:

```typescript
interface Event {
  event_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location_id: number;
  category_id: number;
  capacity: number;
  base_price: number;
  status: 'published' | 'draft' | 'cancelled';
}

const fetchEvents = async (): Promise<Event[]> => {
  const response = await api.get<Event[]>('/api/events');
  return response.data;
};
```

### 3. Centralized State Management

Redux Toolkit slices manage global state:

```typescript
// authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);
```

### 4. Protected Routes

Authentication-based route guarding:

```tsx
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### 5. Shopping Cart

Persistent cart state with Redux:

```typescript
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0
  },
  reducers: {
    addToCart: (state, action) => {
      state.items.push(action.payload);
      state.total += action.payload.price * action.payload.quantity;
    },
    removeFromCart: (state, action) => {
      // ... removal logic
    }
  }
});
```

### 6. Form Validation

Client-side validation with TypeScript:

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Minimum 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Requires uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Requires number');
  return errors;
};
```

---

## UI Components

### Event Card

Displays event information with hover effects:

```tsx
<div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
  <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
  <div className="p-4">
    <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
    <p className="text-gray-600 mt-2">{event.description}</p>
    <div className="flex justify-between items-center mt-4">
      <span className="text-blue-600 font-semibold">${event.base_price}</span>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        View Details
      </button>
    </div>
  </div>
</div>
```

### Navigation Bar

Responsive navigation with authentication state:

```tsx
<nav className="bg-blue-600 text-white shadow-lg">
  <div className="container mx-auto px-4 py-3 flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold">Eventify</Link>
    <div className="hidden md:flex space-x-6">
      <Link to="/events" className="hover:text-blue-200">Events</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="hover:text-blue-200">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login" className="hover:text-blue-200">Login</Link>
      )}
    </div>
  </div>
</nav>
```

---

## API Integration

### Axios Configuration

Centralized API client with interceptors:

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Layer

Abstracted API calls:

```typescript
// services/eventService.ts
export const eventService = {
  getAll: () => api.get<Event[]>('/api/events'),
  
  getById: (id: number) => api.get<Event>(`/api/events/${id}`),
  
  getByCategory: (categoryId: number) => 
    api.get<Event[]>(`/api/events/category/${categoryId}`),
  
  create: (event: CreateEventDto) => 
    api.post<Event>('/api/events', event),
  
  update: (id: number, event: UpdateEventDto) => 
    api.put<Event>(`/api/events/${id}`, event),
  
  delete: (id: number) => 
    api.delete(`/api/events/${id}`)
};
```

---

## Routing

React Router v6 configuration:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Configuration

### Environment Variables

Create `.env` file:

```env
REACT_APP_JAVA_API_URL=http://localhost:8081
REACT_APP_PYTHON_API_URL=http://localhost:8000
REACT_APP_JWT_SECRET=your-jwt-secret
```

### Tailwind Configuration

Custom theme in `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

---

## Running the Application

### Prerequisites

- Node.js 18+
- npm 9+ or yarn

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser at http://localhost:3000
```

### Production Build

```bash
# Create optimized build
npm run build

# Build artifacts in build/ directory
# Serve with any static server:
npx serve -s build
```

### Docker

```bash
docker build -t eventplatform-frontend .
docker run -p 3000:3000 eventplatform-frontend
```

---

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
CI=true npm test -- --passWithNoTests --watchAll=false
```

### Test Example

```typescript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const element = screen.getByText(/Welcome to Eventify/i);
  expect(element).toBeInTheDocument();
});
```

---

## Performance Optimizations

1. **Code Splitting:** Lazy loading routes with `React.lazy()`
2. **Memoization:** `React.memo()` for expensive components
3. **Tree Shaking:** Webpack removes unused code
4. **Image Optimization:** WebP format with fallbacks
5. **CSS Purging:** Tailwind removes unused styles in production
6. **Bundle Analysis:** `npm run build` shows bundle size

---

## Accessibility

- **Semantic HTML:** Proper heading hierarchy and ARIA labels
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Color Contrast:** WCAG AA compliant color combinations
- **Screen Reader Support:** ARIA attributes for dynamic content
- **Focus Management:** Visible focus indicators

---

## Security Considerations

1. **XSS Protection:** React automatically escapes content
2. **HTTPS Only:** Production should use HTTPS
3. **Token Storage:** JWT stored in localStorage (consider httpOnly cookies for production)
4. **CORS:** Backend configured to allow only frontend origin
5. **Input Validation:** Client-side validation + server-side verification
6. **Dependency Scanning:** Regular npm audit for vulnerabilities

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

- **Progressive Web App (PWA):** Offline support and installability
- **Real-time Updates:** WebSocket for live event updates
- **Social Features:** Share events on social media
- **Multi-language Support:** i18n internationalization
- **Dark Mode:** Theme switcher
- **Advanced Search:** Elasticsearch integration for fuzzy search
- **Payment Integration:** Stripe checkout for real payments
- **Push Notifications:** Browser notifications for event reminders
- **Analytics:** Google Analytics / Mixpanel integration

---

## Troubleshooting

### Common Issues

**Problem:** `Module not found: Can't resolve 'axios'`
```bash
npm install axios
```

**Problem:** Tailwind styles not working
```bash
# Ensure index.css imports Tailwind directives:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```

**Problem:** CORS errors when calling API
```bash
# Ensure backend CORS allows http://localhost:3000
# Check .env has correct API URLs
```

**Problem:** Tests failing in CI
```bash
# Use CI mode to prevent watch mode:
CI=true npm test -- --passWithNoTests --watchAll=false
```

---

## License

Part of the Eventify platform - Educational project for Software Engineering Seminar.
