using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftBank.Application.Interfaces;
using System.Security.Claims;

namespace SwiftBank_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyAccounts()
    {
        int userId = GetUserId();

        var accounts =
            await _accountService.GetMyAccountsAsync(userId);

        return Ok(accounts);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAccount(int id)
    {
        int userId = GetUserId();

        var account =
            await _accountService.GetMyAccountByIdAsync(
                userId,
                id);

        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    private int GetUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user ID.");
        }

        return userId;
    }
}