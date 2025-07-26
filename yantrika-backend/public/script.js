// script.js

// Sample projectData (if used elsewhere)
const projectData = [
  {
    id: "autonomous-robot",
    title: "Autonomous Navigation Robot",
    description:
      "Advanced AI-powered robot with SLAM capabilities, computer vision, and real-time path planning for complex environments. This project focuses on developing robust navigation algorithms for unstructured environments, utilizing deep learning for object recognition and path optimization. It has been successfully tested in various indoor and outdoor scenarios.",
    images: [
      "/placeholder.svg?height=400&width=600&text=Autonomous+Robot+1",
      "/placeholder.svg?height=400&width=600&text=Autonomous+Robot+2",
      "/placeholder.svg?height=400&width=600&text=Autonomous+Robot+3",
    ],
  },
  // … other projects …
];

// ====== API BASE URL CONFIGURATION ======
// Set your Render backend URL here:
const RENDER_BACKEND_URL = "https://yantrika-rh7d.onrender.com"; // <-- ACTUAL Render backend URL

// Always use Render backend for API calls
const API_BASE_URL = RENDER_BACKEND_URL;
// ====== END API BASE URL CONFIGURATION ======

// Modal helpers
function openProjectDetailsModal(projectId) {
  const modal = document.getElementById("projectDetailsModal");
  const project = projectData.find((p) => p.id === projectId);

  if (modal && project) {
    document.getElementById("projectDetailsTitle").textContent = project.title;
    document.getElementById("projectDetailsDescription").textContent = project.description;
    const imagesContainer = document.getElementById("projectDetailsImages");
    imagesContainer.innerHTML = "";
    project.images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = project.title;
      imagesContainer.appendChild(img);
    });
    modal.style.display = "flex";
  }
}

function closeProjectDetailsModal() {
  document.getElementById("projectDetailsModal").style.display = "none";
}

function openVideoModal() {
  document.getElementById("videoModal").style.display = "flex";
}

function closeVideoModal() {
  document.getElementById("videoModal").style.display = "none";
}

function openGalleryModal() {
  const modal = document.getElementById("galleryModal");
  if (modal) modal.style.display = "flex";
}

function closeGalleryModal() {
  const modal = document.getElementById("galleryModal");
  if (modal) modal.style.display = "none";
}

function previousImage() {
  console.log("Previous image");
}

function nextImage() {
  console.log("Next image");
}

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Navbar background on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  navbar.style.background = window.scrollY > 100
    ? "rgba(10, 10, 15, 0.98)"
    : "rgba(10, 10, 15, 0.95)";
});

// Form submission handler
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // collect form data
      const data = {};
      new FormData(form).forEach((val, key) => {
        data[key] = val;
      });

      // determine endpoint
      const url = form.dataset.endpoint;
      if (!url) {
        alert("Form endpoint not configured.");
        return;
      }

      // disable button and set loading text
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = form.id === "membershipForm"
        ? "Submitting…"
        : "Sending…";

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const json = await res.json();

        // success feedback
        alert(json.message || "Submitted successfully!");
        form.reset();
      } catch (err) {
        console.error(err);
        alert("Oops—something went wrong. Please try again.");
      } finally {
        // restore button
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
});

// Gallery filter logic
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.getAttribute("data-filter");
      galleryItems.forEach((item) => {
        item.style.display =
          filter === "all" || item.getAttribute("data-category") === filter
            ? "block"
            : "none";
      });
    });
  });
});

// Scroll animations
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(
    ".service-card, .portfolio-item, .testimonial-card, .blog-card, .team-card, .event-card, .gallery-item, .project-folder-card"
  ).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // Project cards click
  document.querySelectorAll(".project-folder-card").forEach((card) => {
    card.addEventListener("click", () =>
      openProjectDetailsModal(card.dataset.projectId)
    );
  });
});

// Page‑specific logic
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking current page...");
  console.log("Current pathname:", window.location.pathname);
  
  // TEAM page logic
  if (window.location.pathname.endsWith("team.html") || window.location.pathname === "/team.html") {
    console.log("Loading team page...");
    loadTeamMembers();
  }

  // MEMBERS page logic
  if (window.location.pathname.endsWith("members.html")) {
    console.log("Loading members page...");
    loadAllMembers();
  }

  // EVENTS page logic
  if (window.location.pathname.endsWith("events.html")) {
    console.log("Loading events page...");
    loadUpcomingEvents();
    loadPastEvents();
  }

  // Dynamically set contact form endpoint
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.dataset.endpoint = `${API_BASE_URL}/api/contact`;
  }
});

// Load team members for team.html page - ONLY REAL DATA FROM BACKEND
async function loadTeamMembers() {
  console.log("loadTeamMembers function called");
  const coreTeamContainer = document.getElementById("core-team-container");
  
  if (!coreTeamContainer) {
    console.error("Core team container not found!");
    return;
  }

  try {
    // Show loading state
    coreTeamContainer.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">Loading team members...</div>';

    console.log("Fetching from:", `${API_BASE_URL}/api/team`);
    
    // Fetch team members from API
    const response = await fetch(`${API_BASE_URL}/api/team`);
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const teamMembers = await response.json();
    console.log("Team members received:", teamMembers);
    
    // Clear loading state
    coreTeamContainer.innerHTML = '';
    
    if (!teamMembers || teamMembers.length === 0) {
      coreTeamContainer.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">No team members found. Please add team members to the database.</div>';
      return;
    }

    // Create team member cards using existing CSS classes
    teamMembers.forEach((member, index) => {
      console.log(`Creating card for member ${index + 1}:`, member);
      
      const teamCard = document.createElement('div');
      teamCard.className = 'team-card hover-card';
      
      // Create image or initials placeholder
      const imageHtml = member.imageUrl 
        ? `<img src="${member.imageUrl}" alt="${member.name}" class="team-image">`
        : `<div class="team-initials">${getInitials(member.name)}</div>`;
      
      // Create social links
      let socialLinks = '';
      if (member.githubLink) {
        socialLinks += `<a href="${member.githubLink}" target="_blank"><i class="fab fa-github"></i></a>`;
      }
      if (member.linkedIn) {
        socialLinks += `<a href="${member.linkedIn}" target="_blank"><i class="fab fa-linkedin"></i></a>`;
      }
      if (member.email) {
        socialLinks += `<a href="mailto:${member.email}"><i class="fas fa-envelope"></i></a>`;
      }
      
      teamCard.innerHTML = `
        <div class="team-member-image">
          ${imageHtml}
        </div>
        <div class="team-member-info">
          <h3>${member.name}</h3>
          <p class="team-role">${member.role}</p>
          ${member.department ? `<p class="team-department">${member.department}</p>` : ''}
          ${member.branch ? `<p class="team-branch">${member.branch}</p>` : ''}
          ${member.description ? `<p class="team-description">${member.description}</p>` : ''}
          ${socialLinks ? `<div class="team-social">${socialLinks}</div>` : ''}
        </div>
      `;
      
      coreTeamContainer.appendChild(teamCard);
    });

    // Apply scroll animations to new elements
    document.querySelectorAll('.team-card').forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

    console.log("Team cards created successfully");

  } catch (error) {
    console.error('Error loading team members:', error);
    coreTeamContainer.innerHTML = `
      <div style="color:#ff6b6b;text-align:center;width:100%;padding:2rem;">
        <p>❌ Failed to load team members</p>
        <p style="font-size:0.9rem;color:#ccc;">Error: ${error.message}</p>
        <p style="font-size:0.9rem;color:#ccc;">Please check if your server is running on ${API_BASE_URL}</p>
        <p style="font-size:0.9rem;color:#ccc;">Make sure you have team members in your MongoDB database</p>
      </div>
    `;
  }
}

// Load upcoming events for events.html page - ONLY REAL DATA FROM BACKEND
async function loadUpcomingEvents() {
  console.log("loadUpcomingEvents function called");
  const upcomingGrid = document.getElementById("upcoming-events-grid");
  
  if (!upcomingGrid) {
    console.error("Upcoming events grid not found!");
    return;
  }

  try {
    // Show loading state
    upcomingGrid.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">Loading upcoming events...</div>';

    console.log("Fetching from:", `${API_BASE_URL}/api/upcoming-events`);
    
    const response = await fetch(`${API_BASE_URL}/api/upcoming-events`);
    
    console.log("Upcoming events response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const events = await response.json();
    console.log("Upcoming events received:", events);
    
    upcomingGrid.innerHTML = "";
    
    if (!events || events.length === 0) {
      upcomingGrid.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">No upcoming events found. Please add upcoming events to the database.</div>';
      return;
    }

    // Create event cards using your existing CSS classes
    events.forEach((ev) => {
      const dateObj = new Date(ev.date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = dateObj
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card upcoming';
      eventCard.innerHTML = `
        <div class="event-date">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="event-content">
          <h3>${ev.title || ""}</h3>
          <p class="event-type"><i class="fas fa-cogs"></i> ${ev.type || ""}</p>
          <p class="event-desc">${ev.description || ""}</p>
          <div class="event-details">
            <span><i class="fas fa-clock"></i> ${ev.startTime || ""} - ${ev.endTime || ""}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${ev.location || ""}</span>
          </div>
          ${
            ev.registrationLink
              ? `<a href="${ev.registrationLink}" class="btn filled" target="_blank">Register Now</a>`
              : ""
          }
        </div>
      `;
      
      upcomingGrid.appendChild(eventCard);
    });

    // Apply scroll animations to new elements
    document.querySelectorAll('.event-card').forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  } catch (error) {
    console.error("Error loading upcoming events:", error);
    upcomingGrid.innerHTML = `
      <div style="color:#ff6b6b;text-align:center;width:100%;padding:2rem;">
        <p>❌ Failed to load upcoming events</p>
        <p style="font-size:0.9rem;color:#ccc;">Error: ${error.message}</p>
        <p style="font-size:0.9rem;color:#ccc;">Please check if your server is running on ${API_BASE_URL}</p>
        <p style="font-size:0.9rem;color:#ccc;">Make sure you have upcoming events in your MongoDB database</p>
      </div>
    `;
  }
}

// Load past events for events.html page - ONLY REAL DATA FROM BACKEND
async function loadPastEvents() {
  console.log("loadPastEvents function called");
  const pastTimeline = document.getElementById("past-events-timeline");
  
  if (!pastTimeline) {
    console.error("Past events timeline not found!");
    return;
  }

  try {
    // Show loading state
    pastTimeline.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">Loading past events...</div>';

    console.log("Fetching from:", `${API_BASE_URL}/api/past-events`);
    
    const response = await fetch(`${API_BASE_URL}/api/past-events`);
    
    console.log("Past events response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const events = await response.json();
    console.log("Past events received:", events);
    
    pastTimeline.innerHTML = "";
    
    if (!events || events.length === 0) {
      pastTimeline.innerHTML = '<div style="color:#fff;text-align:center;width:100%;padding:2rem;">No past events found. Please add past events to the database.</div>';
      return;
    }

    // Create timeline items using your existing CSS classes
    events.forEach((ev) => {
      const dateObj = new Date(ev.date);
      const monthYear = dateObj.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      timelineItem.innerHTML = `
        <div class="timeline-date">${monthYear}</div>
        <div class="timeline-content">
          <h3>${ev.title || ""}</h3>
          <p>${ev.description || ""}</p>
          ${
            ev.badge
              ? `<span class="achievement-badge">${ev.badge}</span>`
              : ""
          }
        </div>
      `;
      
      pastTimeline.appendChild(timelineItem);
    });

    // Apply scroll animations to new elements
    document.querySelectorAll('.timeline-item').forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  } catch (error) {
    console.error("Error loading past events:", error);
    pastTimeline.innerHTML = `
      <div style="color:#ff6b6b;text-align:center;width:100%;padding:2rem;">
        <p>❌ Failed to load past events</p>
        <p style="font-size:0.9rem;color:#ccc;">Error: ${error.message}</p>
        <p style="font-size:0.9rem;color:#ccc;">Please check if your server is running on ${API_BASE_URL}</p>
        <p style="font-size:0.9rem;color:#ccc;">Make sure you have past events in your MongoDB database</p>
      </div>
    `;
  }
}

// Load all members for members.html page - ONLY REAL DATA FROM BACKEND
async function loadAllMembers() {
  const membersTableBody = document.getElementById("members-table-body");
  const yearTabs = document.querySelectorAll(".year-tab");
  
  if (!membersTableBody) return;

  try {
    // Show loading state
    membersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#fff;">Loading members...</td></tr>';

    // Fetch both team members and committee members
    const [teamResponse, committeeResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/team`),
      fetch(`${API_BASE_URL}/api/committee`)
    ]);
    
    if (!teamResponse.ok || !committeeResponse.ok) {
      throw new Error('Failed to fetch members data');
    }
    
    const teamMembers = await teamResponse.json();
    const committeeMembers = await committeeResponse.json();
    
    // Combine all members
    const allMembers = [
      ...teamMembers.map(member => ({
        name: member.name,
        role: member.role,
        department: member.department || 'N/A',
        year: member.year || 'N/A'
      })),
      ...committeeMembers.map(member => ({
        name: member.name,
        role: member.role,
        department: member.department || 'N/A',
        year: member.year || 'N/A'
      }))
    ];
    
    if (allMembers.length === 0) {
      membersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#fff;">No members found. Please add members to the database.</td></tr>';
      return;
    }
    
    // Store all members globally for filtering
    window.allMembersData = allMembers;
    
    // Display all members initially
    displayMembers(allMembers);
    
    // Add event listeners for year filter tabs
    yearTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        yearTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        const selectedYear = tab.getAttribute('data-year');
        
        if (selectedYear === 'all') {
          displayMembers(allMembers);
        } else {
          const filteredMembers = allMembers.filter(member => member.year === selectedYear);
          displayMembers(filteredMembers);
        }
      });
    });

  } catch (error) {
    console.error('Error loading members:', error);
    membersTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:#ff6b6b;">
          ❌ Failed to load members<br>
          <span style="font-size:0.9rem;">Error: ${error.message}</span><br>
          <span style="font-size:0.9rem;">Please check if your server is running and database has members</span>
        </td>
      </tr>
    `;
  }
}

// Helper function to display members in table
function displayMembers(members) {
  const membersTableBody = document.getElementById("members-table-body");
  
  if (!members || members.length === 0) {
    membersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#fff;">No members found for the selected filter.</td></tr>';
    return;
  }
  
  membersTableBody.innerHTML = '';
  
  members.forEach(member => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${member.name}</td>
      <td>${member.role}</td>
      <td>${member.department}</td>
      <td>${member.year}</td>
    `;
    membersTableBody.appendChild(row);
  });
}

// Utility to get initials
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

