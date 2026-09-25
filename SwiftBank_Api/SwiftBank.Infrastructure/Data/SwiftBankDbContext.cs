using Microsoft.EntityFrameworkCore;
using SwiftBank.Domain.Entities;

namespace SwiftBank.Infrastructure.Data;

public class SwiftBankDbContext : DbContext
{
    public SwiftBankDbContext(
        DbContextOptions<SwiftBankDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Account> Accounts => Set<Account>();

    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(SwiftBankDbContext).Assembly);
    }
}