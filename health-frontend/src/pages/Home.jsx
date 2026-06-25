import "../styles/home.css";

function Home() {
  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="wrap">
          <div>📞 +1 (555) 014-2298 | ✉ care@hospital.com</div>
          <div>24/7 Emergency</div>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <div><b>Lakeview Hospital</b></div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#doctors">Doctors</a>
          <a href="#appointment">Appointment</a>
        </div>
        <div className="nav-cta">Book Now</div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              Multispecialty care <span>with trust</span>
            </h1>
            <p>
              Best hospital care system built with modern technology.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-primary">Book Appointment</button>
              <button className="btn-outline">Services</button>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0"
            width="100%"
            style={{ borderRadius: "12px" }}
          />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="wrap">
        <h2>Services</h2>
        <div className="services-grid">
          <div className="service-card">Cardiology</div>
          <div className="service-card">Neurology</div>
          <div className="service-card">Pediatrics</div>
          <div className="service-card">Orthopedics</div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="wrap">
        <h2>Doctors</h2>
        <div className="doctors-grid">
          <div className="service-card">Dr. Anika Roy</div>
          <div className="service-card">Dr. Samuel Cho</div>
          <div className="service-card">Dr. Maria</div>
          <div className="service-card">Dr. Imran</div>
        </div>
      </section>

      {/* APPOINTMENT */}
      <section id="appointment" className="wrap">
        <h2>Book Appointment</h2>

        <div className="form">
          <input placeholder="Name" />
          <input placeholder="Phone" />

          <select>
            <option>Cardiology</option>
            <option>Neurology</option>
          </select>

          <textarea placeholder="Problem"></textarea>

          <button className="btn-primary">Submit</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          © 2026 Lakeview Hospital
        </div>
      </footer>
    </>
  );
}

export default Home;