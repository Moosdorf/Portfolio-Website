using Backend.Domain.Entities.Users;

namespace Backend.Application.Users.Services;

public interface IUserService
{
    public User GetById(int id);
    public User GetByUsername(string username);
    public bool IsEmailInUse(string email);

}
