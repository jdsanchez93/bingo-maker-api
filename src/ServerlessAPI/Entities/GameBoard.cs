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
    public List<BoardCell> BoardItems { get; set; } = new();
}

public class BoardCell
{
    public string ItemId { get; set; } = default!;
    public string Label { get; set; } = default!;
    public bool Marked { get; set; }
}