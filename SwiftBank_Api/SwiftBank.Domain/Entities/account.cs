namespace SwiftBank.Domain.Entities;

public class Account
{
    public int Id { get; set; }

    public string AccountNumber { get; set; } = string.Empty;

    public string AccountType { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    public string Currency { get; set; } = "NGN";

    // Owner of this account
    public int UserId { get; set; }

    // Navigation property
    public User User { get; set; } = null!;

    // Transactions belonging to this account
    public ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();
}