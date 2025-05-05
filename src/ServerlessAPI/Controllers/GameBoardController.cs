using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;
using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;

namespace ServerlessAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GameBoardController : ControllerBase
{
    private readonly GameBoardRepository boardRepo;

    public GameBoardController(GameBoardRepository boardRepo)
    {
        this.boardRepo = boardRepo;
    }

    [HttpPost("{gameId}/users/{userId}")]
    public async Task<IActionResult> CreateBoard(string gameId, string userId)
    {
        // Typically you'd retrieve GameConfig and generate a 5x5 board
        // For now assume it's passed in directly

        var newBoard = new GameBoard
        {
            GameId = gameId,
            UserId = userId,
            BoardItems = GenerateRandomBoard() // Helper method
        };

        var success = await boardRepo.SaveBoardAsync(newBoard);
        return success ? Ok(newBoard) : BadRequest("Failed to save board.");
    }

    private Dictionary<string, bool> GenerateRandomBoard()
    {
        throw new NotImplementedException();
    }

    [HttpGet("{gameId}/users/{userId}")]
    public async Task<IActionResult> GetBoard(string gameId, string userId)
    {
        var board = await boardRepo.GetBoardAsync(gameId, userId);
        return board == null ? NotFound() : Ok(board);
    }
}