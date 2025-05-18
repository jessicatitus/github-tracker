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
   - 5-minute polling interval balances freshness with API rate limits
   - Manual refresh option for immediate updates
   - Batch updates to minimize database operations
   - Caching strategy balances freshness with performance
   - Theme changes optimized to prevent unnecessary refetches

2. **UI/UX**:
   - Prioritized mobile-first design over complex desktop features
   - Simplified filtering to essential use cases
   - Used Material-UI components for rapid development and consistency
   - Client-side theme management for instant feedback
   - Green dot indicator shows "new since last check" rather than permanent new status

3. **Performance**:
   - Optimistic UI updates for better perceived performance
   - Efficient caching to minimize network requests
   - Database queries optimized with proper indexing
   - Apollo Client cache-first policy for optimal performance
   - Batch processing of repository updates

## Technical Implementation Details

### Repository Submission Process
When you submit a repository:

1. Frontend:
   - Validates the input format
   - Sends a GraphQL mutation to the backend
   - Shows loading state
   - Handles validation errors with user-friendly messages

2. Backend:
   - Validates the repository exists on GitHub
   - Fetches repository details using Octokit
   - Gets the latest release information
   - Stores in PostgreSQL:
     - Repository info in `repositories` table
     - Release info in `releases` table
     - Initial seen status in `seen_status` table
   - Error Handling:
     - Returns appropriate error for non-existent repositories
     - Handles GitHub API rate limits
     - Manages database connection failures
     - Provides detailed error messages

3. Database:
   - Creates new records with proper foreign key relationships
   - Ensures data integrity with constraints
   - Handles concurrent submissions
   - Manages transaction rollbacks on failure

4. Response:
   - Returns the new repository data
   - Updates Apollo Client cache
   - Updates UI to show the new repository
   - Shows success/error message
   - Handles partial success cases

### 5-Minute Refresh Interval
- We chose 5 minutes as a balance between keeping data fresh and not overwhelming the GitHub API
- When it refreshes, it:
  1. Queries the database for all tracked repositories
  2. For each repo, calls the GitHub API to check for new releases
  3. If a new release is found, it's added to the database
  4. The green dot appears to indicate new data
- Error Handling:
  1. Implements exponential backoff for failed refreshes
  2. Continues processing other repositories if one fails
  3. Logs errors for monitoring
  4. Maintains last successful refresh timestamp
- GitHub API Issues:
  1. Handles rate limiting with proper delays
  2. Continues operation if API is temporarily down
  3. Retries failed requests with backoff
  4. Maintains data consistency during API issues

### Green Dot Indicator
- The green dot is a Material-UI component that appears when:
  1. A new release is detected during the 5-minute refresh
  2. A manual refresh finds a new release
- It goes away on page refresh because it's stored in the Apollo Client cache
- This is intentional to show "new since last check" rather than "new since forever"
- Cache Management:
  1. Properly invalidates on new data
  2. Persists across component re-renders
  3. Resets on page refresh
  4. Handles concurrent updates

### Status Persistence
- Status (seen/unseen) persists because:
  1. It's stored in the PostgreSQL database in the `seen_status` table
  2. Each release has a boolean `seen` field
  3. The status is loaded when the app starts and saved on each toggle
  4. The database ensures the data survives server restarts and page refreshes
- Concurrency Handling:
  1. Uses database transactions for updates
  2. Handles race conditions
  3. Maintains consistency across multiple users
  4. Recovers from failed updates

### Filtering System
- Filtering works through:
  1. GraphQL queries that include filter parameters
  2. PostgreSQL queries that filter based on the `seen_status` table
  3. Client-side state management with Apollo Client
  4. Material-UI components for the filter UI
- Performance Optimizations:
  1. Indexed database fields for fast filtering
  2. Pagination for large datasets
  3. Cached filter results
  4. Optimized query patterns

### Manual Refresh
- When you click refresh:
  1. It immediately triggers the GitHub API check for all repositories
  2. Bypasses the 5-minute wait
  3. Updates the database with any new releases
  4. Refreshes the Apollo Client cache
  5. Updates the UI to show new data
- Concurrency Handling:
  1. Prevents multiple simultaneous refreshes
  2. Shows loading state during refresh
  3. Handles failed refreshes gracefully
  4. Maintains UI responsiveness

### Dark Mode & Theme System
- Dark mode implementation:
  1. Material-UI's theme system for consistent styling
  2. System preference detection using `prefers-color-scheme`
  3. Theme preference stored in localStorage
  4. Theme context provider wrapping the app
  5. CSS variables for dynamic color switching
- Features:
  1. Automatic system preference detection
  2. Manual theme toggle option
  3. Persistent theme selection
  4. Smooth theme transitions
  5. Consistent styling across components
- Optimizations:
  1. Instant theme switching without server requests
  2. Prevents unnecessary re-renders
  3. No API calls during theme changes
  4. Efficient state management
- Performance Considerations:
  1. Theme changes don't trigger data refetches
  2. Smooth transitions between themes
  3. No layout shifts during theme changes
  4. Efficient CSS variable updates

### Data Fetching & Caching
- Apollo Client Optimization:
  1. Implements `cache-first` policy to minimize network requests
  2. Caches repository data locally for better performance
  3. Manages optimistic updates for better UX
  4. Handles cache invalidation on mutations
- Fetch Triggers:
  1. Manual refresh (via refresh button)
  2. Adding/removing repositories
  3. Marking repositories as seen/unseen
  4. Every 5 minutes (polling interval)
- Performance Optimizations:
  1. Prevents unnecessary refetches during theme changes
  2. Batch updates to minimize database operations
  3. Efficient caching to minimize network requests
  4. Optimistic UI updates for better perceived performance
- Cache Management:
  1. Proper invalidation strategies
  2. Handles stale data gracefully
  3. Manages cache size
  4. Recovers from cache corruption

### Error Handling & Recovery
- GitHub API Rate Limits:
  1. Implements exponential backoff for rate limit errors
  2. Caches responses to minimize API calls
  3. Shows user-friendly messages when limits are reached
  4. Automatically retries after rate limit window
- Repository Access Issues:
  1. Handles deleted or made-private repositories gracefully
  2. Shows appropriate error messages to users
  3. Maintains database integrity
  4. Allows manual removal of inaccessible repositories
- Connection Error Handling:
  1. Implements retry logic for failed requests
  2. Shows user-friendly error messages
  3. Maintains application state during errors
  4. Provides manual refresh option when automatic updates fail
- Network Issues:
  1. Handles timeouts gracefully
  2. Implements circuit breaker pattern
  3. Maintains offline functionality
  4. Recovers from network interruptions

### Data Flow Architecture
- Apollo Client Cache Management:
  1. Implements `cache-first` policy for optimal performance
  2. Normalizes data to prevent duplicates
  3. Manages optimistic updates for better UX
  4. Handles cache invalidation on mutations
- GraphQL Schema Structure:
  1. Defines clear types for repositories and releases
  2. Implements proper input validation
  3. Uses fragments for reusable query parts
  4. Optimizes query depth and complexity
- Database Normalization:
  1. Proper table relationships with foreign keys
  2. Indexed fields for better query performance
  3. Cascading deletes for data integrity
  4. Efficient join operations for related data
- Frontend-Backend Communication:
  1. RESTful GraphQL API design
  2. Proper error handling and status codes
  3. Type-safe communication with TypeScript
  4. Efficient data transfer with proper field selection
- Data Consistency:
  1. Handles concurrent updates
  2. Maintains referential integrity
  3. Implements proper locking strategies
  4. Recovers from partial failures

### Security Measures
- GitHub Token Management:
  1. Secure storage in environment variables
  2. No token exposure in client-side code
  3. Proper token scoping for minimal permissions
  4. Regular token rotation capability
  5. Handles token expiration gracefully
- Database Security:
  1. Connection string encryption
  2. Proper user permissions
  3. Prepared statements to prevent SQL injection
  4. Regular security audits
  5. Secure password handling
- Input Sanitization:
  1. Server-side validation of all inputs
  2. Type checking with TypeScript
  3. GraphQL input validation
  4. Proper error handling for invalid inputs
  5. XSS prevention
- API Protection:
  1. Rate limiting on endpoints
  2. CORS configuration
  3. Input validation middleware
  4. Error message sanitization
  5. Protection against common attacks

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