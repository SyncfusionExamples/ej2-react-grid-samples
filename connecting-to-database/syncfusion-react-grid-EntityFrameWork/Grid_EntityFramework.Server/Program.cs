// File: Program.cs
using Grid_EntityFramework.Server.Data;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddControllers()
    .AddNewtonsoftJson(o =>
    {
        // Key setting: do not try to set null into value types (int)
        o.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        // Optional hardening:
        // o.SerializerSettings.MissingMemberHandling = MissingMemberHandling.Ignore;
    });

// EF Core SQL Server
builder.Services.AddDbContext<TicketsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TicketsDb"))
);

builder.Services.AddControllers();

// CORS if you call from Angular dev server
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("dev", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("dev");
app.MapControllers();
app.Run();
