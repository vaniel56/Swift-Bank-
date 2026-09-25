namespace SwiftBank.Application.DTOs;

public class RecentTransactionDto
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }
}