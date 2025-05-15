import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Link,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GitHubIcon from '@mui/icons-material/GitHub';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';

interface Commit {
  sha: string;
  message: string;
  author: string | null;
  date: string | null;
  url: string;
}

interface Release {
  id: string;
  version: string;
  releaseDate: string;
  releaseNotes: string | null;
  commitHistory: Commit[];
  seen: boolean;
}

interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description: string;
  latestRelease: Release;
}

interface MarkAsSeenResponse {
  markAsSeen: boolean;
}

interface MarkAsSeenVariables {
  repoId: string;
}

const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      name
      owner
      url
      description
      latestRelease {
        id
        version
        releaseDate
        releaseNotes
        seen
      }
    }
  }
`;

const MARK_AS_SEEN = gql`
  mutation MarkAsSeen($repoId: ID!) {
    markAsSeen(repoId: $repoId)
  }
`;

const REMOVE_REPOSITORY = gql`
  mutation RemoveRepository($repoId: ID!) {
    removeRepository(repoId: $repoId)
  }
`;

const REFRESH_REPOSITORY = gql`
  mutation RefreshRepository($repoId: ID!) {
    refreshRepository(repoId: $repoId) {
      id
      name
      owner
      url
      description
      latestRelease {
        id
        version
        releaseDate
        releaseNotes
        seen
      }
    }
  }
`;

const formatReleaseDate = (dateString: string | null): string => {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

type SortField = 'nameAsc' | 'nameDesc' | 'releaseDate' | 'updateStatus';
type FilterStatus = 'all' | 'seen' | 'unseen';

export default function RepositoryList() {
  const client = useApolloClient();
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousVersions, setPreviousVersions] = useState<Record<string, string>>({});
  
  const { loading, error, data, refetch } = useQuery<{ repositories: Repository[] }>(GET_REPOSITORIES, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    pollInterval: 300000, // Poll every 5 minutes
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setLastRefreshed(new Date());
      // Store current versions for comparison
      const newVersions: Record<string, string> = {};
      data.repositories.forEach(repo => {
        if (repo.latestRelease) {
          newVersions[repo.id] = repo.latestRelease.version;
        }
      });
      setPreviousVersions(newVersions);
    }
  });

  const [markAsSeen] = useMutation<MarkAsSeenResponse, MarkAsSeenVariables>(MARK_AS_SEEN, {
    update(cache, { data }, { variables }) {
      if (data?.markAsSeen && variables?.repoId) {
        const existingData = cache.readQuery<{ repositories: Repository[] }>({
          query: GET_REPOSITORIES,
        });

        if (existingData) {
          const updatedRepositories = existingData.repositories.map(repo => {
            if (repo.id === variables.repoId && repo.latestRelease) {
              return {
                ...repo,
                latestRelease: {
                  ...repo.latestRelease,
                  seen: !repo.latestRelease.seen,
                },
              };
            }
            return repo;
          });

          cache.writeQuery({
            query: GET_REPOSITORIES,
            data: {
              repositories: updatedRepositories,
            },
          });
        }
      }
    },
  });

  const [removeRepository] = useMutation(REMOVE_REPOSITORY, {
    update(cache, { data }) {
      if (data?.removeRepository) {
        const existingData = cache.readQuery<{ repositories: Repository[] }>({
          query: GET_REPOSITORIES,
        });

        if (existingData) {
          const updatedRepositories = existingData.repositories.filter(
            repo => repo.id !== data.removeRepository
          );

          cache.writeQuery({
            query: GET_REPOSITORIES,
            data: {
              repositories: updatedRepositories,
            },
          });
        }
      }
    },
  });

  const [refreshRepository] = useMutation(REFRESH_REPOSITORY, {
    update(cache, { data }) {
      if (data?.refreshRepository) {
        const existingData = cache.readQuery<{ repositories: Repository[] }>({
          query: GET_REPOSITORIES,
        });

        if (existingData) {
          const updatedRepositories = existingData.repositories.map(repo => 
            repo.id === data.refreshRepository.id ? data.refreshRepository : repo
          );

          cache.writeQuery({
            query: GET_REPOSITORIES,
            data: {
              repositories: updatedRepositories,
            },
          });
        }
      }
    },
  });

  const handleMarkSeen = async (repositoryId: string, currentSeenStatus: boolean) => {
    try {
      const result = await markAsSeen({
        variables: { repoId: repositoryId },
        optimisticResponse: {
          markAsSeen: true,
        },
        update(cache, { data }) {
          if (data?.markAsSeen) {
            const existingData = cache.readQuery<{ repositories: Repository[] }>({
              query: GET_REPOSITORIES,
            });

            if (existingData) {
              const updatedRepositories = existingData.repositories.map(repo => {
                if (repo.id === repositoryId && repo.latestRelease) {
                  return {
                    ...repo,
                    latestRelease: {
                      ...repo.latestRelease,
                      seen: !currentSeenStatus,
                    },
                  };
                }
                return repo;
              });

              cache.writeQuery({
                query: GET_REPOSITORIES,
                data: {
                  repositories: updatedRepositories,
                },
              });
            }
          }
        },
      });

      // If the mutation failed, refetch to ensure we have the correct state
      if (!result.data?.markAsSeen) {
        refetch();
      }
    } catch (error) {
      console.error('Error marking release as seen:', error);
      // If there's an error, refetch to ensure we have the correct state
      refetch();
    }
  };

  const handleRemove = async (repositoryId: string) => {
    try {
      // Optimistically update the cache
      const existingData = client.cache.readQuery<{ repositories: Repository[] }>({
        query: GET_REPOSITORIES,
      });

      if (existingData) {
        const updatedRepositories = existingData.repositories.filter(
          repo => repo.id !== repositoryId
        );

        client.cache.writeQuery({
          query: GET_REPOSITORIES,
          data: {
            repositories: updatedRepositories,
          },
        });
      }

      // Perform the mutation
      await removeRepository({
        variables: { repoId: repositoryId },
      });
    } catch (error) {
      console.error('Error removing repository:', error);
      refetch();
    }
  };

  const toggleExpand = (repoId: string) => {
    setExpandedRepo(expandedRepo === repoId ? null : repoId);
  };

  const handleSortFieldChange = (event: SelectChangeEvent) => {
    setSortField(event.target.value as SortField);
  };

  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value as FilterStatus);
  };

  const filteredAndSortedRepositories = useMemo(() => {
    if (!data?.repositories) return [];

    let filtered = [...data.repositories];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(repo => {
        if (filterStatus === 'seen') {
          return repo.latestRelease?.seen;
        } else {
          return !repo.latestRelease?.seen;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'nameAsc':
          comparison = `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`);
          return comparison;
        case 'nameDesc':
          comparison = `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`);
          return -comparison;
        case 'releaseDate':
          const dateA = a.latestRelease?.releaseDate ? new Date(a.latestRelease.releaseDate).getTime() : 0;
          const dateB = b.latestRelease?.releaseDate ? new Date(b.latestRelease.releaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'updateStatus':
          const statusA = a.latestRelease?.seen ? 1 : 0;
          const statusB = b.latestRelease?.seen ? 1 : 0;
          comparison = statusB - statusA; // Inverted to put unseen (0) at the top
          break;
      }

      return -comparison; // Always sort in descending order for non-name sorts
    });

    return filtered;
  }, [data?.repositories, sortField, filterStatus]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading repositories: {error.message}
      </Alert>
    );
  }

  const handleRefresh = async () => {
    if (!data?.repositories) return;
    
    setIsRefreshing(true);
    try {
      // Refresh each repository
      await Promise.all(
        data.repositories.map(repo => 
          refreshRepository({ 
            variables: { repoId: repo.id },
            optimisticResponse: {
              refreshRepository: {
                ...repo,
                __typename: 'Repository'
              }
            }
          })
        )
      );
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing repositories:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2,
        mb: 2 
      }}>
        <Typography variant="h5" component="h2">
          Tracked Repositories
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          {lastRefreshed && (
            <Typography variant="caption" color="text.secondary">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
            fullWidth={false}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ 
          mb: 3,
          '& .MuiFormControl-root': {
            width: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortField}
            label="Sort By"
            onChange={handleSortFieldChange}
            startAdornment={
              <SortIcon sx={{ mr: 1, color: 'action.active' }} />
            }
          >
            <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
            <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
            <MenuItem value="releaseDate">Release Date</MenuItem>
            <MenuItem value="updateStatus">Seen Status</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterStatus}
            label="Filter"
            onChange={handleFilterStatusChange}
            startAdornment={
              <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
            }
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="seen">Seen</MenuItem>
            <MenuItem value="unseen">Unseen</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {filteredAndSortedRepositories.length === 0 ? (
        <Alert severity="info">
          No repositories match the current filters.
        </Alert>
      ) : (
        <List>
          {filteredAndSortedRepositories.map(repo => (
            <ListItem
              key={repo.id}
              divider
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                py: 2,
                bgcolor: !repo.latestRelease?.seen ? 'action.hover' : 'inherit',
                transition: 'background-color 0.2s'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', sm: 'flex-start' }, 
                gap: 1,
                mb: 1 
              }}>
                <ListItemText
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        wordBreak: 'break-word'
                      }}>
                        {repo.owner}/{repo.name}
                      </Typography>
                      <Link
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <GitHubIcon fontSize="small" />
                      </Link>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word'
                      }}
                    >
                      {repo.description || 'No description available'}
                    </Typography>
                  }
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                }}>
                  {repo.latestRelease && (
                    <Tooltip title={repo.latestRelease.seen ? "Mark as unseen" : "Mark as seen"}>
                      <IconButton 
                        size="small"
                        onClick={() => handleMarkSeen(repo.id, repo.latestRelease.seen)}
                      >
                        {repo.latestRelease.seen ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Remove repository">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemove(repo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {repo.latestRelease && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    mt: 1,
                    alignItems: 'center'
                  }}>
                    <Chip
                      icon={<UpdateIcon />}
                      label={repo.latestRelease.version}
                      size="small"
                      color={repo.latestRelease.seen ? "secondary" : "error"}
                      variant="outlined"
                      sx={{
                        position: 'relative',
                        '&::after': previousVersions[repo.id] !== repo.latestRelease.version ? {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          border: '2px solid',
                          borderColor: 'background.paper'
                        } : {}
                      }}
                    />
                    <Chip
                      label={`Released ${formatReleaseDate(repo.latestRelease.releaseDate)}`}
                      size="small"
                      color={repo.latestRelease.seen ? "default" : "error"}
                      variant="outlined"
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(repo.id)}
                      sx={{ ml: 'auto' }}
                    >
                      {expandedRepo === repo.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedRepo === repo.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pl: { xs: 0, sm: 2 } }}>
                      {repo.latestRelease.releaseNotes && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Release Notes
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ 
                              whiteSpace: 'pre-wrap', 
                              mb: 2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {repo.latestRelease.releaseNotes}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}