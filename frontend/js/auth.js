// Login functionality
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await authAPI.login({ email, password });

            // Save auth data
            saveAuth(response.token, response.user);

            // Redirect based on role
            const dashboards = {
                'citizen': 'citizen-dashboard.html',
                'admin': 'admin-dashboard.html',
                'officer': 'officer-dashboard.html'
            };

            window.location.href = dashboards[response.user.role] || 'index.html';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

// Register functionality
if (document.getElementById('register-form')) {
    const roleSelect = document.getElementById('role');
    const departmentGroup = document.getElementById('department-group');
    const departmentSelect = document.getElementById('department');

    // Load departments
    async function loadDepartments() {
        try {
            const response = await departmentsAPI.getAll();
            departmentSelect.innerHTML = '<option value="">Select Department</option>';
            response.departments.forEach(dept => {
                departmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    // Show department field for officers
    roleSelect.addEventListener('change', (e) => {
        if (e.target.value === 'officer') {
            departmentGroup.classList.remove('hidden');
            departmentSelect.required = true;
            loadDepartments();
        } else {
            departmentGroup.classList.add('hidden');
            departmentSelect.required = false;
        }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const departmentId = document.getElementById('department').value || null;

        try {
            const response = await authAPI.register({
                name,
                email,
                password,
                role,
                departmentId
            });

            // Save auth data
            saveAuth(response.token, response.user);

            // Redirect based on role
            const dashboards = {
                'citizen': 'citizen-dashboard.html',
                'admin': 'admin-dashboard.html',
                'officer': 'officer-dashboard.html'
            };

            window.location.href = dashboards[response.user.role] || 'index.html';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}
