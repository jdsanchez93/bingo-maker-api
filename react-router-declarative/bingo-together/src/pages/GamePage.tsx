'use client';

import { Box, Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from 'react-router';

interface BingoItem {
  itemId: string;
  label: string;
  categoryName: string;
}

interface BoardCell extends BingoItem {
  marked: boolean;
}

const theme = createTheme({
  typography: {
    fontSize: 8
  }
})

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  const [gameBoard, setGameBoard] = useState<{ gameId: string; userId: string }>({
    gameId: '',
    userId: '',
  });
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { getAccessTokenSilently, user } = useAuth0();

  const { data: boardItems = [], isLoading, error } = useQuery({
    queryKey: ['board', gameId],
    enabled: !!gameId,
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(`/api/GameBoard/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 404) {
        const err: any = new Error('Board not found');
        err.code = 'BOARD_NOT_FOUND';
        throw err;
      }

      if (!res.ok) {
        throw new Error('Failed to load board');
      }

      const data = await res.json();
      setGameBoard(data);
      return data.boardItems as BoardCell[];
    }
  });

  useEffect(() => {
    if ((error as any)?.code === 'BOARD_NOT_FOUND') {
      navigate(`/create-board/${gameId}`);
    }
  }, [error, navigate]);

  const mutation = useMutation({
    mutationFn: async ({ id, newMarked }: { id: string; newMarked: boolean }) => {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/GameBoard/${gameId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemId: id, isMarked: newMarked }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      return data.boardItems as BoardCell[]; // Assuming response has this
    },
    onMutate: async ({ id, newMarked }) => {
      await queryClient.cancelQueries({ queryKey: ['board', gameId] });
      const previous = queryClient.getQueryData<BoardCell[]>(['board', gameId]);
      queryClient.setQueryData<BoardCell[]>(['board', gameId], old =>
        old?.map(item =>
          item.itemId === id ? { ...item, marked: newMarked } : item
        )
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['board', gameId], context.previous);
      }
      window.alert("Failed to update item. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', gameId] });
    }
  });

  return (
    <Box sx={{ p: 1, overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {gameBoard.gameId}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {user?.given_name || user?.name}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        onClick={async () => {
          const token = await getAccessTokenSilently();
          const res = await fetch(`/api/GameBoard/${gameId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.ok) {
            navigate(`/create-board/${gameId}`);
          } else {
            alert('Failed to delete board');
          }
        }}
        sx={{ mb: 2 }}
      >
        Delete Board
      </Button>
      <Box>
        {isLoading ? <Typography>Loading...</Typography> : (
          <ThemeProvider theme={theme}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '5px',
                width: '100%',
                maxWidth: 500,
                margin: '0 auto',
              }}
            >
              {boardItems.map((item) => (
                <Box
                  key={item.itemId}
                  sx={{
                    bgcolor: item.marked ? 'lightgreen' : 'lightgray',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    textAlign: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => mutation.mutate({ id: item.itemId, newMarked: !item.marked })}
                >
                  <Box sx={{ flex: '0 0 auto' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {item.categoryName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: '1 1 auto',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </ThemeProvider>
        )}
      </Box>
    </Box>
  );
}