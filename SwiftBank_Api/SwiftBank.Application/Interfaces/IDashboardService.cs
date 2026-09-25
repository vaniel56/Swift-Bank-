using SwiftBank.Application.DTOs;

namespace SwiftBank.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetDashboardAsync(
        int userId);
}