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
- GitHub account with a Personal Access Token (PAT)

### Database Setup
1. Create a PostgreSQL database:
```bash
createdb github_tracker
```

2. Run the schema:
```bash
cd github-tracker-backend
psql -d github_tracker -f schema.sql
```

### Backend Setup
1. Install dependencies:
```bash
cd github-tracker-backend
npm install
```

2. Create a `.env` file in the `github-tracker-backend` directory with the following content:
```bash
# Database configuration
DATABASE_URL=postgres://localhost/github_tracker

# GitHub API token (required)
GITHUB_TOKEN=your_github_token_here
```

Note: If you have a password set for PostgreSQL, use this format instead:
```bash
DATABASE_URL=postgres://username:password@localhost/github_tracker
```

3. Create a GitHub Personal Access Token (PAT):
   - Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Generate new token (classic)
   - Select scopes: 'repo' (for private repos) and 'read:user'
   - Copy the token and paste it as the value for `GITHUB_TOKEN` in your `.env` file

4. Start the backend server:
```bash
npx ts-node src/index.ts
```

### Frontend Setup
1. Install dependencies:
```bash
cd ../github-tracker-frontend  # If you're in the backend directory
# OR
cd github-tracker-frontend     # If you're in the root directory
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Troubleshooting

### Debugging and Logs

#### Frontend Logs
1. **Browser Developer Tools**
   - Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
   - Go to the "Console" tab to see JavaScript errors and logs
   - Check the "Network" tab for API request/response issues
   - Look for red error messages or yellow warnings

2. **React Developer Tools**
   - Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) browser extension
   - Use the "Components" tab to inspect React component state
   - Use the "Profiler" tab to debug performance issues

3. **Apollo Client DevTools**
   - Install [Apollo Client DevTools](https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm) browser extension
   - Monitor GraphQL queries and mutations
   - Inspect Apollo cache state
   - Debug network requests

#### Backend Logs
1. **Server Console**
   - Check the terminal where you ran `npx ts-node src/index.ts`
   - Look for error messages and stack traces
   - Monitor database query logs

2. **Database Logs**
   - PostgreSQL logs location:
     ```bash
     # macOS
     /usr/local/var/log/postgres.log
     
     # Linux
     /var/log/postgresql/postgresql-*.log
     
     # Windows
     C:\Program Files\PostgreSQL\[version]\data\log
     ```

3. **Environment Variables**
   - Check `.env` file in `github-tracker-backend` directory
   - Verify `DATABASE_URL` and `GITHUB_TOKEN` are set correctly
   - Ensure no extra spaces or quotes in values

### Database Connection Setup
The application uses a separate `db.ts` file to handle database connections. This ensures that:
- Environment variables are loaded before database connection attempts
- Database connection logic is centralized and reusable
- Proper error handling for missing configuration

If you encounter the error "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string":
1. Verify your `.env` file has the correct DATABASE_URL format:
```bash
# Without password
DATABASE_URL=postgres://localhost/github_tracker

# With password
DATABASE_URL=postgres://username:password@localhost/github_tracker
```
2. Ensure there are no extra spaces or quotes in the connection string
3. Make sure PostgreSQL is running and the database exists
4. Verify the database user has proper permissions

### Database Connection Issues
If you encounter database connection errors:

1. Verify PostgreSQL is running:
```bash
# On macOS
brew services list
# On Linux
sudo service postgresql status
# On Windows
# Check Services app for PostgreSQL service
```

2. Try alternative database connection strings:
```bash
# Default connection
DATABASE_URL=postgres://localhost/github_tracker

# With password
DATABASE_URL=postgres://username:password@localhost/github_tracker

# With custom port
DATABASE_URL=postgres://localhost:5432/github_tracker
```

3. Verify database exists:
```bash
psql -l  # List all databases
```

4. Check database permissions:
```bash
psql -d github_tracker -c "\du"  # List users and their roles
```

### Common Issues
1. "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
   - Solution: Ensure your DATABASE_URL is properly formatted in the .env file
   - Check that PostgreSQL is running
   - Verify database exists and is accessible

2. "Error loading repositories"
   - Check that the backend server is running
   - Verify your GitHub token is valid
   - Ensure database connection is working

3. "Cannot find module"
   - Run `npm install` in both frontend and backend directories
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

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
psql -d github_tracker -c "SELECT * FROM repositories;"
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