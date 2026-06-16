using Backend.Application.Auth.DTO;
using Backend.Application.Auth.Responses;

namespace Backend.Application.Auth.Services;

public interface IAuthService
{
    public Task<UserResponse?> Register(CreateUserRequest createUserRequest);
    public Task<LoginResponse?> VerifyPassword(LoginRequest loginRequest);


}
