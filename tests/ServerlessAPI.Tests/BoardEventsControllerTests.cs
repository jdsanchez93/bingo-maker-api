using ServerlessAPI.Entities;
using ServerlessAPI.Repositories;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace ServerlessAPI.Tests;

public class BoardEventsControllerTests
{    
    private readonly WebApplicationFactory<Program> webApplication;

    public BoardEventsControllerTests()
    {
        webApplication = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    //Mock the repository implementation
                    //to remove infra dependencies for Test project
                    services.AddScoped<IBookRepository, MockBookRepository>();
                });
            });
    }

    [Fact]
    public async Task LogEvent_ShouldReturnOk()
    {
        // Arrange
        var gameId = "test-game";
        var userId = "test-user";

        var request = new
        {
            Item = "Banana",
            Marked = true,
            Note = "User tapped"
        };

        var url = $"/api/BoardEvents/{gameId}/users/{userId}/events";

        var client = webApplication.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync(url, request);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.OK, response?.StatusCode);
    }
}