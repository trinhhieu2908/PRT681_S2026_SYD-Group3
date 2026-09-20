using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrack.Database.Migrations
{
    /// <inheritdoc />
    public partial class CreateFollowUps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "follow_up",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Notes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_follow_up", x => x.Id);
                    table.CheckConstraint("CK_follow_up_Completion", "(\"IsCompleted\" = TRUE AND \"CompletedAtUtc\" IS NOT NULL) OR (\"IsCompleted\" = FALSE AND \"CompletedAtUtc\" IS NULL)");
                    table.ForeignKey(
                        name: "FK_follow_up_job_application_JobApplicationId",
                        column: x => x.JobApplicationId,
                        principalTable: "job_application",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_JobApplicationId_IsCompleted_DueDate",
                table: "follow_up",
                columns: new[] { "JobApplicationId", "IsCompleted", "DueDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "follow_up");
        }
    }
}
