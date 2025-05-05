using Amazon.DynamoDBv2.DataModel;

namespace ServerlessAPI.Entities;

[DynamoDBTable("BoardEvents")]
public class BoardEvent
{
    [DynamoDBHashKey]
    public string GameUserKey { get; set; } = null!; // Format: "gameId#userId"

    [DynamoDBRangeKey]
    public string Timestamp { get; set; } = null!; // ISO 8601 timestamp

    [DynamoDBProperty]
    public string Item { get; set; } = null!;

    [DynamoDBProperty]
    public bool Marked { get; set; }

    [DynamoDBProperty]
    public string? Note { get; set; } // Optional metadata
}