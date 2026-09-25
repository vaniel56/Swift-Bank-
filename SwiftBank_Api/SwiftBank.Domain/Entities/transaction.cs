namespace SwiftBank.Domain.Entities;

public class Transaction
{
  public int Id { get; set; }

  // Account this transaction belongs to
  public int AccountId { get; set; }

  public string Type { get; set; } = string.Empty;

  public string Beneficiary { get; set; } = string.Empty;

  public decimal Amount { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  // Navigation property
  public Account Account { get; set; } = null!;
}