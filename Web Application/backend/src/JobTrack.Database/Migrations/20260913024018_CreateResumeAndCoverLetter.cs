using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrack.Database.Migrations
{
    /// <inheritdoc />
    public partial class CreateResumeAndCoverLetter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ResumeId",
                table: "job_application",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "cover_letter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ObjectKey = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(127)", maxLength: 127, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cover_letter", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cover_letter_job_application_JobApplicationId",
                        column: x => x.JobApplicationId,
                        principalTable: "job_application",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_cover_letter_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resume",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ObjectKey = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(127)", maxLength: 127, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resume", x => x.Id);
                    table.ForeignKey(
                        name: "FK_resume_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_job_application_ResumeId",
                table: "job_application",
                column: "ResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_cover_letter_UserId",
                table: "cover_letter",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UX_cover_letter_JobApplicationId",
                table: "cover_letter",
                column: "JobApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_cover_letter_ObjectKey",
                table: "cover_letter",
                column: "ObjectKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_resume_ObjectKey",
                table: "resume",
                column: "ObjectKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_resume_UserId_FileName",
                table: "resume",
                columns: new[] { "UserId", "FileName" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_job_application_resume_ResumeId",
                table: "job_application",
                column: "ResumeId",
                principalTable: "resume",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_job_application_resume_ResumeId",
                table: "job_application");

            migrationBuilder.DropTable(
                name: "cover_letter");

            migrationBuilder.DropTable(
                name: "resume");

            migrationBuilder.DropIndex(
                name: "IX_job_application_ResumeId",
                table: "job_application");

            migrationBuilder.DropColumn(
                name: "ResumeId",
                table: "job_application");
        }
    }
}
