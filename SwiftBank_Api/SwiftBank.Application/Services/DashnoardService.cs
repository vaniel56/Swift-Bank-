using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;
using SwiftBank.Infrastructure.Data;

namespace SwiftBank.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly SwiftBankDbContext _context;

    public DashboardService(SwiftBankDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync(
        int userId)
    {
        var accounts = await _context.Accounts
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

        var totalBalance = accounts.Sum(a => a.Balance);

        var recentTransactions = await _context.Transactions
            .AsNoTracking()
            .Where(t => t.Account.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new RecentTransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Type = t.Type,
                Description = t.Beneficiary,
                Amount = t.Amount,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return new DashboardResponseDto
        {
            Accounts = accounts,
            TotalBalance = totalBalance,
            Currency = "NGN",
            RecentTransactions = recentTransactions
        };
    }
}