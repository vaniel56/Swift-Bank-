using SwiftBank.Application.DTOs;

namespace SwiftBank.Application.Interfaces;

public interface IAuthService
{
  Task<bool> RegisterAsync(RegisterRequest request);
}