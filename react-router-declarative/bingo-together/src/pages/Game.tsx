import { useEffect, useState } from 'react'

export default function Game() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Fetch from your Lambda-based API
    fetch('https://your-api.amazonaws.com/game', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <div>
      <h1>Bingo Game</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}