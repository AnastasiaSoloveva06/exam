const API_KEY = '01453dec-ac11-443d-864a-8ad4584a357c';
const BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';

let orders = [], courses = [], tutors = [];
let currentPage = 1;
const perPage = 5;

const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const delModal = new bootstrap.Modal(document.getElementById('deleteModal'));

let currentEditingOrder = null;

function showAlert(message, type = 'success') {
    const container = document.getElementById('notifications');
    const div = document.createElement('div');
    div.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
    div.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

async function init() {
    try {
        const [cRes, tRes] = await Promise.all([
            fetch(`${BASE_URL}/courses?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`)
        ]);
        courses = await cRes.json();
        tutors = await tRes.json();
        await fetchOrders();
    } catch (err) { showAlert('Ошибка загрузки данных', 'danger'); }
}

async function fetchOrders() {
    const res = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`);
    const data = await res.json();
    
    orders = data.sort((a, b) => b.id - a.id);
    
    renderOrders();
}