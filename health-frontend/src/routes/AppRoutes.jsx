import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

//Protectedroute
import ProtectedRoute from "../components/ProtectedRoute";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import Doctors from "../pages/admin/Doctors";
import AddDoctor from "../pages/admin/AddDoctor";
import Products from "../pages/admin/Products";
import AppointmentPage from "../pages/admin/Appointments";
import AmbulancePage from "../pages/admin/Ambulances";
import ProductOrders from "../pages/admin/ProductOrders";
import AmbulanceBookings from "../pages/admin/AmbulanceBookings";
import Hospitals from "../pages/admin/Hospitals";
import HospitalSessions from "../pages/admin/HospitalSessions";
import AdminSlotRequests from "../pages/admin/AdminSlotRequests";
import AdminBlogs from "../pages/admin/Blogs";
import AdminContactMessages from "../pages/admin/AdminContactMessages";

// Doctor
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorAvailabilitys from "../pages/doctor/DoctorAvailability";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorSlotRequest from "../pages/doctor/DoctorSlotRequest";

// Patient
import PatientLayout from "../layouts/PatientLayout";
import PatientDashboard from "../pages/patient/Dashboard";
import PatientPage from "../pages/patient/Profile";
import DoctorBooking from "../pages/patient/Bookdoctor";
import PatientProducts from "../pages/patient/Products";
import AmbulanceBook from "../pages/patient/AmbulanceBook";
import PatientDoctors from "../pages/patient/Doctors";
import PatientOrders from "../pages/patient/Orders";
import AboutUS from "../pages/patient/AboutUs";
import ContactUs from "../pages/patient/Contacts";
import LocationPage from "../pages/patient/Locations";
import EmergencyInfos from "../pages/patient/EmergencyInfo";
import PlaceOrders from "../pages/patient/Placeorder";
import PatientAppointments from "../pages/patient/Appointments";
import AmbulanceRequest from "../pages/patient/AmbulanceRequest";
import RideStatus from "../pages/patient/RideStatus";
import Blog from "../pages/patient/Blog";
import BlogDetails from "../pages/patient/BlogDetails";
import DoctorDetails from "../pages/patient/DoctorDetails";
import AppointmentDetail from "../pages/patient/Appointmentdetail";


// Ambulance Driver
import AmbulanceDashboard from "../pages/ambulance/Dashboard";
import Ambulancerequest from "../pages/ambulance/Ambulancerequests";
import AmbulanceProfile from "../pages/ambulance/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<PatientDashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<Doctors />} />
        <Route path="/admin/doctors/add" element={<AddDoctor />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/appointments" element={<AppointmentPage />} />
        <Route path="/admin/ambulances" element={<AmbulancePage />} />
        <Route path="/admin/product-orders" element={<ProductOrders />} />
        <Route path="/admin/ambulance-bookings" element={<AmbulanceBookings />} />
        <Route path="/admin/hospitals" element={<Hospitals />} />
        <Route path="/admin/hospital-sessions" element={<HospitalSessions />} />
        <Route path="/admin/slot-requests" element={<AdminSlotRequests />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />


        {/* DOCTOR */}
        <Route path="/doctor/" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/availability" element={<DoctorAvailabilitys />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route
          path="/doctor/request-slot"
          element={<DoctorSlotRequest />}
        />



        {/* PATIENT */}
        {/* PATIENT */}

        <Route path="/patient" element={<PatientDashboard />} />

        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute>
              <PatientPage />
            </ProtectedRoute>
          }
        />

        <Route path="/patient/Locations" element={<LocationPage />} />
        <Route path="/patient/bookdoctor" element={<DoctorBooking />} />
        <Route path="/patient/products" element={<PatientProducts />} />
        <Route path="/patient/ambulance" element={<AmbulanceBook />} />
        <Route path="/patient/doctors" element={<PatientDoctors />} />
        <Route path="/patient/AboutUs" element={<AboutUS />} />
        <Route path="/patient/EmergencyInfo" element={<EmergencyInfos />} />
        <Route path="/patient/Contacts" element={<ContactUs />} />
        <Route path="/patient/EmergencyInfo" element={<EmergencyInfos />} />

        {/* BLOG */}
        <Route path="/patient/blog" element={<Blog />} />
        <Route path="/patient/blog/:id" element={<BlogDetails />} />

        <Route
          path="/patient/orders"
          element={
            <ProtectedRoute>
              <PatientOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/Place-order"
          element={
            <ProtectedRoute>
              <PlaceOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/ambulance/request"
          element={
            <ProtectedRoute>
              <AmbulanceRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/ride/:id"
          element={
            <ProtectedRoute>
              <RideStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/doctors/:id"
          element={
            <ProtectedRoute>
              <DoctorDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetail />
            </ProtectedRoute>
          }
        />

        {/* AMBULANCE DRIVER */}
        <Route path="/ambulance" element={<AmbulanceDashboard />} />
        <Route path="/ambulance/requests" element={<Ambulancerequest />} />
        <Route path="/ambulance/profile" element={<AmbulanceProfile />} />

      </Routes>
    </BrowserRouter>
  );
}