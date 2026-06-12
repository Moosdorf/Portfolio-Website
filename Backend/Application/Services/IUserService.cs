using Domain.Entities;

namespace Backend.Application.Services;

public interface IUserService
{
    public User GetById(int id);
    public User GetByUsername(string username);
    public bool IsEmailInUse(string email);

}
