using WebApiAdaptor.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add CORS support (required for React app to call API)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()  // Allows requests from any origin
              .AllowAnyMethod()  // Allows all HTTP methods (GET, POST, PUT, DELETE)
              .AllowAnyHeader(); // Allows any request headers
    });
});

// Add NewtonsoftJson for controlling JSON contract resolution (required for casing behavior)
builder.Services.AddMvc().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ContractResolver =
        new Newtonsoft.Json.Serialization.DefaultContractResolver(); // Applies PascalCase (DefaultContractResolver)
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors(); // Important: Enable CORS middleware
app.UseAuthorization();
app.MapControllers();

app.Run();


//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.

//builder.Services.AddControllers();

//// Add CORS support (required for React app to call API)
//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(policy =>
//    {
//        policy.AllowAnyOrigin()  // Allows requests from any origin
//              .AllowAnyMethod()  // Allows all HTTP methods (GET, POST, PUT, DELETE)
//              .AllowAnyHeader(); // Allows any request headers
//    });
//});

//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//// Add NewtonsoftJson for controlling JSON contract resolution (required for casing behavior)
//builder.Services.AddMvc().AddNewtonsoftJson(options =>
//{
//    options.SerializerSettings.ContractResolver =
//        new Newtonsoft.Json.Serialization.DefaultContractResolver(); // Applies PascalCase (DefaultContractResolver)
//});

//var app = builder.Build();

//app.UseDefaultFiles();
//app.UseStaticFiles();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseDeveloperExceptionPage();
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();
//app.UseCors(); // Important: Enable CORS middleware
//app.UseAuthorization();

//app.MapControllers();

//app.MapFallbackToFile("/index.html");

//app.Run();
