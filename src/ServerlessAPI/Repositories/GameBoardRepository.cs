using Amazon.DynamoDBv2.DataModel;
using ServerlessAPI.Entities;

namespace ServerlessAPI.Repositories;

public class GameBoardRepository
{
    private readonly IDynamoDBContext context;
    private readonly ILogger<GameBoardRepository> logger;

    public GameBoardRepository(IDynamoDBContext context, ILogger<GameBoardRepository> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    public async Task<bool> SaveBoardAsync(GameBoard board)
    {
        try
        {
            await context.SaveAsync(board);
            logger.LogInformation("Game board for {GameId}:{UserId} saved", board.GameId, board.UserId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save GameBoard");
            return false;
        }
    }

    public async Task<GameBoard?> GetBoardAsync(string gameId, string userId)
    {
        try
        {
            return await context.LoadAsync<GameBoard>(gameId, userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get GameBoard");
            return null;
        }
    }

    public async Task<bool> DeleteBoardAsync(GameBoard board)
    {
        bool result;
        try
        {
            // Delete the board.
            await context.DeleteAsync<GameBoard>(board.GameId, board.UserId);
            // Try to retrieve deleted board. It should return null.

            GameBoard deletedBoard = await context.LoadAsync<GameBoard>(board.GameId, board.UserId, new DynamoDBOperationConfig { ConsistentRead = true });

            result = deletedBoard == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete board from DynamoDb Table");
            result = false;
        }

        if (result) logger.LogInformation("Board {gameId} {userId} is deleted", board.GameId, board.UserId);

        return result;
    }

    public async Task<bool> LogBoardEventAsync(string gameId, string userId, string item, bool marked, string? note = null)
    {
        try
        {
            var boardEvent = new BoardEvent
            {
                GameUserKey = $"{gameId}#{userId}",
                Timestamp = DateTime.UtcNow.ToString("o"),
                Item = item,
                Marked = marked,
                Note = note
            };

            await context.SaveAsync(boardEvent);
            logger.LogInformation("Board event saved for {GameId}:{UserId} - {Item} marked: {Marked}", gameId, userId, item, marked);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save BoardEvent");
            return false;
        }
    }
}