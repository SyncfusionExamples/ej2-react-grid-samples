using Grid_Dapper.Server.Data;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Http.Json;

var builder = WebApplication.CreateBuilder(args);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS: allow all (simple for local dev / separate frontend)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});


// Controllers with System.Text.Json configured to KEEP PascalCase
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        // Keep property names as declared in C# (PascalCase)
        o.JsonSerializerOptions.PropertyNamingPolicy = null;
        // Keep dictionary keys as-is too
        o.JsonSerializerOptions.DictionaryKeyPolicy = null;
        // Allow case-insensitive reads (accept camelCase or PascalCase on input)
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });


// Get connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("HotelBookingDB");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found in configuration.");
}


// Register IDbConnection for Dapper
builder.Services.AddScoped<IDbConnection>(sp => new SqlConnection(connectionString));

// Register the repository for dependency injection
builder.Services.AddScoped<ReservationRepository>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();
app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
