const API_URL = 'http://localhost:8080/api/v1';
let token = localStorage.getItem('jwt_token');
let isLoginMode = true;
let currentEditingId = null;
let availableExercises = []; // Store fetched exercises
let deleteTargetId = null; // Store ID for deletion
let deleteType = null; // 'workout' or 'exercise'

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
});

// --- Auth Functions ---
function showLogin() {
    isLoginMode = true;
    document.getElementById('auth-title').innerText = 'Login';
    document.getElementById('auth-switch-text').innerText = "Don't have an account?";
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('auth-buttons').classList.remove('hidden');
}

function showRegister() {
    isLoginMode = false;
    document.getElementById('auth-title').innerText = 'Sign Up';
    document.getElementById('auth-switch-text').innerText = "Already have an account?";
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function toggleAuthMode() {
    isLoginMode ? showRegister() : showLogin();
}

async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/auth/authenticate' : '/auth/register';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Auth failed');

        const data = await response.json();
        token = data.token;
        localStorage.setItem('jwt_token', token);
        showDashboard();
    } catch (error) {
        showToast('Authentication failed! Check your credentials.', 'error');
    }
}

function logout() {
    token = null;
    localStorage.removeItem('jwt_token');
    showLogin();
}

// --- Dashboard Functions ---
function showDashboard() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    document.getElementById('user-email').innerText = 'Welcome!';
    
    fetchExercises(); // Fetch exercises first
    fetchWorkouts();
}

async function fetchExercises() {
    try {
        const response = await fetch(`${API_URL}/exercises`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        availableExercises = await response.json();
    } catch (error) {
        console.error('Error fetching exercises:', error);
    }
}

async function fetchWorkouts() {
    try {
        const response = await fetch(`${API_URL}/workouts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const workouts = await response.json();
        renderWorkouts(workouts);
    } catch (error) {
        console.error('Error fetching workouts:', error);
    }
}

function renderWorkouts(workouts) {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    workouts.forEach(workout => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow hover:shadow-lg transition';
        
        card.dataset.workout = JSON.stringify(workout);

        let exercisesHtml = workout.exercises.map(ex => 
            `<li class="text-sm text-gray-600 flex justify-between">
                <span>${ex.exercise.name}</span>
                <span class="font-mono">${ex.sets}x${ex.reps} @ ${ex.weight}kg</span>
             </li>`
        ).join('');

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">${workout.name}</h3>
                    <p class="text-xs text-gray-500">${new Date(workout.date).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick='openEditModal(${JSON.stringify(workout)})' class="text-blue-500 hover:text-blue-700">✏️</button>
                    <button onclick="openDeleteModal(${workout.id}, 'workout')" class="text-red-500 hover:text-red-700">🗑️</button>
                </div>
            </div>
            <ul class="space-y-2 mb-4 border-t pt-2">
                ${exercisesHtml || '<li class="text-gray-400 italic">No exercises</li>'}
            </ul>
        `;
        list.appendChild(card);
    });
}

// --- Delete Modal Functions ---

function openDeleteModal(id, type) {
    deleteTargetId = id;
    deleteType = type;
    
    const modal = document.getElementById('delete-modal');
    const title = document.getElementById('delete-modal-title');
    const desc = document.getElementById('delete-modal-desc');

    if (type === 'workout') {
        title.innerText = "Delete Workout?";
        desc.innerText = "Are you sure you want to delete this workout? This action cannot be undone.";
    } else {
        title.innerText = "Delete Exercise?";
        desc.innerText = "Are you sure you want to delete this custom exercise? It will be removed from all workouts.";
    }

    modal.classList.remove('hidden');
    modal.firstElementChild.animate([
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
    ], { duration: 200, easing: 'ease-out' });
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    deleteTargetId = null;
    deleteType = null;
}

async function confirmDelete() {
    if (!deleteTargetId) return;
    
    const endpoint = deleteType === 'workout' ? `/workouts/${deleteTargetId}` : `/exercises/${deleteTargetId}`;

    try {
        await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showToast(`${deleteType === 'workout' ? 'Workout' : 'Exercise'} deleted successfully`, 'success');
        
        if (deleteType === 'workout') {
            fetchWorkouts();
        } else {
            fetchExercises().then(() => {
                // Refresh the manage modal list if it's open
                if (!document.getElementById('manage-exercises-modal').classList.contains('hidden')) {
                    renderManageExercisesList();
                }
            });
        }
    } catch (error) {
        showToast('Failed to delete item', 'error');
    } finally {
        closeDeleteModal();
    }
}

// --- Create/Edit Workout Functions ---

function showCreateModal() {
    currentEditingId = null;
    document.getElementById('modal-title').innerText = "Create New Workout";
    document.getElementById('create-modal').classList.remove('hidden');
    document.getElementById('new-workout-name').value = '';
    document.getElementById('exercise-inputs').innerHTML = ''; 
    addExerciseRow(); 
}

function openEditModal(workout) {
    currentEditingId = workout.id;
    document.getElementById('modal-title').innerText = "Edit Workout";
    document.getElementById('create-modal').classList.remove('hidden');
    document.getElementById('new-workout-name').value = workout.name;
    document.getElementById('exercise-inputs').innerHTML = '';

    workout.exercises.forEach(ex => {
        addExerciseRow(ex.exercise.id, ex.sets, ex.reps, ex.weight);
    });
}

function closeCreateModal() {
    document.getElementById('create-modal').classList.add('hidden');
}

function addExerciseRow(exId = null, sets = 3, reps = 10, weight = 0) {
    const container = document.getElementById('exercise-inputs');
    const div = document.createElement('div');
    div.className = 'grid grid-cols-12 gap-2 items-center animate-fade-in-down';
    
    // Generate options dynamically
    let optionsHtml = availableExercises.map(ex => 
        `<option value="${ex.id}" ${ex.id == exId ? 'selected' : ''}>${ex.name}</option>`
    ).join('');

    div.innerHTML = `
        <select class="col-span-4 p-2 border rounded ex-select">
            ${optionsHtml}
        </select>
        <input type="number" class="col-span-2 p-2 border rounded ex-sets" value="${sets}">
        <input type="number" class="col-span-2 p-2 border rounded ex-reps" value="${reps}">
        <input type="number" class="col-span-3 p-2 border rounded ex-weight" value="${weight}">
        <button onclick="this.parentElement.remove()" class="col-span-1 text-red-500 hover:text-red-700 font-bold">✕</button>
    `;
    container.appendChild(div);
    
    // Simple animation for new row
    div.animate([
        { opacity: 0, transform: 'translateY(-10px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

async function submitWorkout() {
    const name = document.getElementById('new-workout-name').value;
    const rows = document.querySelectorAll('#exercise-inputs > div');
    
    const exercises = Array.from(rows).map((row, index) => ({
        exerciseId: parseInt(row.querySelector('.ex-select').value),
        sets: parseInt(row.querySelector('.ex-sets').value),
        reps: parseInt(row.querySelector('.ex-reps').value),
        weight: parseFloat(row.querySelector('.ex-weight').value),
        orderIndex: index
    }));

    const payload = { name, exercises };

    try {
        let url = `${API_URL}/workouts`;
        let method = 'POST';

        if (currentEditingId) {
            url = `${API_URL}/workouts/${currentEditingId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeCreateModal();
            fetchWorkouts();
            showToast('Workout saved successfully!', 'success');
        } else {
            showToast('Failed to save workout', 'error');
        }
    } catch (error) {
        console.error(error);
    }
}

// --- Custom Exercise Functions ---

function openCustomExerciseModal() {
    document.getElementById('custom-exercise-modal').classList.remove('hidden');
    document.getElementById('custom-ex-name').value = '';
    document.getElementById('custom-ex-muscle').value = '';
    document.getElementById('custom-ex-desc').value = '';
}

function closeCustomExerciseModal() {
    document.getElementById('custom-exercise-modal').classList.add('hidden');
}

async function submitCustomExercise() {
    const name = document.getElementById('custom-ex-name').value;
    const muscleGroup = document.getElementById('custom-ex-muscle').value;
    const description = document.getElementById('custom-ex-desc').value;

    if (!name || !muscleGroup) {
        showToast("Name and Muscle Group are required!", 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/exercises`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, muscleGroup, description })
        });

        if (response.ok) {
            closeCustomExerciseModal();
            fetchExercises(); // Refresh list
            showToast('Custom exercise created!', 'success');
        } else {
            showToast('Failed to create exercise', 'error');
        }
    } catch (error) {
        console.error(error);
    }
}

// --- Manage Exercises Functions ---

function openManageExercisesModal() {
    document.getElementById('manage-exercises-modal').classList.remove('hidden');
    renderManageExercisesList();
}

function closeManageExercisesModal() {
    document.getElementById('manage-exercises-modal').classList.add('hidden');
}

function renderManageExercisesList() {
    const container = document.getElementById('exercises-list-container');
    container.innerHTML = '';

    availableExercises.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 border rounded hover:bg-gray-50';
        
        let actionButton = '';
        
        if (ex.isCustom) {
            actionButton = `
                <button onclick="openDeleteModal(${ex.id}, 'exercise')" class="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                    🗑️
                </button>
            `;
        } else {
            actionButton = `
                <button onclick="showToast('Cannot delete default system exercises', 'error')" class="text-gray-400 cursor-not-allowed p-2">
                    🔒
                </button>
            `;
        }
        
        div.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">${ex.name}</p>
                <p class="text-xs text-gray-500">${ex.muscleGroup}</p>
            </div>
            ${actionButton}
        `;
        container.appendChild(div);
    });
}

// --- Toast Notification System ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    
    toastMsg.innerText = message;
    
    if (type === 'success') {
        toast.className = "fixed bottom-5 right-5 px-6 py-3 rounded shadow-lg transform transition-all duration-300 z-50 text-white bg-green-500 translate-y-0 opacity-100";
    } else {
        toast.className = "fixed bottom-5 right-5 px-6 py-3 rounded shadow-lg transform transition-all duration-300 z-50 text-white bg-red-500 translate-y-0 opacity-100";
    }

    setTimeout(() => {
        toast.className = "fixed bottom-5 right-5 px-6 py-3 rounded shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-50 text-white " + (type === 'success' ? 'bg-green-500' : 'bg-red-500');
    }, 3000);
}
