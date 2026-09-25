using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftBank.Domain.Entities;

namespace SwiftBank.Infrastructure.Data.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AccountNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.AccountType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Balance)
            .HasPrecision(18, 2);

        builder.Property(a => a.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.HasOne(a => a.User)
            .WithMany(u => u.Accounts)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Transactions)
            .WithOne(t => t.Account)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}