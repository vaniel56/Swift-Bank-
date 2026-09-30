using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;
using SwiftBank.Domain.Entities;
using SwiftBank.Infrastructure.Data;
using System.Security.Cryptography;

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

    // Create default accounts for the new user.
    // UserId will be assigned by EF once the user is saved,
    // but since these are separate entities we need the user's Id first.
    await context.SaveChangesAsync();

    var savingsAccount = new Account
    {
      AccountNumber = await GenerateUniqueAccountNumberAsync(),
      AccountType = "Savings",
      Balance = 210000m,
      Currency = "NGN",
      UserId = user.Id
    };

    var currentAccount = new Account
    {
      AccountNumber = await GenerateUniqueAccountNumberAsync(),
      AccountType = "Current",
      Balance = 272300m,
      Currency = "NGN",
      UserId = user.Id
    };

    context.Accounts.Add(savingsAccount);
    context.Accounts.Add(currentAccount);

    await context.SaveChangesAsync();

    return true;
  }

  public async Task<User?> LoginAsync(string email, string password)
  {
    var user = await context.Users
        .FirstOrDefaultAsync(u => u.Email == email);

    if (user == null)
    {
      return null;
    }

    var passwordMatches = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    if (!passwordMatches)
    {
      return null;
    }

    return user;
  }

  // Generates a unique 10-digit account number starting with 1.
  // Crypto-random source: fromInclusive = 1_000_000_000,
  // toExclusive = 2_000_000_000, so the number is always 10 digits
  // and always starts with '1'.
  private async Task<string> GenerateUniqueAccountNumberAsync()
  {
    string accountNumber;
    bool exists;

    do
    {
      accountNumber = RandomNumberGenerator
          .GetInt32(1000000000, 2000000000)
          .ToString();
      exists = await context.Accounts
          .AnyAsync(a => a.AccountNumber == accountNumber);
    } while (exists);

    return accountNumber;
  }
}