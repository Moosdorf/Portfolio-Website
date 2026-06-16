namespace Backend.Application.Auth.Responses;

public class LoginResponse
{
    public string Username { get; set; } = string.Empty;
    public bool Successful { get; set; } = false;

}
