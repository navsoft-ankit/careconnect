using Microsoft.EntityFrameworkCore;
using HEALTHCARE.Models;

namespace HEALTHCARE.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<AppUser> Users { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<DoctorAvailability> DoctorAvailabilities { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Ambulance> Ambulances { get; set; }
        public DbSet<AmbulanceRequest> AmbulanceRequests { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<HospitalLocation> HospitalLocations { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<ContactMessage> Contacts {get; set;}
        public DbSet<Hospital> Hospitals => Set<Hospital>();
        public DbSet<HospitalSession> HospitalSessions => Set<HospitalSession>();
        public DbSet<DoctorSlotRequest> DoctorSlotRequests => Set<DoctorSlotRequest>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Hospital>()
                .HasIndex(h => h.Name)
                .IsUnique();

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany()
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.DoctorAvailability)
                .WithMany()
                .HasForeignKey(a => a.DoctorAvailabilityId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Prescription>()
                .HasIndex(p => p.AppointmentId)
                .IsUnique();

            modelBuilder.Entity<HospitalSession>()
                .HasOne(hs => hs.Hospital)
                .WithMany()
                .HasForeignKey(hs => hs.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DoctorAvailability>()
                .HasOne(da => da.Hospital)
                .WithMany()
                .HasForeignKey(da => da.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}