using Microsoft.AspNetCore.Mvc;
using SwiftBank.Application.DTOs;
using SwiftBank.Domain.Entities;
using SwiftBank.Application.Services;
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
    // POST api/auth/register - registers a new user.
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
      if (!ModelState.IsValid)
        return BadRequest(new { message = "Please check the form and try again.", errors = ModelState });

      if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        return BadRequest(new { message = "Email and password are required." });

      if (request.Password != request.ConfirmPassword)
        return BadRequest(new { message = "Passwords do not match." });

      var registered = await _authService.RegisterAsync(request);
      if (!registered)
        return Conflict(new { message = "A user with this email already exists." });

      return Ok(new { message = "Registration successful." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
      var result = await _authService.LoginAsync(request);

      if (!result)
      {
        return Unauthorized(new
        {
          message = "Invalid email or password."
        });
      }

      return Ok(new
      {
        message = "Login successful."
      });
    }
  }

  
}
