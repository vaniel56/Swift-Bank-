using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;
using SwiftBank.Domain.Entities;
using SwiftBank.Infrastructure.Data;

namespace SwiftBank.Application.Services;

public class AuthService(SwiftBankDbContext context) : IAuthService
{
  public async Task<bool> RegisterAsync(RegisterRequest request)
  {
    // Reject registration if a user with the same email already exists.
    var existingUser = await context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (existingUser != null)
    {
      return false;
    }

    // Create the user with a hashed password.
    var user = new User
    {
      FirstName = request.FirstName,
      LastName = request.LastName,
      Email = request.Email,
      PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    return true;
  }

  public async Task<LoginResponse?> LoginAsync(DTOS.LoginRequest request)
  {
    var user = await context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
      return null;
    }

    // Generate and return authentication token
    return new LoginResponse { Token = "token" }; // Replace with actual token generation logic
  }
}