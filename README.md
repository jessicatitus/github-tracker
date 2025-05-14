# GitHub Tracker

This project helps users track GitHub repositories and see the latest releases.

## Tech Stack

### Frontend
- **React** (v18.2.0) - UI library for building the user interface
- **TypeScript** (v4.9.5) - Type-safe JavaScript for better development experience
- **Material-UI** (v7.1.0) - Component library for consistent, responsive design
  - @mui/material - Core components
  - @mui/icons-material - Icon components
  - @emotion/react & @emotion/styled - Styling solution
- **Apollo Client** (v3.8.0) - GraphQL client for data fetching and state management
- **GraphQL** (v16.0.0) - Query language for API

### Backend
- **Node.js** (v14+) - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** (v12+) - Relational database for data persistence
- **GraphQL** - API query language and runtime
- **GitHub API** - External API for repository data
- **Octokit** - Official GitHub REST API client for Node.js
  - Handles authentication and rate limiting
  - Provides type-safe API methods
  - Manages GitHub API requests efficiently

### Development Tools
- **React Scripts** (v5.0.1) - Development and build tooling
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking and compilation
- **Webpack** - Module bundling (via React Scripts)

### Key Features by Technology
- **TypeScript** - Type safety, better IDE support, and improved maintainability
- **Material-UI** - Responsive design, dark mode support, and consistent UI components
- **Apollo Client** - Efficient caching, real-time updates, and optimistic UI
- **PostgreSQL** - Reliable data persistence and complex queries
- **GraphQL** - Flexible data fetching and type-safe API

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Git

### Database Setup
1. Create a PostgreSQL database:
```bash
createdb github-tracker
```

2. Run the schema:
```bash
cd github-tracker-backend
psql -d github-tracker -f schema.sql
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd github-tracker-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your GitHub API token:
```bash
GITHUB_TOKEN=your_github_token_here
```

4. Start the backend server:
```bash
npx ts-node src/index.ts
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd github-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Features

- **Repository Tracking**: Add and monitor GitHub repositories
- **Release Monitoring**: Track latest releases and their details
- **Real-time Updates**: Automatic polling every 5 minutes for new releases
- **Manual Refresh**: Button to manually check for updates
- **Visual Notifications**: Green indicator dot appears when a repository's version changes after a refresh
- **Seen/Unseen Status**: Mark releases as seen or unseen
- **Filtering Options**: Filter repositories by seen/unseen status
- **Sorting Capabilities**: Sort by name (A-Z/Z-A), release date, or seen status
- **Responsive Design**: Works on both desktop and mobile devices
- **Dark Mode Support**: Automatically matches system preferences

## Technical Implementation Info

### Dark Mode
The application implements a client-side dark mode that:
- Detects system color scheme preferences
- Persists user theme preference in localStorage
- Provides instant theme switching without server requests
- Uses Material-UI's theming system for consistent styling
- Optimized to prevent unnecessary re-renders and API calls

### Data Fetching Optimization
The application uses Apollo Client with optimized caching:
- Implements `cache-first` policy to minimize network requests
- Caches repository data locally for better performance
- Only fetches new data when:
  - Manually refreshing (via refresh button)
  - Adding/removing repositories
  - Marking repositories as seen/unseen
  - Every 5 minutes (polling interval)
- Prevents unnecessary refetches during theme changes

## Implementation Notes

### Current Implementation
- Uses PostgreSQL for data persistence
- Implements GitHub API integration for real-time data
- Material-UI for consistent, responsive design
- TypeScript for type safety and better development experience
- Apollo Client for GraphQL state management
- Client-side theme management with localStorage persistence

### Trade-offs Made
1. **Data Fetching**:
   - Manual refresh instead of automatic polling to reduce API calls
   - Batch updates to minimize database operations
   - Caching strategy balances freshness with performance
   - Theme changes optimized to prevent unnecessary refetches

2. **UI/UX**:
   - Prioritized mobile-first design over complex desktop features
   - Simplified filtering to essential use cases
   - Used Material-UI components for rapid development and consistency
   - Client-side theme management for instant feedback

3. **Performance**:
   - Optimistic UI updates for better perceived performance
   - Limited real-time updates to reduce server load
   - Efficient caching to minimize network requests

## Future Improvements

### Short-term
1. **Enhanced Filtering**:
   - Advanced search with regex support
   - Custom filter combinations
   - Save favorite filters

2. **Notification System**:
   - Email notifications for new releases
   - Browser notifications
   - Custom notification preferences

3. **Data Visualization**:
   - Release frequency charts
   - Commit activity graphs
   - Contributor statistics

### Long-term
1. **Advanced Features**:
   - Multiple GitHub account support
   - Team collaboration features
   - Custom release tracking rules

2. **Performance**:
   - Implement WebSocket for real-time updates
   - Add Redis caching layer
   - Optimize database queries

3. **User Experience**:
   - Custom themes
   - Keyboard shortcuts
   - Progressive Web App (PWA) support

## Data Persistence

The application uses PostgreSQL for data persistence. All repository and release data is stored in the database and persists across sessions. The database schema includes:

- `repositories`: Stores tracked GitHub repositories
- `releases`: Stores release information for each repository
- `seen_status`: Tracks which releases have been viewed

### Testing Data Persistence

To verify that data persists correctly:

1. Start both the backend and frontend servers
2. Add a repository through the frontend interface
3. Verify the repository appears in the list
4. Stop both servers
5. Restart both servers
6. Confirm the repository data is still present

You can also verify data directly in the database:

```bash
psql -d github-tracker -c "SELECT * FROM repositories;"
```

### Database Schema

```sql
CREATE TABLE repositories (
    id SERIAL PRIMARY KEY,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT
);

CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_date TIMESTAMP NOT NULL,
    release_notes TEXT
);

CREATE TABLE seen_status (
    id SERIAL PRIMARY KEY,
    release_id INTEGER REFERENCES releases(id) ON DELETE CASCADE,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(release_id)
);
```

The data will persist even if you:
- Restart the servers
- Restart your computer