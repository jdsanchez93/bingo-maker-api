'use client';

import { Box, createTheme, ThemeProvider, Typography } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

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
  const [gameBoard, setGameBoard] = useState<{ gameId: string; userId: string }>({
    gameId: '',
    userId: '',
  });
  const queryClient = useQueryClient();

  const { data: boardItems = [], isLoading } = useQuery({
    queryKey: ['board'], queryFn: async () => {
      const res = await fetch(`/api/GameBoard/costco/users/jd`);
      const data = await res.json();
      setGameBoard(data);
      return data.boardItems as BoardCell[];
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ id, newMarked }: { id: string; newMarked: boolean }) => {
      const response = await fetch(`/api/GameBoard/costco/users/jd/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, isMarked: newMarked }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      return data.boardItems as BoardCell[]; // Assuming response has this
    },
    onMutate: async ({ id, newMarked }) => {
      await queryClient.cancelQueries({ queryKey: ['board'] });
      const previous = queryClient.getQueryData<BoardCell[]>(['board']);
      queryClient.setQueryData<BoardCell[]>(['board'], old =>
        old?.map(item =>
          item.itemId === id ? { ...item, marked: newMarked } : item
        )
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['board'], context.previous);
      }
      window.alert("Failed to update item. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    }
  });

  return (
    <Box sx={{ p: 1, overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {gameBoard.gameId}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {gameBoard.userId}
      </Typography>
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