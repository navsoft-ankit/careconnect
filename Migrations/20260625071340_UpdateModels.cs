using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_UserDetails_UserId",
                table: "Doctors");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserDetails",
                table: "UserDetails");

            migrationBuilder.RenameTable(
                name: "UserDetails",
                newName: "Users");

            migrationBuilder.RenameColumn(
                name: "AppointmentDate",
                table: "Appointments",
                newName: "BookedAt");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DoctorAvailabilityId",
                table: "Appointments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Destination",
                table: "AmbulanceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "AmbulanceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Ambulances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DriverName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ambulances", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_UserId",
                table: "Doctors",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_UserId",
                table: "Doctors");

            migrationBuilder.DropTable(
                name: "Ambulances");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DoctorAvailabilityId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "Destination",
                table: "AmbulanceRequests");

            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "AmbulanceRequests");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "UserDetails");

            migrationBuilder.RenameColumn(
                name: "BookedAt",
                table: "Appointments",
                newName: "AppointmentDate");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserDetails",
                table: "UserDetails",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_UserDetails_UserId",
                table: "Doctors",
                column: "UserId",
                principalTable: "UserDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
