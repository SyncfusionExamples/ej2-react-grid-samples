using Grid_MSSQL.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// Add MVC controllers and keep JSON property names as-is (PascalCase)
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.DictionaryKeyPolicy = null;
        options.JsonSerializerOptions.ReferenceHandler = null;
    });

// (Optional) Swagger for API exploration in Development
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: allow all (simple for local dev / separate frontend)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Register repository for DI
builder.Services.AddScoped<TicketRepository>();

var app = builder.Build();

// Swagger only in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS and map controllers
app.UseCors();
app.MapControllers();

app.Run();
