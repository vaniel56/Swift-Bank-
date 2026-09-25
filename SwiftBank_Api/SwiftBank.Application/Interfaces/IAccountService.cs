using SwiftBank.Application.DTOs;

namespace SwiftBank.Application.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponseDto>> GetMyAccountsAsync(
        int userId);

    Task<AccountResponseDto?> GetMyAccountByIdAsync(
        int userId,
        int accountId);
}