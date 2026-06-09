using Domain.Entities;

namespace Backend.Application.Services
{
    public interface IAuthService
    {
        public String Hash(string message);
        public Boolean VerifyPassword(string password, string storedHash);


    }
}
