# ROSSOPROMOS

A React + Vite web application for managing and displaying promotions/deals.

## Tech Stack

- **Frontend**: React 19, React Router DOM 7, Bootstrap 5
- **Backend/DB**: Supabase
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **Build**: Vite 7
- **Deploy**: Netlify (see `netlify.toml`)

## Project Structure

```
src/
  App.jsx          - Root component with routing
  main.jsx         - Entry point
  supabaseClient.js - Supabase client initialization
  constants.js     - Shared constants
  index.css        - Global styles
  pages/
    Home.jsx       - Public-facing promotions page
    Admin.jsx      - Admin panel (protected)
    Login.jsx      - Login page
  components/
    Navbar.jsx
    PrivateRoute.jsx - Auth guard for /admin
    WhatsAppButton.jsx
    Newsletter.jsx
```

## Routes

- `/` — Home (public)
- `/login` — Login page
- `/admin` — Admin panel (protected by PrivateRoute)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Requirements

- Node >= 20.0.0
