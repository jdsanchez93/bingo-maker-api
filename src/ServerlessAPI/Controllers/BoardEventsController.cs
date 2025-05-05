using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;
using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;

[Route("api/[controller]")]
[ApiController]
public class BoardEventsController : ControllerBase
{
    private readonly GameBoardRepository boardRepo;

    public BoardEventsController(GameBoardRepository boardRepo)
    {
        this.boardRepo = boardRepo;
    }

    [HttpPost("{gameId}/users/{userId}/events")]
    public async Task<IActionResult> LogEvent(string gameId, string userId, [FromBody] MarkItemRequest req)
    {
        var success = await boardRepo.LogBoardEventAsync(gameId, userId, req.Item, req.Marked, req.Note);
        return success ? Ok() : BadRequest("Failed to log event.");
    }
}

public record MarkItemRequest(string Item, bool Marked, string? Note);