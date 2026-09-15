// SwiftBank.Application/DTOS/LoginRequest.cs
namespace SwiftBank.Application.DTOS
{
  public class LoginRequest
  {
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
  }
}