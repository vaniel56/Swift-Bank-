using SwiftBank.Application.DTOs;

namespace SwiftBank.Application.Interfaces
{
  public interface IAuthService
  {
    Task<bool> RegisterAsync(RegisterRequest request);
    Task<bool> LoginAsync(LoginRequest request);
  }
}