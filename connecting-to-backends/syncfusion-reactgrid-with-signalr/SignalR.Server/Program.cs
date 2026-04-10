using SignalR.Server.Hubs;
using SignalR.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR(); // Add SignalR services
builder.Services.AddScoped<StockDataService>(); // Add Stock Data Service
builder.Services.AddHostedService<StockUpdateService>(); // Add Stock Update Service
// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Use PascalCase
    });
// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORSPolicy",
        builder => builder
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") // Explicitly allow React dev server
        .SetIsOriginAllowed((hosts) => true));
});
builder.Services.AddControllersWithViews();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("CORSPolicy"); // CORS must be after UseRouting but before MapHub
app.MapHub<StockHub>("/stockHub"); // Map the StockHub - MUST be after UseRouting
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
