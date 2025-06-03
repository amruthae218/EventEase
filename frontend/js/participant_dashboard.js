document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  const welcomeMsg = document.getElementById("welcomeMsg");
  const browseBtn = document.getElementById("browseBtn");
  const myEventsBtn = document.getElementById("myEventsBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const browseEventsSection = document.getElementById("browseEventsSection");
  const myEventsSection = document.getElementById("myEventsSection");

  const browseEventsList = document.getElementById("browseEventsList");
  const myEventsList = document.getElementById("myEventsList");

  // Get user info for welcome message
  fetch("http://127.0.0.1:8000/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      welcomeMsg.textContent = `Welcome, ${data.full_name}!`;
    });

  browseBtn.addEventListener("click", () => {
    myEventsSection.classList.add("hidden");
    browseEventsSection.classList.remove("hidden");
    fetch("http://127.0.0.1:8000/events/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((events) => {
        browseEventsList.innerHTML = "";
        if (events.length === 0) {
          browseEventsList.innerHTML = "<p>No events available.</p>";
          return;
        }
        events.forEach((event) => {
          const div = document.createElement("div");
          div.className = "p-4 border rounded shadow";
          div.innerHTML = `
            <h4 class="text-lg font-bold">${event.name}</h4>
            <p>${event.description || "No description."}</p>
            <p><strong>Date & Time:</strong> ${new Date(event.date_time).toLocaleString()}</p>
            <p><strong>Auditorium:</strong> ${event.auditorium}</p>
            <p><strong>Price:</strong> ₹${event.price}</p>
            <p><strong>Max Accommodation:</strong> ${event.max_accommodation}</p>
            <button class="registerBtn bg-blue-500 text-white px-3 py-1 mt-2 rounded hover:bg-blue-600" data-event-id="${event.id}">Register</button>
          `;
          browseEventsList.appendChild(div);
        });

        // Attach listeners to new buttons
        document.querySelectorAll(".registerBtn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const eventId = btn.getAttribute("data-event-id");
            fetch(`http://127.0.0.1:8000/events/${eventId}/register/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => res.json())
              .then((data) => {
                alert("Registration successful!");
              })
              .catch((err) => {
                alert("Already registered or event is full.");
              });
          });
        });
      });
  });

  myEventsBtn.addEventListener("click", () => {
  browseEventsSection.classList.add("hidden");
  myEventsSection.classList.remove("hidden");

  fetch("http://127.0.0.1:8000/registrations/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(async (registrations) => {
      myEventsList.innerHTML = "";
      if (registrations.length === 0) {
        myEventsList.innerHTML = "<p>You haven’t registered for any events.</p>";
        return;
      }

      // Fetch details for each event
      for (const reg of registrations) {
        try {
          const eventRes = await fetch(`http://127.0.0.1:8000/events/${reg.event_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const event = await eventRes.json();

          const div = document.createElement("div");
          div.className = "p-4 border rounded shadow mb-4";
          div.innerHTML = `
            <h4 class="text-lg font-bold">${event.name}</h4>
            <p><strong>Club/Auditorium:</strong> ${event.auditorium}</p>
            <p><strong>Date & Time:</strong> ${new Date(event.date_time).toLocaleString()}</p>
            <p><strong>Registration Date:</strong> ${new Date(reg.registration_date).toLocaleString()}</p>
          `;
          myEventsList.appendChild(div);
        } catch (error) {
          console.error("Failed to load event details for event ID:", reg.event_id);
        }
      }
    });
});


  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    alert("Logged out successfully!");
    window.location.href = "index.html";
  });
});
