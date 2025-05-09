using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;

namespace ServerlessAPI.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class GameConfigController : ControllerBase
{
    private readonly GameConfigRepository configRepo;

    public GameConfigController(GameConfigRepository configRepo)
    {
        this.configRepo = configRepo;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GameConfig config)
    {
        var success = await configRepo.CreateAsync(config);
        return success ? Ok(config) : BadRequest("Failed to create game config.");
    }

    [HttpGet("{gameId}")]
    public async Task<IActionResult> Get(string gameId)
    {
        var config = await configRepo.GetByIdAsync(gameId);
        return config == null ? NotFound() : Ok(config);
    }
}