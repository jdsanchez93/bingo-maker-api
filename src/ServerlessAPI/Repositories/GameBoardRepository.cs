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
}