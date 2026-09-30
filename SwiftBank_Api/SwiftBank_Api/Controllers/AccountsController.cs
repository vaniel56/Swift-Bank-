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

    // GET /api/accounts  and  GET /api/accounts/my-accounts
    // both return the logged-in customer's own accounts.
    [HttpGet]
    [HttpGet("my-accounts")]
    public async Task<IActionResult> GetMyAccounts()
    {
        int? userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var accounts =
            await _accountService.GetMyAccountsAsync(userId.Value);

        return Ok(accounts);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAccount(int id)
    {
        int? userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var account =
            await _accountService.GetMyAccountByIdAsync(
                userId.Value,
                id);

        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    // Returns null (mapped to 401 Unauthorized by the actions above)
    // when the user id claim is missing or not a valid integer.
    private int? GetUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return null;
        }

        return userId;
    }
}