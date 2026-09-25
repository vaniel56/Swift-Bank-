using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;
using SwiftBank.Infrastructure.Data;

namespace SwiftBank.Application.Services;

public class AccountService : IAccountService
{
    private readonly SwiftBankDbContext _context;

    public AccountService(SwiftBankDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountResponseDto>> GetMyAccountsAsync(
        int userId)
    {
        return await _context.Accounts
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .Select(a => new AccountResponseDto
            {
                Id = a.Id,
                AccountNumber = a.AccountNumber,
                AccountType = a.AccountType,
                Balance = a.Balance,
                Currency = a.Currency
            })
            .ToListAsync();
    }

    public async Task<AccountResponseDto?> GetMyAccountByIdAsync(
        int userId,
        int accountId)
    {
        return await _context.Accounts
            .AsNoTracking()
            .Where(a =>
                a.Id == accountId &&
                a.UserId == userId)
            .Select(a => new AccountResponseDto
            {
                Id = a.Id,
                AccountNumber = a.AccountNumber,
                AccountType = a.AccountType,
                Balance = a.Balance,
                Currency = a.Currency
            })
            .FirstOrDefaultAsync();
    }
}