using Backend.Application.Auth.Services;
using Backend.Application.Chess.Services;
using Backend.Application.General.Services;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Users;
using DataLayer.csv_scripts;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");

DotNetEnv.Env.Load(envPath);

var db = Environment.GetEnvironmentVariable("POSTGRES_DB");
var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

var connectionString = $"Host=localhost;Port=5432;Database={db};Username={user};Password={password}";

builder.Services.AddAutoMapper(typeof(Program));


// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGeneralService, GeneralService>();
builder.Services.AddScoped<IChessDataService, ChessDataService>();
builder.Services.AddScoped<IStockFishService, StockFishService>();
builder.Services.AddScoped<IPuzzleDataService, PuzzleDataService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options => // https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-9.0
{
    options.AddPolicy(name: "AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("https://localhost:3000").AllowAnyMethod()
                                                        .AllowAnyHeader()
                                                        .AllowCredentials();
        });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret!)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies["access_token"]; 
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseCors("AllowSpecificOrigin");
// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChessHub>("/hubs/chess");


app.Run();
