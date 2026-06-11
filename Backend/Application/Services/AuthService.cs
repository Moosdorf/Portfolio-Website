using Backend.Application.DTO.User;
using Backend.Application.Responses;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(AppDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }
        public async Task<UserResponse?> Register(CreateUserRequest createUserRequest)
        {
            var user = new User
            {
                Username = createUserRequest.Username,
                Email = createUserRequest.Email,
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, createUserRequest.Password);

            _context.Users.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.InnerException is PostgresException pg && pg.SqlState == "23505") // 23505 = unique constraint violation
            {
                Console.WriteLine("Username or Email already exists");
                return null;
            }

            return new UserResponse { Id = user.Id, Email = user.Email, Username = user.Username};
        }

        public async Task<LoginResponse?> VerifyPassword(LoginRequest loginRequest)
        {
            User user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginRequest.Username);
            
            if (user == null) return new LoginResponse();

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginRequest.Password);
            return new LoginResponse { Username = loginRequest.Username, Successful = result == PasswordVerificationResult.Success};
        }

        public string CreateJWT(string username)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
