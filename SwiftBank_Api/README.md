# SwiftBank API (local development)

The API targets .NET 10 and uses SQL Server. Windows LocalDB is not available on
macOS, so the development configuration connects to the SQL Server container
defined in `docker-compose.yml`.

1. Install and start Docker Desktop.
2. From the repository root, enter the API solution directory, set a strong
   local SQL Server password, and start the database:

   ```zsh
   cd SwiftBank_Api
   export MSSQL_SA_PASSWORD='Use-a-strong-local-password-123!'
   docker compose up -d sqlserver
   ```

3. Wait until `docker compose ps` reports the database as healthy. In the same
   terminal, run the API:

   ```zsh
   dotnet run --project SwiftBank_Api/SwiftBank_Api.csproj
   ```

   From the repository root, use
   `dotnet run --project SwiftBank_Api/SwiftBank_Api/SwiftBank_Api.csproj`
   instead.

The API applies EF Core migrations at startup and listens at
`http://localhost:5271`. Open Swagger at
`http://localhost:5271/swagger`. The example requests in
`SwiftBank_Api/SwiftBank_Api.http` can verify login and authenticated endpoints.

Keep `MSSQL_SA_PASSWORD` in your shell environment; do not commit local
credentials. Production deployments should provide a complete
`ConnectionStrings__DefaultConnection` setting and their own JWT signing key.
