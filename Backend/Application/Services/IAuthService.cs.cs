using Backend.Application.DTO.User;
using Backend.Application.Responses;
using Domain.Entities;

namespace Backend.Application.Services;

public interface IAuthService
{
    public Task<UserResponse?> Register(CreateUserRequest createUserRequest);
    public Task<LoginResponse?> VerifyPassword(LoginRequest loginRequest);


}
