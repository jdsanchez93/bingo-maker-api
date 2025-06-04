'use client';

import { Box, CircularProgress, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from "@auth0/auth0-react";
import { Link as RouterLink } from 'react-router';


interface BingoItem {
  id: string;
  label: string;
}

interface ItemCategory {
  name: string;
  type: string;
  items: BingoItem[];
}

interface GameConfig {
  gameId: string;
  categories: ItemCategory[];
}

export default function LatestBoards() {
  const { getAccessTokenSilently } = useAuth0();

  const { isLoading, error, data } = useQuery<GameConfig[]>({
    queryKey: ['latestGameConfigs'],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(`/api/GameConfig/latest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch latest game boards");
      return (await res.json()) as GameConfig[];
    }
  });


  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error loading game boards.</Typography>;
  }

  return (
    <Box >
      <Typography variant="h5" gutterBottom>
        Choose a game:
      </Typography>
      <List>
        {data?.map((board) => (
          <ListItem key={board.gameId} disablePadding>
            <ListItemButton component={RouterLink} to={`/game/${board.gameId}`}>
              <ListItemText
                primary={`${board.gameId}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}