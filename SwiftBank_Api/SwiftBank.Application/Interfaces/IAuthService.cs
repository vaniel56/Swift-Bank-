using SwiftBank.Application.DTOs;
using SwiftBank.Domain.Entities;

namespace SwiftBank.Application.Interfaces
{
  public interface IAuthService
  {
    Task<bool> RegisterAsync(RegisterRequest request);
    Task<User?> LoginAsync(string email, string password);
  }
}