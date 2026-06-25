using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCare.Migrations
{
    /// <inheritdoc />
    public partial class AddAmbulanceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "AmbulanceRequests");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Ambulances",
                newName: "DriverPhone");

            migrationBuilder.RenameColumn(
                name: "Destination",
                table: "AmbulanceRequests",
                newName: "DestinationLocation");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Ambulances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AmbulanceId",
                table: "AmbulanceRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "RequestTime",
                table: "AmbulanceRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Ambulances_UserId",
                table: "Ambulances",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ambulances_Users_UserId",
                table: "Ambulances",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ambulances_Users_UserId",
                table: "Ambulances");

            migrationBuilder.DropIndex(
                name: "IX_Ambulances_UserId",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "AmbulanceId",
                table: "AmbulanceRequests");

            migrationBuilder.DropColumn(
                name: "RequestTime",
                table: "AmbulanceRequests");

            migrationBuilder.RenameColumn(
                name: "DriverPhone",
                table: "Ambulances",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "DestinationLocation",
                table: "AmbulanceRequests",
                newName: "Destination");

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "AmbulanceRequests",
                type: "int",
                nullable: true);
        }
    }
}
