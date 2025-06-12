using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace GameWebSocketApi;

public class Function
{
    public async Task<APIGatewayProxyResponse> Handler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var routeKey = request.RequestContext.RouteKey;

        switch (routeKey)
        {
            case "$connect": return await OnConnect(request, context);
            case "$disconnect": return await OnDisconnect(request, context);
            case "markItem": return await OnMarkItem(request, context);
            default: return new APIGatewayProxyResponse { StatusCode = 200, Body = "Default route hit." };
        }
    }

    private Task<APIGatewayProxyResponse> OnConnect(APIGatewayProxyRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Connected: {request.RequestContext.ConnectionId}");
        return Task.FromResult(new APIGatewayProxyResponse
        {
            StatusCode = 200,
            Body = "Connected."
        });
    }

    private Task<APIGatewayProxyResponse> OnDisconnect(APIGatewayProxyRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Disconnected: {request.RequestContext.ConnectionId}");
        return Task.FromResult(new APIGatewayProxyResponse
        {
            StatusCode = 200,
            Body = "Disconnected."
        });
    }

    private Task<APIGatewayProxyResponse> OnMarkItem(APIGatewayProxyRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"markItem received: {request.Body}");
        return Task.FromResult(new APIGatewayProxyResponse
        {
            StatusCode = 200,
            Body = "Item marked (stub)."
        });
    }
}