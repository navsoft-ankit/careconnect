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
        public string PatientAddress { get; set; } = "";

        // Doctor
        public string DoctorName { get; set; } = "";
        public string DoctorSpecialization { get; set; } = "";
        public string HospitalName { get; set; } = "";
        public string PlaceToVisit { get; set; } = "";
        public string DoctorEmail { get; set; } = "";
        public string DoctorPhone { get; set; } = "";
        public string Qualification { get; set; } = "";
        public string Experience { get; set; } = "";

        // Patient
        public string PatientName { get; set; } = "";
        public string PatientEmail { get; set; } = "";
        public string PatientPhone { get; set; } = "";
        public DateTime? PatientDob { get; set; }
        public string Gender { get; set; } = "";
        public string BloodGroup { get; set; } = "";
        public string Address { get; set; } = "";

        // Appointment
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = "";
    }
}