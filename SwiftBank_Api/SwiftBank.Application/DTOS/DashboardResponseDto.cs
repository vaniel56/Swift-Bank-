namespace SwiftBank.Application.DTOs;

public class DashboardResponseDto
{
    public List<AccountResponseDto> Accounts { get; set; }
        = new();

    public decimal TotalBalance { get; set; }

    public string Currency { get; set; } = "NGN";

    public List<RecentTransactionDto> RecentTransactions { get; set; }
        = new();
}