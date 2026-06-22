using Backend.Domain.Entities.Users;

namespace Backend.Application.Users.Services;

public interface IUserService
{
    public User GetById(int id);
    public Task<User> GetByUsername(string username);
    public Task<User> IsEmailInUse(string email);

}
