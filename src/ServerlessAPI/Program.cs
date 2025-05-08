using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using ServerlessAPI.Repositories;


var builder = WebApplication.CreateBuilder(args);

//Logger
builder.Logging
        .ClearProviders()
        .AddJsonConsole();

// Add services to the container.
builder.Services
        .AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

var useLocalDynamoDb = builder.Configuration["USE_DYNAMODB_LOCAL"] == "true";

var dynamoDbClient = useLocalDynamoDb
    ? new AmazonDynamoDBClient(new Amazon.Runtime.BasicAWSCredentials("fake", "fake"), new AmazonDynamoDBConfig
        {
            ServiceURL = "http://host.docker.internal:8000",
            UseHttp = true
        })
    : new AmazonDynamoDBClient();

builder.Services
        .AddSingleton<IAmazonDynamoDB>(dynamoDbClient)
        .AddScoped<IDynamoDBContext, DynamoDBContext>()
        // .AddScoped<IBookRepository, BookRepository>()
        .AddScoped<GameBoardRepository>()
        .AddScoped<GameConfigRepository>();


// Add AWS Lambda support. When running the application as an AWS Serverless application, Kestrel is replaced
// with a Lambda function contained in the Amazon.Lambda.AspNetCoreServer package, which marshals the request into the ASP.NET Core hosting framework.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);


var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "zz");

app.Run();
