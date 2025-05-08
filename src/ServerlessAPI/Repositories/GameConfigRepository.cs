using Amazon.DynamoDBv2.DataModel;
using ServerlessAPI.Entities;

namespace ServerlessAPI.Repositories;

public class GameConfigRepository
{
    private readonly IDynamoDBContext context;
    private readonly ILogger<GameConfigRepository> logger;

    public GameConfigRepository(IDynamoDBContext context, ILogger<GameConfigRepository> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    public async Task<bool> CreateAsync(GameConfig config)
    {
        try
        {
            await context.SaveAsync(config);
            logger.LogInformation("Game config {GameId} saved", config.GameId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save GameConfig");
            return false;
        }
    }

    public async Task<GameConfig?> GetByIdAsync(string gameId)
    {
        try
        {
            return await context.LoadAsync<GameConfig>(gameId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load GameConfig");
            return null;
        }
    }
}