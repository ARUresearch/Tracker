// ======================
// Database Configuration
// ======================
const DB_KEYS = {
  EMPLOYEES: "aru_employees_data",
  PROJECTS: "aru_projects_data",
  ADMIN_PASSWORD: "aru_admin_password"
};

// Initialize data from localStorage
function initializeData() {
  return {
    employees: JSON.parse(localStorage.getItem(DB_KEYS.EMPLOYEES)) || [],
    projects: JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS)) || [],
    adminPassword: localStorage.getItem(DB_KEYS.ADMIN_PASSWORD) || "Admin1234"
  };
}

// Save data to localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let { employees, projects, adminPassword } = initializeData();
let loggedInUser = null;

// =================
// Salary Calculation
// =================
const slabRates = { A: 100, B: 80, C: 60 };

function calculateSalarySlab(tasksCompleted) {
  if (tasksCompleted >= 20) return "A";
  if (tasksCompleted >= 15) return "B";
  return "C";
}

// ================
// UI Functions
// ================
function showPortal(portalId) {
  document.querySelectorAll(".portal").forEach(p => p.classList.remove("active"));
  document.getElementById(portalId).classList.add("active");
  hideAllMessages();
}

function hideAllMessages() {
  document.querySelectorAll(".status-message, .error-message").forEach(msg => {
    msg.style.display = "none";
  });
}

function showStatusMessage(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = "block";
  setTimeout(() => element.style.display = "none", 5000);
}

function showErrorMessage(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = "block";
  setTimeout(() => element.style.display = "none", 5000);
}

// =====================
// Employee Functions
// =====================
function markWorkStart() {
  const selectedName = document.getElementById("employeeName").value;
  const confirmName = document.getElementById("confirmName").value;

  if (selectedName !== confirmName) {
    showErrorMessage("taskErrorMessage", "Employee name does not match. Please confirm your name.");
    return;
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const employeeIndex = employees.findIndex(emp => emp.name === selectedName && emp.date === today);

  if (employeeIndex === -1) {
    employees.push({
      name: selectedName,
      date: today,
      workStart: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workEnd: null,
      tasksCompleted: 0,
      dailyEarnings: 0,
      incentives: 0,
      advances: 0
    });
    saveData(DB_KEYS.EMPLOYEES, employees);
    showStatusMessage("taskStatusMessage", "Work started successfully!");
  } else {
    if (employees[employeeIndex].workStart) {
      showErrorMessage("taskErrorMessage", "You have already marked work start today.");
    } else {
      employees[employeeIndex].workStart = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      saveData(DB_KEYS.EMPLOYEES, employees);
      showStatusMessage("taskStatusMessage", "Work started successfully!");
    }
  }
}

function markWorkEnd() {
  const selectedName = document.getElementById("employeeName").value;
  const confirmName = document.getElementById("confirmName").value;

  if (selectedName !== confirmName) {
    showErrorMessage("taskErrorMessage", "Employee name does not match. Please confirm your name.");
    return;
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const employeeIndex = employees.findIndex(emp => emp.name === selectedName && emp.date === today);

  if (employeeIndex === -1) {
    showErrorMessage("taskErrorMessage", "Please mark work start first.");
    return;
  }

  if (employees[employeeIndex].workEnd) {
    showErrorMessage("taskErrorMessage", "You have already marked work end today.");
    return;
  }

  employees[employeeIndex].workEnd = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById("taskForm").classList.remove("disabled");
  saveData(DB_KEYS.EMPLOYEES, employees);
  showStatusMessage("taskStatusMessage", "Work ended successfully! You can now enter tasks.");
}

// ====================
// Salary Dashboard
// ====================
function updateDashboardStats(filteredEmployees) {
  const totalEmployees = new Set(filteredEmployees.map(emp => emp.name)).size;
  const totalSalary = filteredEmployees.reduce((sum, emp) => {
    return sum + ((emp.dailyEarnings || 0) + (emp.incentives || 0) - (emp.advances || 0));
  }, 0);
  const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

  document.getElementById('totalEmployees').textContent = totalEmployees;
  document.getElementById('totalSalary').textContent = `₹${totalSalary.toFixed(2)}`;
  document.getElementById('averageSalary').textContent = `₹${averageSalary.toFixed(2)}`;
}

function loadSalaryDashboard() {
  const salaryTableBody = document.querySelector("#salaryTable");
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const dateFilter = document.getElementById('dateFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  let filteredEmployees = [...employees];
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Apply date filter
  if (dateFilter === 'today') {
    filteredEmployees = filteredEmployees.filter(emp => emp.date === today);
  } else if (dateFilter === 'month') {
    filteredEmployees = filteredEmployees.filter(emp => {
      const empDate = new Date(emp.date);
      return empDate.getMonth() + 1 === currentMonth && empDate.getFullYear() === currentYear;
    });
  }

  // Apply search filter
  if (searchInput) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchInput)
    );
  }

  // Apply sorting
  filteredEmployees.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'salary':
        const salaryA = (a.dailyEarnings || 0) + (a.incentives || 0) - (a.advances || 0);
        const salaryB = (b.dailyEarnings || 0) + (b.incentives || 0) - (b.advances || 0);
        return salaryB - salaryA;
      default: // date
        return new Date(b.date) - new Date(a.date);
    }
  });

  // Update dashboard statistics
  updateDashboardStats(filteredEmployees);

  // Render table
  salaryTableBody.innerHTML = filteredEmployees.length === 0 
    ? `<tr><td colspan="9" style="text-align: center;">No records found</td></tr>`
    : filteredEmployees.map(employee => {
        const totalSalary = (employee.dailyEarnings || 0) + (employee.incentives || 0) - (employee.advances || 0);
        return `
          <tr>
            <td>${employee.name}</td>
            <td>${employee.date}</td>
            <td>${employee.workStart || "-"}</td>
            <td>${employee.workEnd || "-"}</td>
            <td>${employee.tasksCompleted || "-"}</td>
            <td>${employee.dailyEarnings ? "₹" + employee.dailyEarnings : "-"}</td>
            <td>${employee.incentives ? "₹" + employee.incentives : "-"}</td>
            <td>${employee.advances ? "₹" + employee.advances : "-"}</td>
            <td>${totalSalary ? "₹" + totalSalary.toFixed(2) : "-"}</td>
          </tr>
        `;
      }).join('');
}

// Add event listeners for filters
document.getElementById('searchInput').addEventListener('input', loadSalaryDashboard);
document.getElementById('dateFilter').addEventListener('change', loadSalaryDashboard);
document.getElementById('sortBy').addEventListener('change', loadSalaryDashboard);

// Initial load
loadSalaryDashboard();

// =================
// Project List
// =================
function loadProjectList() {
  const projectTableBody = document.querySelector("#projectTable tbody");
  projectTableBody.innerHTML = "";

  if (projects.length === 0) {
    projectTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No projects found</td></tr>`;
    return;
  }

  projects.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

  projects.forEach(project => {
    const progress = Math.round((project.sampleAchieved / project.sampleSize) * 100);
    const progressBar = `<progress value="${progress}" max="100"></progress> ${progress}%`;
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${project.name}</td>
      <td>${project.startDate}</td>
      <td>${project.endDate}</td>
      <td>${project.sampleSize}</td>
      <td>${project.sampleAchieved}</td>
      <td>${progressBar}</td>
    `;
    projectTableBody.appendChild(row);
  });
}

// ================
// Admin Functions
// ================
function adminLogin() {
  const password = document.getElementById("adminPassword").value;
  if (password === adminPassword) {
    loggedInUser = { type: "admin" };
    document.getElementById("adminLoginSection").style.display = "none";
    document.getElementById("adminControls").classList.add("active");
    document.getElementById("adminPassword").value = "";
    showStatusMessage("adminStatusMessage", "Admin login successful!");
  } else {
    showErrorMessage("adminErrorMessage", "Invalid admin password.");
  }
}

function adminLogout() {
  loggedInUser = null;
  document.getElementById("adminControls").classList.remove("active");
  document.getElementById("adminLoginSection").style.display = "block";
  showPortal('adminLoginSection');
}

// ======================
// Event Listeners
// ======================
document.addEventListener("DOMContentLoaded", function() {
  // Task Form Submission
  document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const selectedName = document.getElementById("employeeName").value;
    const tasksCompleted = parseInt(document.getElementById("tasksCompleted").value);
    const today = new Date().toISOString().split("T")[0];

    const employeeIndex = employees.findIndex(emp => emp.name === selectedName && emp.date === today);
    if (employeeIndex !== -1) {
      if (employees[employeeIndex].tasksCompleted > 0) {
        showErrorMessage("taskErrorMessage", "You have already updated tasks today.");
        return;
      }

      employees[employeeIndex].tasksCompleted = tasksCompleted;
      const slab = calculateSalarySlab(tasksCompleted);
      employees[employeeIndex].dailyEarnings = tasksCompleted * slabRates[slab];
      
      saveData(DB_KEYS.EMPLOYEES, employees);
      document.getElementById("taskForm").reset();
      document.getElementById("taskForm").classList.add("disabled");
      showStatusMessage("taskStatusMessage", "Tasks Updated Successfully!");
      
      if (document.getElementById("salaryDashboard").classList.contains("active")) {
        loadSalaryDashboard();
      }
    } else {
      showErrorMessage("taskErrorMessage", "No attendance record found for today.");
    }
  });

  // Initialize the app
  loadProjectList();
  loadSalaryDashboard();
  showPortal('taskUpdate');
});