using SignalR.Server.Hubs;
using SignalR.Server.Services;
using Newtonsoft.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR(); // Add SignalR services
builder.Services.AddScoped<StockDataService>(); // Add Stock Data Service
builder.Services.AddHostedService<StockUpdateService>(); // Add Stock Update Service
// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // Use the default contract resolver so property names are not camel-cased
        options.SerializerSettings.ContractResolver = new DefaultContractResolver();
    });
// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORSPolicy",
        builder => builder
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .SetIsOriginAllowed((hosts) => true));
});
builder.Services.AddControllersWithViews();
var app = builder.Build();
// Configure the HTTP request pipeline.
app.UseCors("CORSPolicy"); // CORS must be before UseHttpsRedirection
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseHttpsRedirection(); // Only redirect HTTPS in production
}
app.UseStaticFiles();
app.UseRouting();
app.MapHub<StockHub>("/stockHub"); // Map the StockHub - MUST be after UseRouting
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
