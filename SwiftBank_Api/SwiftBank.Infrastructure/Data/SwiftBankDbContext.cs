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

        // =====================================================================
        // Demo user seed (created here so it also appears in a fresh database).
        // Login: john@example.com / Password123!
        // BCrypt (work factor 11) hash computed at design time -- never plaintext.
        // NOTE: this is the FIRST migration to seed a User. The existing LocalDB
        // already has this row (Id 1 => john@example.com), so the migration does
        // an INSERT-or-UPDATE merge rather than a plain InsertData.
        // =====================================================================
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            PasswordHash = "$2a$11$aunUqpk3cBhQIaMuhDw68eSz5tgEcAMIyt.4vifZjzRDXrbDNj2gK",
            CreatedAt = new DateTime(2026, 1, 1)
        });
    }
}