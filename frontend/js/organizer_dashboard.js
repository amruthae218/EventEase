document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:8000";
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Not authenticated. Please login.");
    window.location.href = "index.html";
    return;
  }

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "index.html";
  });

  const createForm = document.getElementById("createEventForm");
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let rawDateTime = document.getElementById("date_time").value;
    if (!rawDateTime) {
      alert("Please select a valid date and time.");
      return;
    }
    if (rawDateTime.length === 16) {
      rawDateTime += ":00";
    }
    const dateObj = new Date(rawDateTime);
    if (dateObj.toString() === "Invalid Date") {
      alert("Invalid date/time format.");
      return;
    }
    const isoDateTime = dateObj.toISOString();

    const eventData = {
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
      date_time: isoDateTime,
      auditorium: document.getElementById("auditorium").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      max_accommodation: parseInt(document.getElementById("max_accommodation").value),
      club_name: document.getElementById("club").value.trim(),
    };

    if (!eventData.name || !eventData.date_time || !eventData.auditorium || isNaN(eventData.price) || isNaN(eventData.max_accommodation) || !eventData.club_name) {
      alert("Please fill all required fields correctly.");
      return;
    }
    if (eventData.price < 0 || eventData.max_accommodation <= 0) {
      alert("Price and accommodation must be positive values.");
      return;
    }

    createForm.querySelector("button[type='submit']").disabled = true;

    try {
      const res = await fetch(`${API_BASE}/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        window.location.href = "index.html";
        return;
      }

      if (!res.ok) {
        const error = await res.json();
        alert("Failed to create event: " + (error.detail || "Unknown error"));
      } else {
        alert("Event created successfully!");
        createForm.reset();
        fetchUpcomingEvents();
        fetchPastEvents();
      }
    } catch (err) {
      alert("Error creating event: " + err.message);
    } finally {
      createForm.querySelector("button[type='submit']").disabled = false;
    }
  });

  async function fetchUpcomingEvents() {
    try {
      const res = await fetch(`${API_BASE}/events/organized/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        window.location.href = "index.html";
        return;
      }
      if (!res.ok) {
        console.error("Failed to fetch upcoming events");
        return;
      }
      const events = await res.json();
      const container = document.getElementById("upcomingEventsList");
      container.innerHTML = events.length === 0 ? "<p>No upcoming events.</p>" : events.map(eventCard).join("");
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    }
  }

  async function fetchPastEvents() {
    try {
      const res = await fetch(`${API_BASE}/events/organized/past`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        window.location.href = "index.html";
        return;
      }
      if (!res.ok) {
        console.error("Failed to fetch past events");
        return;
      }
      const events = await res.json();
      const container = document.getElementById("pastEventsList");
      container.innerHTML = events.length === 0 ? "<p>No past events.</p>" : events.map(eventCard).join("");
    } catch (err) {
      console.error("Error fetching past events:", err);
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function eventCard(event) {
    return `
      <div class="border p-4 rounded shadow bg-gray-50 mb-4">
        <h3 class="font-semibold text-lg">${escapeHtml(event.name)}</h3>
        <p><strong>Club / Faculty:</strong> ${escapeHtml(event.club_name || "N/A")}</p>
        <p><strong>Auditorium:</strong> ${escapeHtml(event.auditorium)}</p>
        <p><strong>Date & Time:</strong> ${new Date(event.date_time).toLocaleString()}</p>
        <p><strong>Price:</strong> ₹${event.price.toFixed(2)}</p>
        <p><strong>Max Accommodation:</strong> ${event.max_accommodation}</p>
        <p><strong>Total Participants:</strong> ${event.total_participants ?? 0}</p>
        <p><strong>Description:</strong> ${escapeHtml(event.description || "-")}</p>
      </div>
    `;
  }

  fetchUpcomingEvents();
  fetchPastEvents();
});
