


'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, Paper, Card, CardActionArea, CardContent, CardHeader } from '@mui/material';

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
      <Grid container columns={5} spacing={1}>
        {boardItems.map((item, index) => (
          <Grid size={{xs:1}} key={item.itemId} >
            <Card sx={{
              // width: '125px',
              height: '125px',
              bgcolor: item.marked ? 'lightgreen' : 'white',
              }}>
              <CardActionArea onClick={() => toggleMarked(item.itemId)}>
                <CardHeader
                  // title={item.categoryName}
                  subheader={item.categoryName}
                />
                <CardContent>
                  <Typography variant="body2">{item.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}