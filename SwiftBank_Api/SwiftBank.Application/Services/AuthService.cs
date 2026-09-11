using SwiftBank.Application.Interfaces;

namespace SwiftBank.Application.Services;

public class AuthService : IAuthService
{
  public string Login()
  {
    return "Login successful";
  }
}
