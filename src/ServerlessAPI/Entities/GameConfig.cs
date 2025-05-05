using Amazon.DynamoDBv2.DataModel;

namespace ServerlessAPI.Entities;

[DynamoDBTable("GameConfigs")]
public class GameConfig
{
    [DynamoDBHashKey]
    public string GameId { get; set; } = Guid.NewGuid().ToString();

    [DynamoDBProperty]
    public List<string> PossibleItems { get; set; } = new();
}