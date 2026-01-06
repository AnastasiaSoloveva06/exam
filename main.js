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