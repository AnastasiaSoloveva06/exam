const API_KEY = '01453dec-ac11-443d-864a-8ad4584a357c';
const BASE_URL = '/polytech-api';

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

function updateEditPrice() {
    if (!currentEditingOrder) return;

    const o = currentEditingOrder;
    const item = o.course_id ? courses.find(c => c.id == o.course_id) : tutors.find(t => t.id == o.tutor_id);
    if (!item) return;

    const type = o.course_id ? 'course' : 'tutor';
    const persons = parseInt(document.getElementById('edit-persons').value) || 1;
    const fee = item.course_fee_per_hour || item.price_per_hour || 0;
    
    let durationInHours = (type === 'course') 
        ? (item.total_length * item.week_length) 
        : (o.duration || 1);

    // 1. Коэффициент выходного дня
    const dateVal = document.getElementById('edit-date').value;
    let isWeekend = 1.0;
    if (dateVal) {
        const d = new Date(dateVal);
        if (d.getDay() === 0 || d.getDay() === 6) isWeekend = 1.5;
    }

    // 2. Наценка за время
    const timeVal = document.getElementById('edit-time').value;
    let surcharge = 0;
    if (timeVal) {
        const hour = parseInt(timeVal.split(':')[0]);
        if (hour >= 9 && hour <= 12) surcharge = 400;
        else if (hour >= 18 && hour <= 20) surcharge = 1000;
    }

    let total = ((fee * durationInHours * isWeekend) + surcharge) * persons;

    // 3. Ранняя регистрация
    const earlyCheck = document.getElementById('early_registration');
    if (dateVal && earlyCheck) {
        const diffDays = (new Date(dateVal) - new Date()) / (1000 * 60 * 60 * 24);
        if (diffDays >= 30) {
            total *= 0.9;
            earlyCheck.checked = true;
        } else {
            earlyCheck.checked = false;
        }
    }

    // 4. Групповая скидка - ФИКС: должна применяться автоматически!
    const groupCheck = document.getElementById('group_enrollment');
    if (groupCheck) {
        if (persons >= 5) {
            total *= 0.85; 
            groupCheck.checked = true;
        } else {
            groupCheck.checked = false;
        }
    }

    // 5. Интенсив
    const intensiveCheck = document.getElementById('intensive_course');
    if (intensiveCheck) {
        if (type === 'course' && item.week_length >= 5) {
            total *= 1.2;
            intensiveCheck.checked = true;
        } else {
            intensiveCheck.checked = false;
        }
    }

    if (document.getElementById('edit-supplementary').checked) total += (2000 * persons);
    if (document.getElementById('edit-personalized').checked) total += (1500 * (item.total_length || 1));
    if (document.getElementById('edit-excursions').checked) total *= 1.25;
    if (document.getElementById('edit-interactive').checked) total *= 1.5;
    if (document.getElementById('edit-assessment').checked) total += 300;
    
    // 7. Оценка уровня (если чекбокс существует)
    const assessmentCheckbox = document.getElementById('edit-assessment');
    if (assessmentCheckbox && assessmentCheckbox.checked) total += 300;

    // Округление
    const roundedTotal = Math.round(total);
    document.getElementById('edit-total-price').innerText = roundedTotal.toLocaleString('ru-RU');
}

document.querySelectorAll('.edit-opt, #edit-date, #edit-time, #edit-persons').forEach(el => {
    if (el) el.onchange = updateEditPrice;
});

document.getElementById('edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    
    const rawPrice = document.getElementById('edit-total-price').innerText;
    const cleanPrice = parseInt(rawPrice.replace(/\s|&nbsp;/g, ''));

    const data = {
        date_start: document.getElementById('edit-date').value,
        time_start: document.getElementById('edit-time').value,
        persons: parseInt(document.getElementById('edit-persons').value),
        price: cleanPrice,
        supplementary: document.getElementById('edit-supplementary').checked ? 1 : 0,
        personalized: document.getElementById('edit-personalized').checked ? 1 : 0,
        excursions: document.getElementById('edit-excursions').checked ? 1 : 0,
        interactive: document.getElementById('edit-interactive').checked ? 1 : 0,
        assessment: document.getElementById('edit-assessment').checked ? 1 : 0
    };
    try {
        const res = await fetch(`${BASE_URL}/orders/${id}?api_key=${API_KEY}`, {
            method: 'PUT', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) { 
            showAlert('Заявка успешно изменена'); 
            editModal.hide(); 
            fetchOrders(); 
        } else {
            showAlert('Ошибка при сохранении', 'danger');
        }
    } catch (err) {
        showAlert('Произошла ошибка сети', 'danger');
    }
};

// удаление
let idToDelete = null;
function confirmDelete(id) { idToDelete = id; delModal.show(); }
document.getElementById('confirm-delete').onclick = async () => {
    const res = await fetch(`${BASE_URL}/orders/${idToDelete}?api_key=${API_KEY}`, { method: 'DELETE' });
    if(res.ok) { showAlert('Заявка удалена'); delModal.hide(); fetchOrders(); }
};

init();
