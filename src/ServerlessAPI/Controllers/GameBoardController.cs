using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;
using ServerlessAPI.Extensions;

namespace ServerlessAPI.Controllers;

[Route("api/[controller]")]
[Authorize]
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

    [HttpPost("{gameId}")]
    public async Task<IActionResult> CreateBoard(string gameId)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }

        var gameConfig = await configRepo.GetByIdAsync(gameId);
        if (gameConfig == null)
        {
            return NotFound("Game config not found.");
        }

        var newBoard = new GameBoard
        {
            GameId = gameId,
            UserId = userId,
            BoardItems = GenerateRandomBoard(gameConfig)
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

    [HttpGet("{gameId}")]
    public async Task<IActionResult> GetBoard(string gameId)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }
        var board = await boardRepo.GetBoardAsync(gameId, userId);
        return board == null ? NotFound() : Ok(board);
    }

    [HttpPatch("{gameId}/items")]
    public async Task<IActionResult> UpdateBoardItem(string gameId, [FromBody] UpdateBoardItemRequest request)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }

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

    [HttpPost("{gameId}/custom")]
    public async Task<IActionResult> CreateBoardWithSelections(string gameId, [FromBody] CreateBoardWithSelectionsRequest request)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }

        var gameConfig = await configRepo.GetByIdAsync(gameId);
        if (gameConfig == null)
        {
            return NotFound("Game config not found.");
        }

        var newBoard = new GameBoard
        {
            GameId = gameId,
            UserId = userId,
            BoardItems = GenerateBoardFromSelections(gameConfig, request.Selections)
        };

        var success = await boardRepo.SaveBoardAsync(newBoard);
        return success ? Ok(newBoard) : BadRequest("Failed to save board.");
    }

    private List<BoardCell> GenerateBoardFromSelections(GameConfig config, Dictionary<string, string> selections)
    {
        var random = new Random();

        var pickOneCells = config.Categories
            .Where(c => c.Type == CategoryType.PickOne && selections.ContainsKey(c.Name))
            .Select(c =>
            {
                var itemId = selections[c.Name];
                var item = c.Items.First(i => i.Id == itemId);
                return new BoardCell
                {
                    ItemId = item.Id,
                    Label = item.Label,
                    CategoryName = c.Name,
                    Marked = false
                };
            });

        var rankedCells = config.Categories
            .Where(c => c.Type == CategoryType.RankedDifficulty)
            .SelectMany(c => c.Items.Select(item => new BoardCell
            {
                ItemId = item.Id,
                Label = item.Label,
                CategoryName = c.Name,
                Marked = false
            }));

        var pickOneCellsList = pickOneCells.ToList();
        var rankedCellsList = rankedCells.OrderBy(_ => random.Next()).ToList();

        var combined = pickOneCellsList
            .Concat(rankedCellsList)
            .Take(25)
            .OrderBy(_ => random.Next())
            .ToList();

        return combined;
    }

    [HttpDelete("{gameId}")]
    public async Task<IActionResult> DeleteBoard(string gameId)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }
        
        var board = await boardRepo.GetBoardAsync(gameId, userId);
        if (board == null)
        {
            return NotFound("Game board not found.");
        }

        var success = await boardRepo.DeleteBoardAsync(board);
        return success ? NoContent() : StatusCode(500, "Failed to delete board.");
    }

}

public class UpdateBoardItemRequest
{
    public string ItemId { get; set; } = default!;
    public bool IsMarked { get; set; }
}

public class CreateBoardWithSelectionsRequest
{
    public Dictionary<string, string> Selections { get; set; } = new();
}