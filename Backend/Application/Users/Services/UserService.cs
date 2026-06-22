using Backend.Domain.Entities.Users;
using Infrastructure.Data;

namespace Backend.Application.Users.Services;


public class UserService : IUserService
{
    private readonly AppDbContext _context;
    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public User GetById(int id)
    {
        return _context.Users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<User> GetByUsername(string username)
    {
        return _context.Users.FirstOrDefault(u => u.Username == username);
    }

    public async Task<User> IsEmailInUse(string email)
    {
        return _context.Users.FirstOrDefault(u => u.Email == email);
    }
}
