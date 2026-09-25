using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwiftBank.Domain.Entities;

namespace SwiftBank.Infrastructure.Data.Configurations;

public class TransactionConfiguration
    : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Amount)
            .HasPrecision(18, 2);

        builder.Property(t => t.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Beneficiary)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId);
    }
}