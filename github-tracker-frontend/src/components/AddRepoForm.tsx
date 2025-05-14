import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GitHubIcon from '@mui/icons-material/GitHub';

interface AddRepoResponse {
  addRepository: {
    id: string;
    name: string;
  };
}

interface AddRepoVariables {
  owner: string;
  name: string;
}

const ADD_REPO = gql`
  mutation AddRepo($owner: String!, $name: String!) {
    addRepository(owner: $owner, name: $name) {
      id
      name
    }
  }
`;

export default function AddRepoForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [addRepository, { loading }] = useMutation<AddRepoResponse, AddRepoVariables>(ADD_REPO, {
    onError: (error) => {
      setError(error.message);
    },
    onCompleted: () => {
      setUrl('');
      setError(null);
    },
    refetchQueries: ['GetRepositories']
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Repository URL is required');
      return;
    }

    // Basic GitHub URL validation
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/([\w-]+)\/([\w-]+)$/;
    const match = url.match(githubUrlPattern);
    
    if (!match) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    const [, , owner, name] = match;
    addRepository({ variables: { owner, name } });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Repository
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="GitHub Repository URL"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            disabled={loading}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GitHubIcon />
                </InputAdornment>
              ),
            }}
            helperText="Enter the full GitHub repository URL"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ mt: 2 }}
          >
            {loading ? 'Adding...' : 'Track Repository'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}