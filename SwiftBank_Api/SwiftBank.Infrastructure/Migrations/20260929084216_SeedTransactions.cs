using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwiftBank.Infrastructure.Migrations
{
    /// <inheritdoc />
    // -------------------------------------------------------------------------
    // SUPERSEDED -- deliberately a no-op.
    //
    // This migration originally inserted seed transactions (Ids 1-4) for the
    // seed accounts that SeedAccounts created. SeedAccounts is now a no-op (it
    // could never run on a fresh database), so those transactions are seeded by
    // the self-contained SeedAccountsAndTransactions migration instead.
    // -------------------------------------------------------------------------
    public partial class SeedTransactions : Migration
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
