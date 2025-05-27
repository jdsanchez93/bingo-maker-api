'use client';

import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardActionArea, CardContent, CardHeader } from '@mui/material';

interface BingoItem {
  itemId: string;
  label: string;
  categoryName: string;
}

interface BoardCell extends BingoItem {
  marked: boolean;
}

export default function GamePage() {
  const [boardItems, setBoardItems] = useState<BoardCell[]>([]);

  useEffect(() => {
    const fetchBoard = async () => {
      const res = await fetch(`/api/GameBoard/costco/users/jd`);
      const data = await res.json();
      setBoardItems(data.boardItems);
    };
  
    fetchBoard();
  }, []);

  const toggleMarked = async (id: string) => {
    const item = boardItems.find(cell => cell.itemId === id);
    if (!item) return;
  
    const newMarked = !item.marked;
  
    await fetch(`/api/GameBoard/costco/users/jd/items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: id,
        isMarked: newMarked
      }),
    });
  
    setBoardItems(prev =>
      prev.map(cell =>
        cell.itemId === id ? { ...cell, marked: newMarked } : cell
      )
    );
  };

  return (
    <Box sx={{ p: 2, overflowX: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        name
      </Typography>
      <Box sx={{ minWidth: '960px' }}>
        <Grid container spacing={2} wrap="wrap" columns={5}>
          {boardItems.map((item, index) => (
            <Grid size={{xs:1}} key={item.itemId}>
              <Card
                sx={{
                  width: '185px',
                  height: '125px',
                  bgcolor: item.marked ? 'lightgreen' : 'white',
                }}
              >
                <CardActionArea onClick={() => toggleMarked(item.itemId)} sx={{ height: '100%' }}>
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
      </Box>
    </Box>
  );
}