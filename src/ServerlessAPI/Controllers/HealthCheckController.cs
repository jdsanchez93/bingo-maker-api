using Amazon.DynamoDBv2;
using Microsoft.AspNetCore.Mvc;

namespace ServerlessAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCheckController : ControllerBase
{
    private readonly IAmazonDynamoDB _dynamoDb;

    public HealthCheckController(IAmazonDynamoDB dynamoDb)
    {
        _dynamoDb = dynamoDb;
    }

    [HttpGet("dynamodb")]
    public async Task<IActionResult> CheckDynamoDb()
    {
        try
        {
            var response = await _dynamoDb.ListTablesAsync();
            return Ok(new { Status = "Connected", Tables = response.TableNames });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = "Error", Message = ex.Message });
        }
    }
}