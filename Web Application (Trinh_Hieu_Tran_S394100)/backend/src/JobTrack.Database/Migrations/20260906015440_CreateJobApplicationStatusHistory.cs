using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrack.Database.Migrations
{
    /// <inheritdoc />
    public partial class CreateJobApplicationStatusHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "job_application_status_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    OldStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NewStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_application_status_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_job_application_status_history_job_application_JobApplicati~",
                        column: x => x.JobApplicationId,
                        principalTable: "job_application",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_job_application_status_history_JobApplicationId_CreatedAtUtc",
                table: "job_application_status_history",
                columns: new[] { "JobApplicationId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_application_status_history");
        }
    }
}
