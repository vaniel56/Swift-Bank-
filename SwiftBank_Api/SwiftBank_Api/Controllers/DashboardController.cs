using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftBank.Application.Interfaces;
using System.Security.Claims;

namespace SwiftBank_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(
        IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var dashboard =
            await _dashboardService.GetDashboardAsync(userId);

        return Ok(dashboard);
    }
}