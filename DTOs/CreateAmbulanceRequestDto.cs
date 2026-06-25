namespace HEALTHCARE.DTOs;

public class CreateAmbulanceRequestDto
{
    public int AmbulanceId { get; set; }
    public string PickupLocation { get; set; }
    public string DestinationLocation { get; set; }
}