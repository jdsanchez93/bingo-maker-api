using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
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

    public async Task<IList<GameConfig>> GetGameConfigsAsync(int limit = 5)
    {
        var result = new List<GameConfig>();

        try
        {
            if (limit <= 0)
            {
                return result;
            }

            var filter = new ScanFilter();
            filter.AddCondition("GameId", ScanOperator.IsNotNull);
            var scanConfig = new ScanOperationConfig()
            {
                Limit = limit,
                Filter = filter
            };
            var queryResult = context.FromScanAsync<GameConfig>(scanConfig);

            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < limit);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to list books from DynamoDb Table");
            return new List<GameConfig>();
        }

        return result;
    }
}