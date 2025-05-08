using Amazon.DynamoDBv2.DataModel;

namespace ServerlessAPI.Entities;

[DynamoDBTable("GameConfigs")]
public class GameConfig
{
    [DynamoDBHashKey]
    public string GameId { get; set; } = Guid.NewGuid().ToString();

    [DynamoDBProperty]
    public List<ItemCategory> Categories { get; set; } = new();
}

public enum CategoryType
{
    PickOne,
    RankedDifficulty
}

public class ItemCategory
{
    public string Name { get; set; } = default!;
    public CategoryType Type { get; set; } = CategoryType.PickOne;
    public List<BingoItem> Items { get; set; } = new();
}

public class BingoItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Label { get; set; } = default!;
}