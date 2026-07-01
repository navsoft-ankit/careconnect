using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HEALTHCARE.Models;

namespace HEALTHCARE.Models
{
    public class Prescription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AppointmentId { get; set; }

        [ForeignKey("AppointmentId")]
        public Appointment Appointment { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required, MaxLength(500)]
        public string Diagnosis { get; set; }

        // Stored as JSON in a single column — avoids a separate child table
        // and keeps read/write simple for a variable-length medicine list.
        [Required, Column(TypeName = "nvarchar(max)")]
        public string MedicinesJson { get; set; } = "[]";

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [MaxLength(1000)]
        public string? AdviceOnFollowUp { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // Not mapped directly — used to (de)serialize MedicinesJson
    public class MedicineItem
    {
        public string Name { get; set; } = "";
        public string Dosage { get; set; } = "";      // e.g. "500mg"
        public string Frequency { get; set; } = "";   // e.g. "1-0-1"
        public string Duration { get; set; } = "";    // e.g. "5 days"
        public string? Instructions { get; set; }      // e.g. "After food"
    }
}