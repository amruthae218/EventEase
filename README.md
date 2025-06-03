
# EventEase ⌘

A modern event management platform that streamlines the creation and registration process for guest lectures, workshops, and other academic events. Designed for educational institutions, **EventEase** allows clubs and faculty organizers to manage events, while students can seamlessly browse and register — all through a clean and secure system.

---

## 🎯 Project Overview

EventEase enables:

* Token-based authentication for organizers and participants
* Real-time event management with access control
* Participant registration with validation and duplicate prevention
* Secure and performant API powered by **FastAPI**
* Lightweight, minimal frontend served over HTTP

---

## 🏗️ Architecture

### Backend (FastAPI)

* Framework: **FastAPI**
* ORM: **SQLAlchemy** + **SQLite**
* Auth: **JWT tokens** (separate for participants & organizers)
* Server: **Uvicorn**
* Structure: Modular code (`main.py`, `models.py`, `schemas.py`, `auth.py`, `database.py`)

### Frontend (Static HTML + Tailwind CSS)

* Stack: **HTML**, **Tailwind CSS**, **Vanilla JavaScript**
* Hosting: **Python SimpleHTTPServer**
* Responsive layout with clean, accessible UI

---

## 📁 Project Structure

```
EventEase/
├── backend/             # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── database.py
│
├── frontend/            # Static frontend
│   ├── index.html
│   ├── script.js
│   └── ... (CSS / HTML files)
│
├── event_manager.db     # SQLite DB
├── requirements.txt     # Backend dependencies
├── README.md
```

---

## 🚀 How to Run the Project

### Backend (FastAPI)

1. Clone the repository:

```
git clone https://github.com/amruthae218/EventEase.git
cd EventEase
```

2. Activate the virtual environment:

```
source myenv/bin/activate
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Start the FastAPI backend:

```
uvicorn backend.main:app --reload
```

---

### Frontend (Static HTML Server)

1. Open a new terminal window/tab.

2. Navigate to the frontend folder:

```
cd EventEase/frontend
```

3. Start a simple HTTP server:

```
python3 -m http.server 8001
```

4. Open in browser:
   [http://localhost:8001](http://localhost:8001)

---

## ✨ Features

* **JWT-based authentication** for secure login/signup (separate flows for organizers and participants)
* **Full CRUD functionality** for event management
* **Real-time event validation**: participants can register only for future events
* **Duplicate protection**: prevents multiple registrations for the same event
* Organizers can manage only their events (ownership-based access control)
* Built with **FastAPI** and **SQLAlchemy** for high-performance backend operations
* Minimal and responsive **Tailwind CSS** frontend served over a lightweight HTTP server
* Clean API structure designed for easy testing, debugging, and future integration with frontend frameworks

---

## Testing Scenarios

1. Start backend and frontend servers
2. Login/signup as an organizer or participant
3. Create or browse events
4. Attempt registering for the same event twice (blocked)
5. Try registering for past events (blocked)

---

## 🛠️ Tech Stack

* Backend: FastAPI, SQLite, SQLAlchemy
* Frontend: HTML, Tailwind CSS, JavaScript
* Server: Uvicorn + Python HTTP Server
* Auth: JWT



