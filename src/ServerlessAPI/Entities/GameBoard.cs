using Amazon.DynamoDBv2.DataModel;

namespace ServerlessAPI.Entities;

[DynamoDBTable("GameBoards")]
public class GameBoard
{
    [DynamoDBHashKey]
    public string GameId { get; set; } = null!;

    [DynamoDBRangeKey]
    public string UserId { get; set; } = null!;

    [DynamoDBProperty]
    public Dictionary<string, bool> BoardItems { get; set; } = new();
}