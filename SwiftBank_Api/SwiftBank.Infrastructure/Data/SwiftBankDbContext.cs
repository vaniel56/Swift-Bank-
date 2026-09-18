using Microsoft.EntityFrameworkCore;
using SwiftBank.Domain.Entities;

namespace SwiftBank.Infrastructure.Data;

public class SwiftBankDbContext(DbContextOptions<SwiftBankDbContext> options) : DbContext(options)
{
    public required DbSet<User> Users { get; set; }
}