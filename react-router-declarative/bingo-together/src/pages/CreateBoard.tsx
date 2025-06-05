import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router";

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

export default function CreateBoard() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const { getAccessTokenSilently } = useAuth0();
  const { gameId } = useParams<{ gameId: string }>();

  useEffect(() => {
    const fetchConfig = async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(`/api/GameConfig/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      setGameConfig(data);
    };
    fetchConfig();
  }, []);

  const handleChange = (categoryName: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [categoryName]: itemId }));
  };

  const handleSubmit = async () => {
    const token = await getAccessTokenSilently();
    const res = await fetch(`/api/GameBoard/${gameId}/custom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selections }),
    });

    if (res.ok) {
      const board = await res.json();
      console.log("Board created", board);
    } else {
      console.error("Failed to create board");
    }
  };

  if (!gameConfig) return <div>Loading...</div>;

  const pickOneCategories = gameConfig.categories.filter(
    (c) => c.type === "PickOne"
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Customize Your Board
      </Typography>
      {pickOneCategories.map((cat) => (
        <FormControl key={cat.name} fullWidth sx={{ mb: 2 }}>
          <InputLabel>{cat.name}</InputLabel>
          <Select
            value={selections[cat.name] || ""}
            label={cat.name}
            onChange={(e) => handleChange(cat.name, e.target.value)}
          >
            {cat.items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      <Button variant="contained" onClick={handleSubmit} disabled={Object.keys(selections).length !== pickOneCategories.length}>
        Create Board
      </Button>
    </Box>
  );
}
