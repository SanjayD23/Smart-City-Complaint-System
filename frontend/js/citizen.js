// Check authentication
const user = checkAuth();
if (user) {
    document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
}

// Initialize Google Maps
let map;
let marker;
let selectedLocation = null;

function initMap() {
    // Default location (you can change this)
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });

    // Add click listener to map
    map.addListener('click', (event) => {
        placeMarker(event.latLng);
    });
}

function placeMarker(location) {
    if (marker) {
        marker.setPosition(location);
    } else {
        marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }

    selectedLocation = location;
    document.getElementById('latitude').value = location.lat();
    document.getElementById('longitude').value = location.lng();
}

// Initialize map when page loads
window.addEventListener('load', initMap);

// Image preview
document.getElementById('image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('image-preview');
            preview.src = event.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Submit complaint form
document.getElementById('complaint-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat());
        formData.append('longitude', selectedLocation.lng());
    }

    try {
        await complaintsAPI.create(formData);
        showAlert('Complaint submitted successfully! You will receive an email confirmation.', 'success');

        // Reset form
        document.getElementById('complaint-form').reset();
        document.getElementById('image-preview').classList.add('hidden');
        if (marker) {
            marker.setMap(null);
            marker = null;
        }
        selectedLocation = null;

        // Reload complaints list
        loadComplaints();
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// Load complaints
async function loadComplaints() {
    const container = document.getElementById('complaints-list');

    try {
        const response = await complaintsAPI.getAll();
        const complaints = response.complaints;

        if (complaints.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No complaints yet. Submit your first complaint above!</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
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
                            <td>${getStatusBadge(complaint.status)}</td>
                            <td>${complaint.department_name || 'Not Assigned'}</td>
                            <td>${formatDate(complaint.created_at)}</td>
                            <td>
                                <button onclick="viewComplaint(${complaint.id})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                    View Details
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

function viewComplaint(id) {
    // For now, just show an alert. You can implement a modal or separate page
    alert(`View complaint #${id} - This feature can be enhanced with a modal showing full details`);
}

// Load complaints on page load
loadComplaints();
