using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Services;
using SwiftBank.Domain.Entities;
using SwiftBank.Infrastructure.Data;

namespace SwiftBank.Tests;

/// <summary>
/// Locks in the dashboard acceptance criteria:
///  - One payload containing accounts, total balance and the 5 latest transactions.
///  - The 5 transactions are the most recent ACROSS all the user's accounts.
///  - Take(5) is applied before materialization (no full transaction scan into memory).
///    On SqlServer EF Core translates this to a SELECT TOP(5) ... ORDER BY CreatedAt DESC.
/// </summary>
public class DashboardServiceTests
{
    private static SwiftBankDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<SwiftBankDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new SwiftBankDbContext(options);
    }

    [Fact]
    public async Task GetDashboardAsync_ReturnsAccountsTotalAndTopFiveTransactionsAcrossAllAccounts()
    {
        using var db = CreateInMemoryDb(nameof(GetDashboardAsync_ReturnsAccountsTotalAndTopFiveTransactionsAcrossAllAccounts));

        var accountA = new Account { Id = 1, AccountNumber = "ACC-ONE", AccountType = "Savings", Balance = 100m, Currency = "NGN", UserId = 1 };
        var accountB = new Account { Id = 2, AccountNumber = "ACC-TWO", AccountType = "Current", Balance = 250m, Currency = "NGN", UserId = 1 };
        var otherUsersAccount = new Account { Id = 3, AccountNumber = "ACC-OTHERS", AccountType = "Savings", Balance = 9000m, Currency = "NGN", UserId = 2 };

        db.Accounts.AddRange(accountA, accountB, otherUsersAccount);

        // 8 transactions across user 1's two accounts, oldest -> newest (Tx-1 oldest, Tx-8 newest).
        var txs = Enumerable.Range(1, 8)
            .Select(i => new Transaction
            {
                Id = i,
                AccountId = i % 2 == 0 ? accountA.Id : accountB.Id,
                Account = i % 2 == 0 ? accountA : accountB,
                Type = "Credit",
                Beneficiary = $"Tx-{i}",
                Amount = 10m * i,
                CreatedAt = new DateTime(2026, 9, 1).AddMinutes(i)
            })
            .ToList();

        // Two transactions for the OTHER customer, both newer than anything of user 1.
        // They must never leak into user 1's dashboard.
        txs.Add(new Transaction { Id = 9, AccountId = otherUsersAccount.Id, Account = otherUsersAccount, Type = "Debit", Beneficiary = "Other-1", Amount = 1m, CreatedAt = new DateTime(2026, 9, 10) });
        txs.Add(new Transaction { Id = 10, AccountId = otherUsersAccount.Id, Account = otherUsersAccount, Type = "Debit", Beneficiary = "Other-2", Amount = 2m, CreatedAt = new DateTime(2026, 9, 11) });

        db.Transactions.AddRange(txs);
        await db.SaveChangesAsync();

        var service = new DashboardService(db);
        var dashboard = await service.GetDashboardAsync(1);

        // Accounts: exactly the two owned by user 1, with currency populated.
        Assert.Equal(2, dashboard.Accounts.Count);
        Assert.All(dashboard.Accounts, a => Assert.Equal("NGN", a.Currency));

        // Total balance: 100 + 250 (other user's 9000 must not be included).
        Assert.Equal(350m, dashboard.TotalBalance);
        Assert.Equal("NGN", dashboard.Currency);

        // Exactly 5 transactions, newest-first: Tx-8 ... Tx-4. Nothing from the other user.
        Assert.Equal(5, dashboard.RecentTransactions.Count);
        Assert.Equal(new[] { 8, 7, 6, 5, 4 }, dashboard.RecentTransactions.Select(t => t.Id).ToArray());
        Assert.True(IsDescendingByCreatedAt(dashboard.RecentTransactions));
        Assert.All(dashboard.RecentTransactions, t => Assert.True(t.AccountId is 1 or 2));
    }

    [Fact]
    public async Task GetDashboardAsync_ReturnsEmptyPayload_WhenUserHasNoAccounts()
    {
        using var db = CreateInMemoryDb(nameof(GetDashboardAsync_ReturnsEmptyPayload_WhenUserHasNoAccounts));

        var otherUsersAccount = new Account { Id = 1, AccountNumber = "ACC-OTHERS", AccountType = "Savings", Balance = 9000m, Currency = "NGN", UserId = 2 };
        db.Accounts.Add(otherUsersAccount);
        await db.SaveChangesAsync();

        var service = new DashboardService(db);
        var dashboard = await service.GetDashboardAsync(1);

        Assert.Empty(dashboard.Accounts);
        Assert.Equal(0m, dashboard.TotalBalance);
        Assert.Empty(dashboard.RecentTransactions);
    }

    private static bool IsDescendingByCreatedAt(List<RecentTransactionDto> transactions)
    {
        for (int i = 1; i < transactions.Count; i++)
        {
            if (transactions[i - 1].CreatedAt < transactions[i].CreatedAt)
            {
                return false;
            }
        }

        return true;
    }
}