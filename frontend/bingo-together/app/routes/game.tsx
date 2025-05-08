


'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Typography, Paper } from '@mui/material';

interface BingoItem {
  id: string;
  label: string;
}

interface BoardCell extends BingoItem {
  marked: boolean;
}

const generateMockBoard = (): BoardCell[] => {
  const labels = [
    'Apple', 'Banana', 'Cat', 'Dog', 'Egg',
    'Fish', 'Goat', 'Hat', 'Ice', 'Jam',
    'Kite', 'Lion', 'Moon', 'Nest', 'Owl',
    'Pig', 'Queen', 'Rat', 'Sun', 'Tree',
    'Umbrella', 'Van', 'Whale', 'Xylophone', 'Yarn'
  ];

  return labels.map((label, index) => ({
    id: `item-${index}`,
    label,
    marked: false
  }));
};

export default function GamePage() {
  const [boardItems, setBoardItems] = useState<BoardCell[]>(generateMockBoard());

  const toggleMarked = (id: string) => {
    setBoardItems(prev =>
      prev.map(cell =>
        cell.id === id ? { ...cell, marked: !cell.marked } : cell
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
          <Grid size={{xs:2.4}} key={item.id}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: item.marked ? 'lightgreen' : 'white' }}>
              <Typography variant="body1">{item.label}</Typography>
              <Button
                variant="contained"
                color={item.marked ? 'secondary' : 'primary'}
                onClick={() => toggleMarked(item.id)}
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