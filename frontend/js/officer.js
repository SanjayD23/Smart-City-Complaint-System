// Check authentication
const user = checkAuth();
if (user) {
    document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
}

let currentComplaintId = null;

// Load complaints and update statistics
async function loadComplaints() {
    const container = document.getElementById('complaints-list');

    try {
        const response = await complaintsAPI.getAll();
        const complaints = response.complaints;

        // Update statistics
        document.getElementById('assigned-complaints').textContent = complaints.length;
        document.getElementById('in-progress-complaints').textContent =
            complaints.filter(c => c.status === 'in_progress').length;
        document.getElementById('resolved-complaints').textContent =
            complaints.filter(c => c.status === 'resolved').length;

        if (complaints.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No complaints assigned to you yet.</p>';
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
                            <td>${complaint.department_name || 'N/A'}</td>
                            <td>${formatDate(complaint.created_at)}</td>
                            <td>
                                <button onclick="openUpdateModal(${complaint.id})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                    Update Status
                                </button>
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

function openUpdateModal(complaintId) {
    currentComplaintId = complaintId;
    document.getElementById('update-complaint-id').value = complaintId;
    document.getElementById('update-modal').classList.remove('hidden');
    document.getElementById('update-modal').style.display = 'flex';
}

function closeUpdateModal() {
    document.getElementById('update-modal').classList.add('hidden');
    document.getElementById('update-modal').style.display = 'none';
    document.getElementById('update-form').reset();
    currentComplaintId = null;
}

// Handle status update form submission
document.getElementById('update-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('update-status').value;
    const comment = document.getElementById('update-comment').value;

    try {
        await complaintsAPI.updateStatus(currentComplaintId, {
            status,
            comment: comment || null
        });

        showAlert('Complaint status updated successfully! Citizen notified via email.', 'success');
        closeUpdateModal();
        loadComplaints();
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// Initialize
loadComplaints();
