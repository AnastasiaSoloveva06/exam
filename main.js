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

// Логика карты

const resourcesData = {
    "type": "FeatureCollection",
    "features": [
        
        {
            "type": "Feature", "id": 1, "geometry": {"type": "Point", "coordinates": [55.7512, 37.6184]},
            "properties": {
                "category": "library", "balloonContentHeader": "Библиотека им. Ленина",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Воздвиженка, 3/5<br><strong>Контакты:</strong> 555-731<br><strong>Часы:</strong> Пн-сб: 10:00 - 20:00<br><strong>Инфо:</strong> Крупнейшая библиотека страны с уникальными залами.",
                "hintContent": "Библиотека им. Ленина"
            }
        },
        {
            "type": "Feature", "id": 2, "geometry": {"type": "Point", "coordinates": [55.7298, 37.6369]},
            "properties": {
                "category": "library", "balloonContentHeader": "Библиотека искусств им. Боголюбова",
                "balloonContentBody": "<strong>Адрес:</strong> Павелецкая площадь, 1<br><strong>Контакты:</strong> 555-102<br><strong>Часы:</strong> Вт-вс: 11:00 - 21:00<br><strong>Инфо:</strong> Фонды по искусству и уютные места для чтения в районе Павелецкой.",
                "hintContent": "Библиотека им. Боголюбова"
            }
        },

        {
            "type": "Feature", "id": 3, "geometry": {"type": "Point", "coordinates": [55.7595, 37.5654]},
            "properties": {
                "category": "education", "balloonContentHeader": "Центр образования МГЛУ",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Остоженка, 38<br><strong>Контакты:</strong> 555-851<br><strong>Часы:</strong> Пн-сб: 09:00 - 18:00<br><strong>Инфо:</strong> Профессиональные курсы иностранных языков и лингвистики.",
                "hintContent": "Центр МГЛУ"
            }
        },
        {
            "type": "Feature", "id": 4, "geometry": {"type": "Point", "coordinates": [55.7031, 37.5308]},
            "properties": {
                "category": "education", "balloonContentHeader": "Лингвистический корпус МГУ",
                "balloonContentBody": "<strong>Адрес:</strong> Ленинские горы, 1, стр. 13<br><strong>Контакты:</strong> 555-440<br><strong>Часы:</strong> Пн-пт: 09:00 - 20:00<br><strong>Инфо:</strong> Изучение редких языков и академическая база.",
                "hintContent": "МГУ Языки"
            }
        },

        {
            "type": "Feature", "id": 5, "geometry": {"type": "Point", "coordinates": [55.7111, 37.6534]},
            "properties": {
                "category": "culture", "balloonContentHeader": "Культурный центр ЗИЛ",
                "balloonContentBody": "<strong>Адрес:</strong> Восточная ул., 4, корп. 1<br><strong>Контакты:</strong> 555-900<br><strong>Часы:</strong> Ежедневно: 10:00 - 22:00<br><strong>Инфо:</strong> Лекторий, библиотека и регулярные встречи языковых клубов.",
                "hintContent": "КЦ ЗИЛ"
            }
        },
        {
            "type": "Feature", "id": 6, "geometry": {"type": "Point", "coordinates": [55.7478, 37.6882]},
            "properties": {
                "category": "culture", "balloonContentHeader": "Центр славянских культур",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Николоямская, 1<br><strong>Контакты:</strong> 555-332<br><strong>Часы:</strong> Пн-сб: 11:00 - 20:00<br><strong>Инфо:</strong> Популяризация культуры и языков славянских народов.",
                "hintContent": "Центр славянских культур"
            }
        },
        {
            "type": "Feature", "id": 7, "geometry": {"type": "Point", "coordinates": [55.7922, 37.6755]},
            "properties": {
                "category": "culture", "balloonContentHeader": "Культурный центр Сокольники",
                "balloonContentBody": "<strong>Адрес:</strong> Сокольнический Вал, 1<br><strong>Контакты:</strong> 555-115<br><strong>Часы:</strong> Ежедневно: 10:00 - 21:00<br><strong>Инфо:</strong> Творческие мастерские и открытые уроки иностранных языков.",
                "hintContent": "КЦ Сокольники"
            }
        },

        {
            "type": "Feature", "id": 8, "geometry": {"type": "Point", "coordinates": [55.7415, 37.6031]},
            "properties": {
                "category": "cafe", "balloonContentHeader": "Языковое кафе 'Talk & Coffee'",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Пречистенка, 10<br><strong>Контакты:</strong> 555-721<br><strong>Часы:</strong> Ежедневно: 09:00 - 22:00<br><strong>Инфо:</strong> Кофе и свободное общение на разных языках за общим столом.",
                "hintContent": "Talk & Coffee"
            }
        },
        {
            "type": "Feature", "id": 9, "geometry": {"type": "Point", "coordinates": [55.7684, 37.6612]},
            "properties": {
                "category": "cafe", "balloonContentHeader": "Антикафе 'Циферблат'",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Кузнецкий Мост, 19<br><strong>Контакты:</strong> 555-109<br><strong>Часы:</strong> Ежедневно: 10:00 - 00:00<br><strong>Инфо:</strong> Место встречи международных разговорных клубов.",
                "hintContent": "Циферблат"
            }
        },
        {
            "type": "Feature", "id": 10, "geometry": {"type": "Point", "coordinates": [55.7355, 37.6454]},
            "properties": {
                "category": "cafe", "balloonContentHeader": "Espresso Language Bar",
                "balloonContentBody": "<strong>Адрес:</strong> Спиридоньевский пер., 12<br><strong>Контакты:</strong> 555-667<br><strong>Часы:</strong> Ежедневно: 08:00 - 23:00<br><strong>Инфо:</strong> Тематические вечера испанского и итальянского языков.",
                "hintContent": "Language Bar"
            }
        },
        {
            "type": "Feature", "id": 11, "geometry": {"type": "Point", "coordinates": [55.7611, 37.6085]},
            "properties": {
                "category": "cafe", "balloonContentHeader": "Polyglot Hub",
                "balloonContentBody": "<strong>Адрес:</strong> ул. Тверская, 7<br><strong>Контакты:</strong> 555-001<br><strong>Часы:</strong> Пн-вс: 10:00 - 22:00<br><strong>Инфо:</strong> Крупнейшее сообщество полиглотов в центре Москвы.",
                "hintContent": "Polyglot Hub"
            }
        }
    ]
};

function initMap() {
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(() => {
        myMap = new ymaps.Map("map", {
            center: [55.751244, 37.618423],
            zoom: 11,
            controls: ['zoomControl', 'fullscreenControl']
        });

        objectManager = new ymaps.ObjectManager({ clusterize: true, gridSize: 32 });
        objectManager.objects.options.set('preset', 'islands#blueIcon');
        myMap.geoObjects.add(objectManager);
        objectManager.add(resourcesData);

        // Логика комбинированной фильтрации
        const searchInput = document.getElementById('map-search-input');
        const checkboxes = document.querySelectorAll('.filter-map');

        function applyMapFilters() {
            const searchText = searchInput.value.toLowerCase();
            const selectedCategories = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            objectManager.setFilter(object => {
                // 1. Проверка категории
                const matchesCategory = selectedCategories.includes(object.properties.category);
                
                // 2. Проверка текста в заголовке, описании или подсказке
                const contentToSearch = (
                    object.properties.balloonContentHeader + 
                    object.properties.balloonContentBody + 
                    object.properties.hintContent
                ).toLowerCase();
                
                const matchesSearch = !searchText || contentToSearch.includes(searchText);

                return matchesCategory && matchesSearch;
            });
        }

        searchInput.addEventListener('input', applyMapFilters);

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', applyMapFilters);
        });
    });
}

// рендер и расчеты

function renderCourses() {
    const nameQuery = document.getElementById('search-name').value.toLowerCase();
    const levelQuery = document.getElementById('filter-level').value;
    const filtered = allCourses.filter(c => c.name.toLowerCase().includes(nameQuery) && (!levelQuery || c.level === levelQuery));
    const start = (currentPage - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    const tbody = document.getElementById('courses-list');
    tbody.innerHTML = paginated.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.level}</td>
            <td>${c.teacher}</td>
            <td>${c.total_length} нед.</td>
            <td>${c.course_fee_per_hour} ₽</td>
            <td><button class="btn btn-sm btn-primary" onclick="openOrderModal(${c.id}, 'course')">Выбрать</button></td>
        </tr>
    `).join('');
    renderPagination(filtered.length);
}

function renderPagination(total) {
    const pagesCount = Math.ceil(total / perPage);
    const container = document.getElementById('courses-pagination');
    container.innerHTML = '';
    for (let i = 1; i <= pagesCount; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" style="cursor:pointer">${i}</a>`;
        li.onclick = () => {
            currentPage = i; renderCourses(); 
        };
        container.appendChild(li);
    }
}

function populateTutorFilters() {
    const langs = new Set();
    allTutors.forEach(t => t.languages_offered.forEach(l => langs.add(l)));
    const select = document.getElementById('tutor-lang');
    if (select) {
        select.innerHTML = '<option value="">Все языки</option>';
        langs.forEach(l => select.innerHTML += `<option value="${l}">${l}</option>`);
    }
}

function renderTutors() {
    const lang = document.getElementById('tutor-lang').value;
    const level = document.getElementById('tutor-level').value;
    const exp = document.getElementById('tutor-exp').value;
    
    const filtered = allTutors.filter(t => 
        (!lang || t.languages_offered.includes(lang)) && 
        (!level || t.language_level === level) && 
        (!exp || t.work_experience >= parseInt(exp))
    );
    
    const tutorsContainer = document.getElementById('tutors-list');
    if (!tutorsContainer) return;
    
    if (filtered.length === 0) {
        tutorsContainer.innerHTML = '<div class="col-12 text-center text-muted">Репетиторы не найдены</div>';
        return;
    }

    tutorsContainer.innerHTML = filtered.map(t => {
        const isSelected = currentItem && currentItem.id === t.id && !currentItem.hasOwnProperty('total_length');
        const btnText = isSelected ? 'Отменить' : 'Выбрать';
        const btnClass = isSelected ? 'btn-danger' : 'btn-outline-primary';
        const cardClass = isSelected ? 'tutor-selected' : '';

        return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 card-tutor shadow-sm ${cardClass}" id="tutor-card-${t.id}">
                <img src="https://placehold.co/400x300?text=${t.name}" class="card-img-top" alt="Photo">
                <div class="card-body">
                    <h5 class="card-title">${t.name}</h5>
                    <p class="card-text mb-1">Опыт: ${t.work_experience} лет</p>
                    <p class="card-text mb-1">Уровень: ${t.language_level}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="fw-bold">${t.price_per_hour} ₽/ч</span>
                        <button class="btn ${btnClass} btn-sm" onclick="handleTutorClick(${t.id})">${btnText}</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function openOrderModal(id, type) {
    currentItem = type === 'course' ? allCourses.find(c => c.id === id) : allTutors.find(t => t.id === id);
    if (!currentItem) return;
    if (type === 'tutor') {
        renderTutors();
    }

    document.getElementById('item-id').value = id;
    document.getElementById('item-type').value = type;
    document.getElementById('form-name').value = type === 'course' ? currentItem.name : `Индивидуально: ${currentItem.name}`;
    document.getElementById('form-teacher').value = currentItem.teacher || currentItem.name;
    
    const durationInput = document.getElementById('form-duration');
    const durationUnit = document.getElementById('duration-unit');

    if (type === 'course') {
        durationUnit.textContent = 'недель';
        durationInput.value = currentItem.total_length; 
        durationInput.readOnly = true; 
    } else {
        durationUnit.textContent = 'часов';
        durationInput.value = 1; 
        durationInput.readOnly = false; 
    const dateSelect = document.getElementById('form-date');
    dateSelect.innerHTML = '<option value="">Выберите дату</option>';
    let dates = type === 'course' ? (currentItem.start_dates || []) : ["2025-02-01T10:00", "2025-02-15T10:00"];
    dates.forEach(d => {
        const dateOnly = d.split('T')[0];
        dateSelect.innerHTML += `<option value="${dateOnly}">${dateOnly}</option>`;
    });

    calculatePrice();
    modalObj.show();
}
function handleTutorClick(id) {
    if (currentItem && currentItem.id === id && !currentItem.hasOwnProperty('total_length')) {
        currentItem = null;
        renderTutors(); 
        showAlert('Выбор отменен', 'info');
    } else {
        openOrderModal(id, 'tutor');
    }
}

function calculatePrice() {
    if (!currentItem) return 0;

    const type = document.getElementById('item-type').value;
    const persons = parseInt(document.getElementById('form-persons').value) || 1;
    const startDateStr = document.getElementById('form-date').value;
    const startTimeStr = document.getElementById('form-time').value;
    const durationInputVal = parseInt(document.getElementById('form-duration').value) || 1;
    
    const fee = type === 'course' 
        ? (currentItem.course_fee_per_hour || 0) 
        : (currentItem.price_per_hour || 0);

    let durationInHours = (type === 'course') 
        ? durationInputVal * (currentItem.week_length || 1) 
        : durationInputVal;

    // 1. Множитель выходных/праздников
    let isWeekendOrHoliday = 1.0;
    if (startDateStr) {
        const date = new Date(startDateStr);
        const day = date.getDay();
        if (day === 0 || day === 6) {
            isWeekendOrHoliday = 1.5;
        }
    }

    // 2. Утренняя/вечерняя доплата
    let morningSurcharge = 0;
    let eveningSurcharge = 0;
    if (startTimeStr) {
        const hour = parseInt(startTimeStr.split(':')[0]);
        if (hour >= 9 && hour < 12) morningSurcharge = 400;
        if (hour >= 18 && hour <= 20) eveningSurcharge = 1000;
    }

    // 3. Базовая стоимость по формуле
    let base = ((fee * durationInHours * isWeekendOrHoliday) + morningSurcharge + eveningSurcharge) * persons;
    let total = base;

    const earlyCheck = document.getElementById('early_registration');
    const groupCheck = document.getElementById('group_enrollment');
    const intensiveCheck = document.getElementById('intensive_course');

    // 4. Ранняя регистрация (не менее 1 месяца вперед)
    if (startDateStr && earlyCheck) {
        const today = new Date();
        const startDate = new Date(startDateStr);
        const diffTime = startDate - today;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays >= 30) {
            total *= 0.9; // -10%
            earlyCheck.checked = true;
        } else {
            earlyCheck.checked = false;
        }
    }

    // 5. Групповая скидка (от 5 человек)
    if (groupCheck) {
        if (persons >= 5) {
            total *= 0.85; 
            groupCheck.checked = true;
        } else {
            groupCheck.checked = false;
        }
    }

    // 6. Интенсивный курс (5+ часов в неделю)
    if (intensiveCheck) {
        if (type === 'course' && currentItem.week_length >= 5) {
            total *= 1.2; 
            intensiveCheck.checked = true;
        } else {
            intensiveCheck.checked = false;
        }
    }

    // 7. Пользовательские опции
    if (document.getElementById('supplementary')?.checked) total += (2000 * persons);
    if (document.getElementById('personalized')?.checked) total += (1500 * (type === 'course' ? durationInputVal : 1));
    if (document.getElementById('excursions')?.checked) total *= 1.25;
    if (document.getElementById('interactive')?.checked) total *= 1.5;
    if (document.getElementById('assessment')?.checked) total += 300;

    // 8. Округление и вывод
    const finalPrice = Math.round(total);
    const display = document.getElementById('total-price') || document.getElementById('edit-total-price');
    if (display) display.innerText = finalPrice.toLocaleString('ru-RU');

    return finalPrice;
}

window.addEventListener('DOMContentLoaded', () => {
    fetchCourses();
    fetchTutors();
    initMap(); 
});

document.getElementById('order-form').onsubmit = async (e) => {
    e.preventDefault();

    const type = document.getElementById('item-type').value;
    let durationValue;

    if (type === 'course') {
        durationValue = currentItem.total_length * currentItem.week_length;
    } else {
        durationValue = parseInt(document.getElementById('form-duration').value) || 1;
    }

    const formData = {
        course_id: type === 'course' ? parseInt(document.getElementById('item-id').value) : null,
        tutor_id: type === 'tutor' ? parseInt(document.getElementById('item-id').value) : null,
        date_start: document.getElementById('form-date').value,
        time_start: document.getElementById('form-time').value,
        duration: durationValue, 
        persons: parseInt(document.getElementById('form-persons').value),
        price: parseInt(document.getElementById('total-price').innerText.replace(/\s/g, '')),
        early_registration: document.getElementById('early_registration').checked,
        group_enrollment: document.getElementById('group_enrollment').checked,
        intensive_course: document.getElementById('intensive_course').checked,
        supplementary: document.getElementById('supplementary').checked,
        personalized: document.getElementById('personalized').checked,
        excursions: document.getElementById('excursions').checked,
        assessment: document.getElementById('assessment').checked,
        interactive: document.getElementById('interactive').checked
    };

    try {
        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert('Заявка успешно отправлена! Вы можете увидеть её в личном кабинете.');
            modalObj.hide(); 
            document.getElementById('order-form').reset(); 
        } else {
            const errorData = await response.json();
            showAlert(`Ошибка при отправке: ${errorData.error || 'Неизвестная ошибка'}`, 'danger');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        showAlert('Произошла ошибка при соединении с сервером', 'danger');
    }
};

document.getElementById('course-search-form').onsubmit = (e) => {
    e.preventDefault(); currentPage = 1; renderCourses(); 
};
document.getElementById('form-date').onchange = () => {
    const ts = document.getElementById('form-time');
    ts.disabled = false;
    ts.innerHTML = '<option value="">Выберите время</option>';
    
    let duration = 1;
    if (currentItem && currentItem.duration) {
        duration = parseInt(currentItem.duration);
    }

    for (let h = 9; h <= 20; h++) {
        let startHour = h;
        let endHour = h + duration;

        let startTime = `${startHour.toString().padStart(2, '0')}:00`;
        let endTime = `${endHour.toString().padStart(2, '0')}:00`;

        let intervalText = `${startTime} - ${endTime}`;
        
        ts.innerHTML += `<option value="${startTime}">${intervalText}</option>`;
    }
    calculatePrice();
};
document.getElementById('form-time').onchange = calculatePrice;
document.getElementById('form-persons').oninput = calculatePrice;
document.getElementById('form-date').addEventListener('change', calculatePrice);
document.getElementById('form-duration').oninput = calculatePrice;
document.querySelectorAll('.opt-check').forEach(el => el.onchange = calculatePrice);
document.getElementById('tutor-exp').oninput = renderTutors;
document.getElementById('tutor-lang').onchange = renderTutors;
document.getElementById('tutor-level').onchange = renderTutors;