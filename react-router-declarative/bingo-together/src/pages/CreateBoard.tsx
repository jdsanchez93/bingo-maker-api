import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CreateBoard: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [gameId, setGameId] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateBoard = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`/api/GameBoard/${gameId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to create board: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Board created:", data);
      setResponse("Board created successfully!");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <p>You need to log in to create a game board.</p>
        <button onClick={() => loginWithRedirect()}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Create Game Board</h2>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <button onClick={handleCreateBoard} disabled={loading || !gameId}>
        {loading ? "Creating..." : "Create Board"}
      </button>
      {response && <p style={{ color: "green" }}>{response}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateBoard;