


'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, Paper } from '@mui/material';

interface BingoItem {
  itemId: string;
  label: string;
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
      setBoardItems(data.boardItems); // assuming boardItems is an array of BoardCell
    };
  
    fetchBoard();
  }, []);

  const toggleMarked = (id: string) => {
    setBoardItems(prev =>
      prev.map(cell =>
        cell.itemId === id ? { ...cell, marked: !cell.marked } : cell
      )
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bingo Together
      </Typography>
      <Grid container spacing={2}>
        {boardItems.map((item, index) => (
          <Grid size={{xs:2.4}} key={item.itemId}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: item.marked ? 'lightgreen' : 'white' }}>
              <Typography variant="body1">{item.label}</Typography>
              <Button
                variant="contained"
                color={item.marked ? 'secondary' : 'primary'}
                onClick={() => toggleMarked(item.itemId)}
                size="small"
                sx={{ mt: 1 }}
              >
                {item.marked ? 'Unmark' : 'Mark'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}