namespace SwiftBank.Application.DTOs;

public class AccountResponseDto
{
    public int Id { get; set; }

    public string AccountNumber { get; set; } = string.Empty;

    public string AccountType { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    public string Currency { get; set; } = string.Empty;
}