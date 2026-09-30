using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwiftBank.Infrastructure.Migrations
{
    /// <inheritdoc />
    // -------------------------------------------------------------------------
    // SUPERSEDED -- deliberately a no-op.
    //
    // This migration originally inserted seed accounts (Ids 1,2,3) for UserId 1,
    // but it could never run on a FRESH database: no migration ever inserted
    // User Id 1, so the FK (FK_Accounts_Users_UserId) violated on empty installs.
    //
    // The final, self-contained seed lives in SeedAccountsAndTransactions, which
    // first INSERT-or-UPDATEs the demo user and then seeds accounts 1001/1002.
    // Keeping this migration (and SeedTransactions) as no-ops preserves the
    // migration chain that already ran against existing databases.
    // --------------------------------------------------------------------------
    public partial class SeedAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op. See class comment above.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op. See class comment above.
        }
    }
}
