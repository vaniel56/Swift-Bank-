using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SwiftBank.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAccountsAndTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Demo user (john@example.com / Password123!).
            //    EF would emit a plain InsertData here, but Id = 1 already exists in
            //    current databases (it was created earlier by runtime registration), so
            //    do an idempotent INSERT-or-UPDATE instead. On a brand-new database this
            //    block runs before the account inserts below, so the FK to Users(1) is
            //    satisfied there too.
            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Id] = 1)
                BEGIN
                    SET IDENTITY_INSERT [Users] ON;
                    INSERT INTO [Users] ([Id], [FirstName], [LastName], [Email], [PasswordHash], [CreatedAt])
                    VALUES (1, N'John', N'Doe', N'john@example.com',
                            N'$2a$11$aunUqpk3cBhQIaMuhDw68eSz5tgEcAMIyt.4vifZjzRDXrbDNj2gK',
                            '2026-01-01');
                    SET IDENTITY_INSERT [Users] OFF;
                END
                ELSE
                BEGIN
                    UPDATE [Users]
                    SET [FirstName] = N'John',
                        [LastName] = N'Doe',
                        [Email] = N'john@example.com',
                        [PasswordHash] = N'$2a$11$aunUqpk3cBhQIaMuhDw68eSz5tgEcAMIyt.4vifZjzRDXrbDNj2gK',
                        [CreatedAt] = '2026-01-01'
                    WHERE [Id] = 1;
                END
                """);

            // 2) Insert the NEW seed accounts (1002 must exist before tx #4 is
            //    repointed to it, because of the FK to Accounts).
            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "Id", "AccountNumber", "AccountType", "Balance", "Currency", "UserId" },
                values: new object[,]
                {
                    { 1001, "0123456789", "Savings", 210000m, "NGN", 1 },
                    { 1002, "0987654321", "Current", 272300m, "NGN", 1 }
                });

            // 3) Seed the demo transaction (id 4, "Transfer Received", on account
            //    1002) idempotently:
            //      * fresh databases -- transaction 4 does not exist -> INSERT it
            //      * existing databases -- transaction 4 already exists from the old
            //        SeedTransactions migration -> just re-point it to account 1002
            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM [Transactions] WHERE [Id] = 4)
                BEGIN
                    SET IDENTITY_INSERT [Transactions] ON;
                    INSERT INTO [Transactions] ([Id], [AccountId], [Type], [Beneficiary], [Amount], [CreatedAt])
                    VALUES (4, 1002, N'Credit', N'Transfer Received', 50000.00, '2026-09-24');
                    SET IDENTITY_INSERT [Transactions] OFF;
                END
                ELSE
                BEGIN
                    UPDATE [Transactions] SET [AccountId] = 1002 WHERE [Id] = 4;
                END
                """);

            // 4) Remove the OLD seed rows (child transactions first for FK order)
            migrationBuilder.DeleteData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // tx #4 currently references account 1002; remove it first (explicitly,
            // do not rely on the cascade which would silently drop the row).
            migrationBuilder.DeleteData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 1002);

            // Restore the ORIGINAL seed rows
            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "Id", "AccountNumber", "AccountType", "Balance", "Currency", "UserId" },
                values: new object[,]
                {
                    { 1, "0123456789", "Savings", 210000m, "NGN", 1 },
                    { 2, "0987654321", "Current", 272300m, "NGN", 1 },
                    { 3, "1112223334", "Savings", 500000m, "NGN", 1 }
                });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "Id", "AccountId", "Amount", "Beneficiary", "CreatedAt", "Type" },
                values: new object[,]
                {
                    { 1, 1, 250000m, "Salary", new DateTime(2026, 9, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Credit" },
                    { 2, 1, 25000m, "Transfer to Chidi", new DateTime(2026, 9, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "Debit" },
                    { 3, 2, 15000m, "Electricity Bill", new DateTime(2026, 9, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), "Debit" },
                    { 4, 2, 50000m, "Transfer Received", new DateTime(2026, 9, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), "Credit" }
                });

            // NOTE: the demo user row (Id 1) is deliberately NOT deleted here. It is a
            // real runtime user (john@example.com) whose password hash this migration
            // sets to Password123! -- rolling back seed data must not drop the account.
        }
    }
}
