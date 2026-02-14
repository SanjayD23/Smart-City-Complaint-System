// Check authentication
const user = checkAuth();
if (user) {
    document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
}

let departments = [];
let currentComplaintId = null;

// Load departments
async function loadDepartments() {
    try {
        const response = await departmentsAPI.getAll();
        departments = response.departments;

        const select = document.getElementById('assign-department');
        select.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Load officers when department is selected
document.getElementById('assign-department').addEventListener('change', async (e) => {
    const departmentId = e.target.value;
    const officerSelect = document.getElementById('assign-officer');

    if (!departmentId) {
        officerSelect.innerHTML = '<option value="">Select Officer</option>';
        return;
    }

    try {
        const response = await departmentsAPI.getOfficers(departmentId);
        officerSelect.innerHTML = '<option value="">Select Officer (Optional)</option>';
        response.officers.forEach(officer => {
            officerSelect.innerHTML += `<option value="${officer.id}">${officer.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading officers:', error);
    }
});

// Load complaints and update statistics
async function loadComplaints() {
    const container = document.getElementById('complaints-list');

    try {
        const response = await complaintsAPI.getAll();
        const complaints = response.complaints;

        // Update statistics
        document.getElementById('total-complaints').textContent = complaints.length;
        document.getElementById('pending-complaints').textContent =
            complaints.filter(c => c.status === 'pending').length;
        document.getElementById('resolved-complaints').textContent =
            complaints.filter(c => c.status === 'resolved').length;

        if (complaints.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No complaints in the system yet.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Citizen</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>Officer</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${complaints.map(complaint => `
                        <tr>
                            <td>#${complaint.id}</td>
                            <td>${complaint.title}</td>
                            <td>${complaint.citizen_name}</td>
                            <td>${getStatusBadge(complaint.status)}</td>
                            <td>${complaint.department_name || 'Not Assigned'}</td>
                            <td>${complaint.officer_name || 'Not Assigned'}</td>
                            <td>${formatDate(complaint.created_at)}</td>
                            <td>
                                ${complaint.status === 'pending' ?
                `<button onclick="openAssignModal(${complaint.id})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                        Assign
                                    </button>` :
                `<button onclick="viewComplaint(${complaint.id})" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                        View
                                    </button>`
            }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<p style="color: var(--danger);">Error loading complaints: ${error.message}</p>`;
    }
}

function openAssignModal(complaintId) {
    currentComplaintId = complaintId;
    document.getElementById('assign-complaint-id').value = complaintId;
    document.getElementById('assign-modal').classList.remove('hidden');
    document.getElementById('assign-modal').style.display = 'flex';
}

function closeAssignModal() {
    document.getElementById('assign-modal').classList.add('hidden');
    document.getElementById('assign-modal').style.display = 'none';
    document.getElementById('assign-form').reset();
    currentComplaintId = null;
}

function viewComplaint(id) {
    alert(`View complaint #${id} - This feature can be enhanced with a detailed modal`);
}

// Handle assignment form submission
document.getElementById('assign-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const departmentId = document.getElementById('assign-department').value;
    const officerId = document.getElementById('assign-officer').value || null;

    try {
        await complaintsAPI.assign(currentComplaintId, {
            departmentId: parseInt(departmentId),
            officerId: officerId ? parseInt(officerId) : null
        });

        showAlert('Complaint assigned successfully! Email notifications sent.', 'success');
        closeAssignModal();
        loadComplaints();
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// Initialize
loadDepartments();
loadComplaints();
