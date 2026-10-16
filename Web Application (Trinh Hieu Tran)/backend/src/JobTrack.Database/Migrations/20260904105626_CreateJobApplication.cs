using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrack.Database.Migrations
{
    /// <inheritdoc />
    public partial class CreateJobApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "job_application",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    RoleTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Platform = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApplicationDate = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date"),
                    CurrentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Applied"),
                    JobLink = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    PortfolioLink = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    GitHubLink = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_application", x => x.Id);
                    table.ForeignKey(
                        name: "FK_job_application_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_job_application_UserId",
                table: "job_application",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_job_application_UserId_ApplicationDate",
                table: "job_application",
                columns: new[] { "UserId", "ApplicationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_job_application_UserId_CurrentStatus",
                table: "job_application",
                columns: new[] { "UserId", "CurrentStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_job_application_UserId_Platform",
                table: "job_application",
                columns: new[] { "UserId", "Platform" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_application");
        }
    }
}
