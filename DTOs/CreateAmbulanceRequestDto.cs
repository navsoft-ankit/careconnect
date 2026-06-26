namespace HEALTHCARE.DTOs;

public class CreateAmbulanceRequestDto
{
    public int AmbulanceId { get; set; }
    public string PickupLocation { get; set; } = string.Empty;
    public string DestinationLocation { get; set; } = string.Empty;

    public double PickupLat { get; set; }
    public double PickupLng { get; set; }
    public double DestinationLat { get; set; }
    public double DestinationLng { get; set; }

    public string VehicleType { get; set; } = "NonAC"; // NonAC | AC | Big
    public decimal EstimatedFare { get; set; } // client estimate, server recalculates
}