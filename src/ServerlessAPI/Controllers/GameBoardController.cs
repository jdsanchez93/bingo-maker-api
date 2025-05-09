using Microsoft.AspNetCore.Mvc;
using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;

namespace ServerlessAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GameBoardController : ControllerBase
{
    private readonly GameBoardRepository boardRepo;
    private readonly GameConfigRepository configRepo;

    public GameBoardController(GameBoardRepository boardRepo, GameConfigRepository configRepo)
    {
        this.boardRepo = boardRepo;
        this.configRepo = configRepo;
    }

    [HttpPost("{gameId}/users/{userId}")]
    public async Task<IActionResult> CreateBoard(string gameId, string userId)
    {
        var gameConfig = await configRepo.GetByIdAsync(gameId);
        if (gameConfig == null)
        {
            return NotFound("Game config not found.");
        }

        var newBoard = new GameBoard
        {
            GameId = gameId,
            UserId = userId,
            BoardItems = GenerateRandomBoard(gameConfig) // Helper method
        };

        var success = await boardRepo.SaveBoardAsync(newBoard);
        return success ? Ok(newBoard) : BadRequest("Failed to save board.");
    }

    private List<BoardCell> GenerateRandomBoard(GameConfig gameConfig)
    {
        var random = new Random();

        var pickOneCells = gameConfig.Categories
            .Where(c => c.Type == CategoryType.PickOne)
            .Select(c =>
            {
                var item = c.Items[random.Next(c.Items.Count)];
                return new BoardCell
                {
                    ItemId = item.Id,
                    Label = item.Label,
                    CategoryName = c.Name,
                    Marked = false
                };
            });

        var rankedCells = gameConfig.Categories
            .Where(c => c.Type == CategoryType.RankedDifficulty)
            .SelectMany(c => c.Items.Select(item => new BoardCell
            {
                ItemId = item.Id,
                Label = item.Label,
                CategoryName = c.Name,
                Marked = false
            }));

        return pickOneCells.Concat(rankedCells)
            .OrderBy(_ => random.Next())
            .Take(25)
            .ToList();
    }

    [HttpGet("{gameId}/users/{userId}")]
    public async Task<IActionResult> GetBoard(string gameId, string userId)
    {
        var board = await boardRepo.GetBoardAsync(gameId, userId);
        return board == null ? NotFound() : Ok(board);
    }

    [HttpPatch("{gameId}/users/{userId}/items")]
    public async Task<IActionResult> UpdateBoardItem(string gameId, string userId, [FromBody] UpdateBoardItemRequest request)
    {
        var board = await boardRepo.GetBoardAsync(gameId, userId);
        if (board == null)
        {
            return NotFound("Game board not found.");
        }

        var cell = board.BoardItems.FirstOrDefault(c => c.ItemId == request.ItemId);
        if (cell == null)
        {
            return BadRequest("Item does not exist on the board.");
        }

        cell.Marked = request.IsMarked;

        var success = await boardRepo.SaveBoardAsync(board);
        return success ? Ok(board) : StatusCode(500, "Failed to update board.");
    }
}

public class UpdateBoardItemRequest
{
    public string ItemId { get; set; } = default!;
    public bool IsMarked { get; set; }
}