const API_KEY = '01453dec-ac11-443d-864a-8ad4584a357c'; 
const BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api'; 

let allCourses = [];
let allTutors = [];
let currentPage = 1;
const perPage = 5;
let currentItem = null;

// переменные Яндекс.Карты
let myMap;
let objectManager;

const modalElement = document.getElementById('orderModal');
const modalObj = new bootstrap.Modal(modalElement);

// Уведомления
function showAlert(message, type = 'success') {
    const container = document.getElementById('notifications');
    const div = document.createElement('div');
    div.className = `alert alert-${type} alert-dismissible fade show`;
    div.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

async function fetchCourses() {
    try {
        const res = await fetch(`${BASE_URL}/courses?api_key=${API_KEY}`);
        allCourses = await res.json();
        renderCourses();
    } catch (err) {
        showAlert('Ошибка загрузки курсов', 'danger'); 
    }
}

async function fetchTutors() {
    try {
        const res = await fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`);
        allTutors = await res.json();
        populateTutorFilters();
        renderTutors();
    } catch (err) {
        showAlert('Ошибка загрузки репетиторов', 'danger'); 
    }
}