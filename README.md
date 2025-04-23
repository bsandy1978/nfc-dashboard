# NFC Dashboard Frontend

This is the frontend application for the NFC Dashboard project. It allows users to create and manage digital business cards that can be accessed via NFC tags.

## Features

- Create and manage digital business cards
- Share profiles via QR codes
- Schedule appointments
- Admin dashboard for managing slugs
- Responsive design with dark mode support
- Google authentication for admin access

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nfc-dashboard.git
cd nfc-dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
# Base URL of your backend API
NEXT_PUBLIC_API_BASE_URL=https://nfc-dashboard-server.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Emails (comma-separated)
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Session max age in seconds (optional, default: 86400)
SESSION_MAX_AGE=86400
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/pages` - Next.js pages
  - `/api` - API routes
  - `/p/[slug].tsx` - Profile page
  - `/admin.tsx` - Admin dashboard
- `/styles` - CSS styles
- `/public` - Static assets

## API Integration

The frontend communicates with the backend API at the URL specified in the `NEXT_PUBLIC_API_BASE_URL` environment variable. The API endpoints include:

- `/api/profiles` - Profile management
- `/api/slugs` - Slug generation and management
- `/api/appointments` - Appointment scheduling

## Authentication

Authentication is handled using NextAuth.js with Google OAuth. The admin dashboard is protected and requires authentication to access.

## Deployment

This project can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

## Notes
- Ensure all required environment variables are set, or the app may not function correctly.
- The Google Client ID is used for both backend and frontend authentication.
- `NEXT_PUBLIC_ADMIN_EMAILS` controls admin access in the dashboard and NFC links management.
- `SESSION_MAX_AGE` controls session expiry for authentication (in seconds).

## License

This project is licensed under the MIT License - see the LICENSE file for details.