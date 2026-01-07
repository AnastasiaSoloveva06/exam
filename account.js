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

function renderOrders() {
    const tbody = document.getElementById('orders-list');
    const start = (currentPage - 1) * perPage;
    const paginated = orders.slice(start, start + perPage);

    tbody.innerHTML = paginated.map((o, i) => {
        let name = o.course_id ? courses.find(c => c.id == o.course_id)?.name : tutors.find(t => t.id == o.tutor_id)?.name;
        name = name || "Программа удалена";

        return `
            <tr>
                <td>${start + i + 1}</td>
                <td>${name}</td>
                <td>${o.date_start} / ${o.time_start}</td>
                <td>${o.price.toLocaleString()} ₽</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" onclick="showDetails(${o.id}, '${name}')">👁</button>
                    <button class="btn btn-sm btn-warning" onclick="openEditModal(${o.id})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete(${o.id})">🗑</button>
                </td>
            </tr>
        `;
    }).join('');
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(orders.length / perPage);
    const container = document.getElementById('orders-pagination');
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="currentPage=${i};renderOrders()">${i}</a></li>`;
    }
}

function showDetails(id, name) {
    const o = orders.find(x => x.id == id);
    const body = document.getElementById('details-body');
    
    body.innerHTML = `
        <h5>${name}</h5>
        <p><strong>Дата:</strong> ${o.date_start} в ${o.time_start}</p>
        <p><strong>Студентов:</strong> ${o.persons}</p>
        <hr>
        <p><strong>Опции:</strong> ${[o.supplementary?'Материалы':'', o.personalized?'Индивидуально':'', o.excursions?'Экскурсии':'', o.interactive?'Платформа':''].filter(Boolean).join(', ') || 'Нет'}</p>
        <h4 class="text-end">${o.price.toLocaleString()} ₽</h4>
    `;
    detailsModal.show();
}

// редактирование заявки
function openEditModal(id) {
    currentEditingOrder = orders.find(x => x.id == id);
    const o = currentEditingOrder;

    const item = o.course_id 
        ? courses.find(c => c.id == o.course_id) 
        : tutors.find(t => t.id == o.tutor_id);

    const dateSel = document.getElementById('edit-date');
    dateSel.innerHTML = '';

    let availableDates = [];
    if (o.course_id) {
        availableDates = item ? (item.start_dates || []) : [];
    } else {
        availableDates = ["2025-02-01T10:00", "2025-02-15T10:00"];
    }

    availableDates.forEach(d => {
        const dateOnly = d.split('T')[0];
        const option = document.createElement('option');
        option.value = dateOnly;
        option.text = dateOnly;
        if (dateOnly === o.date_start) option.selected = true;
        dateSel.appendChild(option);
    });

    if (!availableDates.some(d => d.startsWith(o.date_start))) {
        const currentOpt = document.createElement('option');
        currentOpt.value = o.date_start;
        currentOpt.text = o.date_start;
        currentOpt.selected = true;
        dateSel.prepend(currentOpt);
    }

    document.getElementById('edit-id').value = o.id;
    document.getElementById('edit-persons').value = o.persons;
    
    const timeSel = document.getElementById('edit-time');
    timeSel.innerHTML = '';
    for(let h=9; h<=20; h++) {
        const val = `${h.toString().padStart(2,'0')}:00`;
        timeSel.innerHTML += `<option value="${val}" ${o.time_start.startsWith(val)?'selected':''}>${val}</option>`;
    }

    document.getElementById('edit-supplementary').checked = !!o.supplementary;
    document.getElementById('edit-personalized').checked = !!o.personalized;
    document.getElementById('edit-excursions').checked = !!o.excursions;
    document.getElementById('edit-interactive').checked = !!o.interactive;
    document.getElementById('edit-assessment').checked = !!o.assessment;

    updateEditPrice();
    editModal.show();
}
