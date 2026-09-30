using Microsoft.EntityFrameworkCore;
using SwiftBank.Application.Services;
using SwiftBank.Domain.Entities;
using SwiftBank.Infrastructure.Data;

namespace SwiftBank.Tests;

/// <summary>
/// Locks in the account acceptance criteria:
///  - GET /api/accounts returns only accounts belonging to the authenticated customer.
///  - Requesting another customer's account id yields null (the controller maps it to 404,
///    never 403, so the existence of the resource is not confirmed).
/// </summary>
public class AccountTests
{
    private static SwiftBankDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<SwiftBankDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new SwiftBankDbContext(options);
    }

    private static async Task SeedAsync(SwiftBankDbContext db)
    {
        // User 1 owns accounts 1 and 2; user 2 owns account 3.
        db.Users.AddRange(
            new User { Id = 1, FirstName = "Ada", LastName = "A", Email = "ada@test.com", PasswordHash = "x" },
            new User { Id = 2, FirstName = "Bob", LastName = "B", Email = "bob@test.com", PasswordHash = "x" });

        db.Accounts.AddRange(
            new Account { Id = 1, AccountNumber = "ACC-ONE", AccountType = "Savings", Balance = 100m, Currency = "NGN", UserId = 1 },
            new Account { Id = 2, AccountNumber = "ACC-TWO", AccountType = "Current", Balance = 200m, Currency = "NGN", UserId = 1 },
            new Account { Id = 3, AccountNumber = "ACC-OTHERS", AccountType = "Savings", Balance = 9000m, Currency = "NGN", UserId = 2 });

        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetMyAccountsAsync_ReturnsOnlyTheAuthenticatedUsersAccounts()
    {
        using var db = CreateInMemoryDb(nameof(GetMyAccountsAsync_ReturnsOnlyTheAuthenticatedUsersAccounts));
        await SeedAsync(db);
        var service = new AccountService(db);

        var userOne = await service.GetMyAccountsAsync(1);
        var userTwo = await service.GetMyAccountsAsync(2);

        Assert.Equal(2, userOne.Count);
        Assert.Equal(new[] { 1, 2 }, userOne.Select(a => a.Id).OrderBy(i => i));
        Assert.All(userOne, a => Assert.Equal("NGN", a.Currency));

        Assert.Single(userTwo);
        Assert.Equal(3, userTwo[0].Id);
    }

    [Fact]
    public async Task GetMyAccountByIdAsync_ReturnsOwnAccount()
    {
        using var db = CreateInMemoryDb(nameof(GetMyAccountByIdAsync_ReturnsOwnAccount));
        await SeedAsync(db);
        var service = new AccountService(db);

        var account = await service.GetMyAccountByIdAsync(1, 2);

        Assert.NotNull(account);
        Assert.Equal(2, account!.Id);
        Assert.Equal(200m, account.Balance);
    }

    [Fact]
    public async Task GetMyAccountByIdAsync_ReturnsNull_WhenAccountBelongsToAnotherCustomer()
    {
        using var db = CreateInMemoryDb(nameof(GetMyAccountByIdAsync_ReturnsNull_WhenAccountBelongsToAnotherCustomer));
        await SeedAsync(db);
        var service = new AccountService(db);

        // User 1 must not read user 2's account, and vice versa -> null -> 404.
        var notMine = await service.GetMyAccountByIdAsync(1, 3);
        var notMine2 = await service.GetMyAccountByIdAsync(2, 1);

        Assert.Null(notMine);
        Assert.Null(notMine2);
    }
}
