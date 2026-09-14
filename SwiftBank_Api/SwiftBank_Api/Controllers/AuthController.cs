using Microsoft.AspNetCore.Mvc;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;

namespace SwiftBank_Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
      _authService = authService;
    }
  //  endpoint
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
      // 1. Basic validation
      if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        return BadRequest("Email and password are required.");

      if (request.Password != request.ConfirmPassword)
        return BadRequest("Passwords do not match.");

      // 2. Register the user through the application service
      var registered = await _authService.RegisterAsync(request);

      if (!registered)
      {
        return BadRequest(new
        {
          message = "A user with this email already exists."
        });
      }

      return Ok(new
      {
        message = "Registration successful."
      });
    }
  }
}