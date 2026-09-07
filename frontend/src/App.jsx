import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const EMPTY_FORM = {
  company_name: "",
  job_title: "",
  job_url: "",
  location: "",
  salary: "",
  application_date: new Date().toISOString().split("T")[0],
  status: "Applied",
  notes: "",
};

const STATUS_OPTIONS = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function App() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // -----------------------------------------
  // FETCH APPLICATIONS
  // -----------------------------------------
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Close the details modal with the Escape key.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedApplication(null);
      }
    };

    if (selectedApplication) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedApplication]);

  // -----------------------------------------
  // FORM HANDLING
  // -----------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // CREATE / UPDATE APPLICATION
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.company_name.trim() || !form.job_title.trim()) {
      setError("Company name and job title are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        company_name: form.company_name,
        job_title: form.job_title,
        job_url: form.job_url,
        location: form.location,
        salary: form.salary,
        application_date: form.application_date,
        status: form.status,
        notes: form.notes,
      };

      const url = editingId
        ? `${API_URL}/applications/${editingId}`
        : `${API_URL}/applications`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to save application"
        );
      }

      await fetchApplications();

      setForm({
        ...EMPTY_FORM,
        application_date: new Date().toISOString().split("T")[0],
      });

      setEditingId(null);

      setMessage(
        editingId
          ? "Application updated successfully."
          : "Application added successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // VIEW DETAILS
  // -----------------------------------------
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  const closeDetails = () => {
    setSelectedApplication(null);
  };

  // -----------------------------------------
  // EDIT
  // -----------------------------------------
  const handleEdit = (application) => {
    setEditingId(application.id);

    setForm({
      company_name: application.company_name || "",
      job_title: application.job_title || "",
      job_url: application.job_url || "",
      location: application.location || "",
      salary: application.salary || "",
      application_date: application.application_date || "",
      status: application.status || "Applied",
      notes: application.notes || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------------------
  // CANCEL EDIT
  // -----------------------------------------
  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      application_date: new Date().toISOString().split("T")[0],
    });

    setError("");
    setMessage("");
  };

  // -----------------------------------------
  // DELETE
  // -----------------------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to delete application"
        );
      }

      await fetchApplications();

      setMessage("Application deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete application.");
    }
  };

  // -----------------------------------------
  // FILTER + SORT APPLICATIONS
  // -----------------------------------------
  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        application.company_name
          ?.toLowerCase()
          .includes(searchText) ||
        application.job_title
          ?.toLowerCase()
          .includes(searchText) ||
        application.location
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.application_date || "").localeCompare(
            a.application_date || ""
          );

        case "oldest":
          return (a.application_date || "").localeCompare(
            b.application_date || ""
          );

        case "company-asc":
          return (a.company_name || "").localeCompare(
            b.company_name || ""
          );

        case "company-desc":
          return (b.company_name || "").localeCompare(
            a.company_name || ""
          );

        case "status":
          return (a.status || "").localeCompare(
            b.status || ""
          );

        default:
          return 0;
      }
    });
  }, [applications, search, statusFilter, sortBy]);

  // -----------------------------------------
  // INTERVIEW APPLICATIONS
  // -----------------------------------------
  const interviewApplications = useMemo(() => {
    return [...applications]
      .filter((application) => application.status === "Interview")
      .sort(
        (a, b) =>
          new Date(b.application_date || 0) -
          new Date(a.application_date || 0)
      );
  }, [applications]);

  // -----------------------------------------
  // STATISTICS
  // -----------------------------------------
  const stats = useMemo(() => {
    const total = applications.length;

    const applied = applications.filter(
      (app) => app.status === "Applied"
    ).length;

    const interviews = applications.filter(
      (app) => app.status === "Interview"
    ).length;

    const offers = applications.filter(
      (app) => app.status === "Offer"
    ).length;

    const rejected = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    const withdrawn = applications.filter(
      (app) => app.status === "Withdrawn"
    ).length;

    const interviewRate =
      total > 0 ? Math.round((interviews / total) * 100) : 0;

    const offerRate =
      total > 0 ? Math.round((offers / total) * 100) : 0;

    const rejectionRate =
      total > 0 ? Math.round((rejected / total) * 100) : 0;

    // Conversion rates through the job-search funnel.
    const applicationToInterviewRate =
      total > 0 ? Math.round((interviews / total) * 100) : 0;

    const interviewToOfferRate =
      interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    const applicationToOfferRate =
      total > 0 ? Math.round((offers / total) * 100) : 0;

    return {
      total,
      applied,
      interviews,
      offers,
      rejected,
      withdrawn,
      interviewRate,
      offerRate,
      rejectionRate,
      applicationToInterviewRate,
      interviewToOfferRate,
      applicationToOfferRate,
    };
  }, [applications]);

  // -----------------------------------------
  // OFFER APPLICATIONS
  // -----------------------------------------
  const offerApplications = useMemo(
    () =>
      [...applications]
        .filter((application) => application.status === "Offer")
.sort((a, b) =>
          (b.application_date || "").localeCompare(
            a.application_date || ""
          )
        ),
    [applications]
  );

  // -----------------------------------------
  // SUCCESS FUNNEL
  // -----------------------------------------
  const funnelSteps = [
    {
      label: "Applied",
      count: stats.applied,
      className: "applied-bar",
      icon: "📨",
    },
    {
      label: "Interview",
      count: stats.interviews,
      className: "interview-bar",
      icon: "🎯",
    },
    {
      label: "Offer",
      count: stats.offers,
      className: "offer-bar",
      icon: "🎉",
    },
  ];

  // -----------------------------------------
  // STATUS CLASS
  // -----------------------------------------
  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";

      case "Interview":
        return "status-interview";

      case "Offer":
        return "status-offer";

      case "Rejected":
        return "status-rejected";

      case "Withdrawn":
        return "status-withdrawn";

      default:
        return "";
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <div className="brand">
            <div className="brand-icon">💼</div>

            <div>
              <h1>Job Application Tracker</h1>
              <p>Manage your job search in one place</p>
            </div>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={fetchApplications}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </header>

      <main className="container">

        {/* ALERTS */}
        {error && (
          <div className="alert error-alert">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {message && (
          <div className="alert success-alert">
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon total-icon">📋</div>

            <div>
              <p>Total Applications</p>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon applied-icon">📨</div>

            <div>
              <p>Applied</p>
              <h2>{stats.applied}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon interview-icon">🎯</div>

            <div>
              <p>Interviews</p>
              <h2>{stats.interviews}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon offer-icon">🎉</div>

            <div>
              <p>Offers</p>
              <h2>{stats.offers}</h2>
            </div>
          </div>

        </section>

        {/* =========================================
            APPLICATION ANALYTICS
            ========================================= */}
        <section className="analytics-section">

          <div className="analytics-header">
            <div>
              <h2>📊 Application Analytics</h2>
              <p>Track your job search progress at a glance</p>
            </div>
          </div>

          <div className="analytics-grid">

            {/* STATUS DISTRIBUTION */}
            <div className="analytics-card">

              <h3>Status Distribution</h3>

              {/* APPLIED */}
              <div className="chart-row">

                <div className="chart-label">
                  <span>Applied</span>
                  <strong>{stats.applied}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar applied-bar"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.applied / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* INTERVIEWS */}
              <div className="chart-row">

                <div className="chart-label">
                  <span>Interviews</span>
                  <strong>{stats.interviews}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar interview-bar"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.interviews / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* OFFERS */}
              <div className="chart-row">

                <div className="chart-label">
                  <span>Offers</span>
                  <strong>{stats.offers}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar offer-bar"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.offers / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* REJECTED */}
              <div className="chart-row">

                <div className="chart-label">
                  <span>Rejected</span>
                  <strong>{stats.rejected}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar rejected-bar"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.rejected / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* WITHDRAWN */}
              <div className="chart-row">

                <div className="chart-label">
                  <span>Withdrawn</span>
                  <strong>{stats.withdrawn}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar withdrawn-bar"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.withdrawn / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>

            {/* CONVERSION METRICS */}
            <div className="analytics-card">

              <h3>Conversion Metrics</h3>

              {/* APPLICATION → INTERVIEW */}
              <div className="metric-item">

                <div className="metric-icon">
                  🎯
                </div>

                <div className="metric-content">
                  <span>Application → Interview</span>
                  <strong>{stats.applicationToInterviewRate}%</strong>
                </div>

              </div>

              {/* INTERVIEW → OFFER */}
              <div className="metric-item">

                <div className="metric-icon">
                  🎉
                </div>

                <div className="metric-content">
                  <span>Interview → Offer</span>
                  <strong>{stats.interviewToOfferRate}%</strong>
                </div>

              </div>

              {/* APPLICATION → OFFER */}
              <div className="metric-item">

                <div className="metric-icon">
                  🏆
                </div>

                <div className="metric-content">
                  <span>Application → Offer</span>
                  <strong>{stats.applicationToOfferRate}%</strong>
                </div>

              </div>

              {/* REJECTION RATE */}
              <div className="metric-item">

                <div className="metric-icon">
                  ❌
                </div>

                <div className="metric-content">
                  <span>Rejection Rate</span>
                  <strong>{stats.rejectionRate}%</strong>
                </div>

              </div>

              {/* TOTAL */}
              <div className="metric-summary">

                <span>Total Applications</span>

                <strong>{stats.total}</strong>

              </div>

            </div>

          </div>

        </section>

        {/* INTERVIEW APPLICATIONS */}
        <section className="panel applications-panel">
          <div className="panel-header applications-header">
            <div>
              <h2>🎯 Interview Applications</h2>
              <p>Applications currently in the interview stage</p>
            </div>
            <span className="status-badge status-interview">
              {interviewApplications.length}
            </span>
          </div>

          {interviewApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No interviews yet</h3>
              <p>Applications moved to Interview will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Application Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interviewApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="company-cell">
                          <div className="company-avatar">
                            {application.company_name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <strong>{application.company_name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="job-title">
                          {application.job_title}
                        </strong>
                      </td>
                      <td>{application.location || "—"}</td>
                      <td>{application.application_date || "—"}</td>
                      <td>
                        <span className="status-badge status-interview">
                          Interview
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() => handleViewDetails(application)}
                          title="View interview application"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* OFFER APPLICATIONS */}
        <section className="panel applications-panel">
          <div className="panel-header applications-header">
            <div>
              <h2>🎉 Offer Applications</h2>
              <p>Applications that have reached the offer stage</p>
            </div>
            <span className="status-badge status-offer">
              {offerApplications.length}
            </span>
          </div>

          {offerApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>No offers yet</h3>
              <p>Applications moved to Offer will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Application Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {offerApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="company-cell">
                          <div className="company-avatar">
                            {application.company_name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <strong>{application.company_name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="job-title">
                          {application.job_title}
                        </strong>
                      </td>
                      <td>{application.location || "—"}</td>
                      <td>{application.salary || "—"}</td>
                      <td>{application.application_date || "—"}</td>
                      <td>
                        <span className="status-badge status-offer">
                          Offer
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() => handleViewDetails(application)}
                          title="View offer application"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =========================================
            APPLICATION SUCCESS FUNNEL
            ========================================= */}
        <section className="analytics-section">
          <div className="analytics-header">
            <div>
              <h2>🚀 Application Success Funnel</h2>
              <p>See how your current applications are distributed across the hiring pipeline</p>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Applied → Interview → Offer</h3>

              {funnelSteps.map((step) => (
                <div className="chart-row" key={step.label}>
                  <div className="chart-label">
                    <span>
                      {step.icon} {step.label}
                    </span>
                    <strong>{step.count}</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-bar ${step.className}`}
                      style={{
                        width: `${
                          stats.total > 0
                            ? (step.count / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-card">
              <h3>Pipeline Summary</h3>

              <div className="metric-item">
                <div className="metric-icon">📨</div>
                <div className="metric-content">
                  <span>Currently Applied</span>
                  <strong>{stats.applied}</strong>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-icon">🎯</div>
                <div className="metric-content">
                  <span>In Interview Stage</span>
                  <strong>{stats.interviews}</strong>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-icon">🎉</div>
                <div className="metric-content">
                  <span>Offers Received</span>
                  <strong>{stats.offers}</strong>
                </div>
              </div>

              <div className="metric-summary">
                <span>Total Tracked</span>
                <strong>{stats.total}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section className="panel form-panel">

          <div className="panel-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Application"
                  : "Add New Application"}
              </h2>

              <p>
                {editingId
                  ? "Update your application details"
                  : "Keep track of every job you apply for"}
              </p>
            </div>

            {editingId && (
              <button
                className="cancel-button"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* COMPANY NAME */}
              <div className="field">

                <label>
                  Company Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="e.g. TCS"
                  required
                />

              </div>

              {/* JOB TITLE */}
              <div className="field">

                <label>
                  Job Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="job_title"
                  value={form.job_title}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  required
                />

              </div>

              {/* JOB URL */}
              <div className="field">

                <label>Job URL</label>

                <input
                  type="url"
                  name="job_url"
                  value={form.job_url}
                  onChange={handleChange}
                  placeholder="https://company.com/careers"
                />

              </div>

              {/* LOCATION */}
              <div className="field">

                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                />

              </div>

              {/* SALARY */}
              <div className="field">

                <label>Salary</label>

                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. 8 LPA"
                />

              </div>

              {/* APPLICATION DATE */}
              <div className="field">

                <label>Application Date</label>

                <input
                  type="date"
                  name="application_date"
                  value={form.application_date}
                  onChange={handleChange}
                />

              </div>

              {/* STATUS */}
              <div className="field">

                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

              </div>

              {/* NOTES */}
              <div className="field full-width">

                <label>Notes</label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add notes about the application..."
                  rows="4"
                />

              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Application"
                  : "+ Add Application"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* APPLICATION LIST */}
        <section className="panel applications-panel">

          <div className="panel-header applications-header">

            <div>

              <h2>Your Applications</h2>

              <p>
                {filteredApplications.length} application
                {filteredApplications.length !== 1 ? "s" : ""}
                {" "}shown
              </p>

            </div>

          </div>

          {/* SEARCH / FILTER / SORT */}
          <div className="filters">

            <div className="search-box">

              <span>🔎</span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search company, job title or location..."
              />

            </div>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="All">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}

            </select>

            {/* SORT */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >

              <option value="newest">Newest First</option>

              <option value="oldest">Oldest First</option>

              <option value="company-asc">
                Company A–Z
              </option>

              <option value="company-desc">
                Company Z–A
              </option>

              <option value="status">
                Status
              </option>

            </select>

          </div>

          {/* LOADING */}
          {loading ? (

            <div className="empty-state">

              <div className="spinner"></div>

              <p>Loading applications...</p>

            </div>

          ) : filteredApplications.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">📭</div>

              <h3>No applications found</h3>

              <p>
                Add your first job application using the form above.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredApplications.map((application) => (

                    <tr key={application.id}>

                      {/* COMPANY */}
                      <td>

                        <div className="company-cell">

                          <div className="company-avatar">

                            {application.company_name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}

                          </div>

                          <div>

                            <strong>
                              {application.company_name}
                            </strong>

                            {application.job_url && (
                              <a
                                href={application.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="job-link"
                              >
                                View Job ↗
                              </a>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* POSITION */}
                      <td>

                        <strong className="job-title">
                          {application.job_title}
                        </strong>

                      </td>

                      {/* LOCATION */}
                      <td>
                        {application.location || "—"}
                      </td>

                      {/* SALARY */}
                      <td>
                        {application.salary || "—"}
                      </td>

                      {/* DATE */}
                      <td>
                        {application.application_date || "—"}
                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="action-buttons">

                          <button
                            className="view-button"
                            onClick={() =>
                              handleViewDetails(application)
                            }
                            title="View application details"
                          >
                            👁️
                          </button>

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(application)
                            }
                            title="Edit application"
                          >
                            ✏️
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(application.id)
                            }
                            title="Delete application"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* FOOTER */}
        <footer>

          <p>
            Job Application Tracker • FastAPI + PostgreSQL + React
          </p>

          <p>
            {stats.total} application
            {stats.total !== 1 ? "s" : ""} tracked
          </p>

        </footer>

      </main>

      {/* APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div
          className="details-overlay"
          onClick={closeDetails}
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(15, 23, 42, 0.65)",
            overflowY: "auto",
          }}
        >
          <div
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            style={{
              width: "100%",
              maxWidth: "720px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="details-header">
              <div>
                <div className="details-company">
                  {selectedApplication.company_name || "Company"}
                </div>
                <h2 id="details-title">
                  {selectedApplication.job_title || "Job Application"}
                </h2>
              </div>

              <button
                className="details-close"
                onClick={closeDetails}
                title="Close details"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="details-body">
              <div className="details-status-row">
                <span className="details-label">Status</span>
                <span
                  className={`status-badge ${getStatusClass(
                    selectedApplication.status
                  )}`}
                >
                  {selectedApplication.status || "—"}
                </span>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="details-label">📍 Location</span>
                  <strong>{selectedApplication.location || "Not specified"}</strong>
                </div>

                <div className="detail-item">
                  <span className="details-label">💰 Salary</span>
                  <strong>{selectedApplication.salary || "Not specified"}</strong>
                </div>

                <div className="detail-item">
                  <span className="details-label">📅 Application Date</span>
                  <strong>{selectedApplication.application_date || "Not specified"}</strong>
                </div>

                <div className="detail-item">
                  <span className="details-label">🆔 Application ID</span>
                  <strong>#{selectedApplication.id}</strong>
                </div>
              </div>

              <div className="details-notes">
                <span className="details-label">📝 Notes</span>
                <p>
                  {selectedApplication.notes?.trim()
                    ? selectedApplication.notes
                    : "No notes added for this application."}
                </p>
              </div>
            </div>

            <div className="details-footer">
              {selectedApplication.job_url ? (
                <a
                  href={selectedApplication.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="job-link-button"
                >
                  🔗 View Job Posting ↗
                </a>
              ) : (
                <span className="no-job-link">No job URL provided</span>
              )}

              <div className="details-actions">
                <button
                  className="secondary-button"
                  onClick={closeDetails}
                >
                  Close
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    closeDetails();
                    handleEdit(selectedApplication);
                  }}
                >
                  ✏️ Edit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;