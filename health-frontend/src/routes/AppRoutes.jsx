import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import Doctors from "../pages/admin/Doctors";
import AddDoctor from "../pages/admin/AddDoctor";
import Products from "../pages/admin/Products";
import AppointmentPage from "../pages/admin/Appointments";
import AmbulancePage from "../pages/admin/Ambulances";
import ProductOrders from "../pages/admin/ProductOrders";
import AmbulanceBookings from "../pages/admin/AmbulanceBookings";

// Doctor
import DoctorDashboard from "../pages/doctor/Dashboard";

// Patient
import PatientDashboard from "../pages/patient/Dashboard";
import PatientPage from "../pages/patient/Profile";
import DoctorBooking from "../pages/patient/Bookdoctor";
import PatientProducts from "../pages/patient/Products";
import AmbulanceBook from "../pages/patient/AmbulanceBook";
import PatientDoctors from "../pages/patient/Doctors";
import PatientOrders from "../pages/patient/Orders";
import AboutUS  from "../pages/patient/AboutUs";
import LocationPage  from "../pages/patient/Locations";
import EmergencyInfos  from "../pages/patient/EmergencyInfo";
import PlaceOrders from "../pages/patient/Placeorder";
import PatientAppointments from "../pages/patient/Appointments";
import AmbulanceRequest from "../pages/patient/AmbulanceRequest";

// Ambulance Driver
import AmbulanceDashboard from "../pages/ambulance/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
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

        {/* DOCTOR */}
        <Route path="/doctor/" element={<DoctorDashboard />} />

        {/* PATIENT */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/Profile" element={<PatientPage />} />
        <Route path="/patient/Locations" element={<LocationPage />} />
        <Route path="/patient/bookdoctor" element={<DoctorBooking />} />
        <Route path="/patient/products" element={<PatientProducts />} />
        <Route path="/patient/ambulance" element={<AmbulanceBook />} />
        <Route path="/patient/doctors" element={<PatientDoctors />} />
        <Route path="/patient/orders" element={<PatientOrders />} />
        <Route path="/patient/AboutUs" element={<AboutUS />} />
        <Route path="/patient/EmergencyInfo" element={<EmergencyInfos />} />
        <Route path="/patient/Place-order" element={<PlaceOrders />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/ambulance/request" element={<AmbulanceRequest />} />

        {/* AMBULANCE DRIVER */}
        <Route path="/ambulance" element={<AmbulanceDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}