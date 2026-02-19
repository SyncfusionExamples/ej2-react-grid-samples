using Newtonsoft.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policy to allow frontend access.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()      // Allow requests from any origin.
              .AllowAnyMethod()       // Allow GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader();      // Allow any request headers.
    });
});

// Add controllers to the service collection.
builder.Services.AddControllers();

// Configure JSON serialization (preserves property casing).
builder.Services.AddMvc().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
});

var app = builder.Build();

// Enable CORS middleware (must be before UseRouting).
app.UseCors();

// Map controller routes.
app.MapControllers();

app.Run();