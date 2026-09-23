using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SwiftBank.Application.DTOs;
using SwiftBank.Application.Interfaces;
using SwiftBank.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SwiftBank_Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize] // 🔒 All actions require a valid JWT unless marked [AllowAnonymous]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
      _authService = authService;
      _configuration = configuration;
    }

    // POST api/auth/register  — PUBLIC
    [AllowAnonymous]
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

    // POST api/auth/login  — PUBLIC
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
      if (!ModelState.IsValid)
        return BadRequest(new { message = "Invalid login request." });

      var user = await _authService.LoginAsync(request.Email, request.Password);
      if (user == null)
        return Unauthorized(new { message = "Invalid email or password." });

      var (token, expiresIn) = GenerateJwtToken(user);

      return Ok(new
      {
        message = "Login successful.",
        token,
        expiresIn, // Token lifetime in seconds (15 minutes)
        expiresAt = DateTime.UtcNow.AddSeconds(expiresIn),
        userId = user.Id,
        firstName = user.FirstName,
        lastName = user.LastName,
        email = user.Email
      });
    }
    private (string Token, int ExpiresIn) GenerateJwtToken(User user)
    {
      const int LIFETIME_SECONDS = 15 * 60; // 15 minutes

      var claims = new[]
      {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

      var keyString = _configuration["Jwt:Key"]
          ?? throw new InvalidOperationException("Jwt:Key is not configured.");

      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var token = new JwtSecurityToken(
          issuer: _configuration["Jwt:Issuer"],
          audience: _configuration["Jwt:Audience"],
          claims: claims,
          expires: DateTime.UtcNow.AddSeconds(LIFETIME_SECONDS),
          signingCredentials: creds);

      return (new JwtSecurityTokenHandler().WriteToken(token), LIFETIME_SECONDS);
    }
  }
}