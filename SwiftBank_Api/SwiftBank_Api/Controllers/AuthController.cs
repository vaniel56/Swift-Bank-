using Microsoft.AspNetCore.Mvc;
using SwiftBank.Application.Interfaces;

namespace SwiftBank.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly IAuthService _authService;

  public AuthController(IAuthService authService)
  {
    _authService = authService;
  }

  [HttpGet("login")]
  public IActionResult Login()
  {
    var result = _authService.Login();

    return Ok(result);
  }
}
