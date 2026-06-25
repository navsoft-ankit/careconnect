namespace HEALTHCARE.DTOs;

public class AdminDashboardDto
{
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalAmbulances { get; set; }
    public int TotalProducts { get; set; }
    public int TotalAppointments { get; set; }
    public int TotalOrders { get; set; }
    public int PendingAppointments { get; set; }
    public int PendingAmbulanceRequests { get; set; }
}