'use client';

import { Box, Grid, Typography, Card, CardActionArea, CardContent, CardHeader } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BingoItem {
  itemId: string;
  label: string;
  categoryName: string;
}

interface BoardCell extends BingoItem {
  marked: boolean;
}

export default function GamePage() {
  const queryClient = useQueryClient();

  const { data: boardItems = [], isLoading } = useQuery({
    queryKey: ['board'], queryFn: async () => {
      const res = await fetch(`/api/GameBoard/costco/users/jd`);
      const data = await res.json();
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
    onSuccess: (updatedBoardItems, variables) => {
      queryClient.setQueryData<BoardCell[]>(['board'], old =>
        old?.map(item =>
          item.itemId === variables.id ? { ...item, marked: variables.newMarked } : item
        )
      );
    }
  });

  return (
    <Box sx={{ p: 2, overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        name
      </Typography>
      <Box sx={{ minWidth: '960px' }}>
        {isLoading ? <Typography>Loading...</Typography> : (
          <Grid container spacing={2} wrap="wrap" columns={5}>
            {boardItems.map((item, index) => (
              <Grid size={{ xs: 1 }} key={item.itemId}>
                <Card
                  sx={{
                    width: '185px',
                    height: '125px',
                    bgcolor: item.marked ? 'lightgreen' : 'white',
                  }}
                >
                  <CardActionArea onClick={() => mutation.mutate({ id: item.itemId, newMarked: !item.marked })} sx={{ height: '100%' }}>
                    <CardHeader
                      subheader={item.categoryName}
                      sx={{ pt: 1, pb: 0 }}
                    />
                    <CardContent sx={{ height: 'calc(100% - 48px)', overflow: 'hidden' }}>
                      <Typography variant="body2">{item.label}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}