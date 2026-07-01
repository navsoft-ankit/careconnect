namespace HEALTHCARE.Dtos
{
    public class MedicineItemDto
    {
        public string Name { get; set; } = "";
        public string Dosage { get; set; } = "";
        public string Frequency { get; set; } = "";
        public string Duration { get; set; } = "";
        public string? Instructions { get; set; }
    }

    public class CreatePrescriptionDto
    {
        public int AppointmentId { get; set; }
        public string Diagnosis { get; set; } = "";
        public List<MedicineItemDto> Medicines { get; set; } = new();
        public string? Notes { get; set; }
        public string? AdviceOnFollowUp { get; set; }
    }

    public class PrescriptionResponseDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public string Diagnosis { get; set; } = "";
        public List<MedicineItemDto> Medicines { get; set; } = new();
        public string? Notes { get; set; }
        public string? AdviceOnFollowUp { get; set; }
        public DateTime CreatedAt { get; set; }

        // Denormalized display fields, filled in by the controller
        public string DoctorName { get; set; } = "";
        public string DoctorSpecialization { get; set; } = "";
        public string PatientName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = "";
        public string HospitalName { get; set; } = "";
    }
}