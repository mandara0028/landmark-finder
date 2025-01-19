// DOM要素
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const resultElement = document.getElementById('result');
const startButton = document.getElementById('start-button');
const errorMessageElement = document.querySelector('.error-message');
const landmarkNameElement = document.querySelector('.landmark-name');
const landmarkDistanceElement = document.querySelector('.landmark-distance');

// Google Places API設定
const GOOGLE_API_KEY = 'AIzaSyDlyqOT0Wjv5wPdxZsT9Wybpe_0Dh7-VSo';
const SEARCH_RADIUS = 1000; // メートル
const PLACE_TYPES = ['train_station', 'shopping_mall', 'department_store', 'tourist_attraction'];

// 状態管理
let currentPosition = null;
let map = null;
let placesService = null;

// 表示状態の制御
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showError(message) {
    errorMessageElement.textContent = message;
    hideElement(loadingElement);
    hideElement(resultElement);
    showElement(errorElement);
}

// 位置情報の取得
function requestLocation() {
    if (!navigator.geolocation) {
        showError('お使いのブラウザは位置情報をサポートしていません。');
        return;
    }

    hideElement(errorElement);
    hideElement(resultElement);
    hideElement(startButton);
    showElement(loadingElement);

    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function handleLocationSuccess(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    initializePlacesService();
}

function handleLocationError(error) {
    let errorMessage = '';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません。';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報を取得できませんでした。';
            break;
        case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。';
            break;
        default:
            errorMessage = '予期せぬエラーが発生しました。';
    }
    showError(errorMessage);
}

// Google Places API関連
function initializePlacesService() {
    if (!map) {
        map = new google.maps.Map(document.createElement('div'));
    }
    if (!placesService) {
        placesService = new google.maps.places.PlacesService(map);
    }
    searchNearbyPlaces();
}

function searchNearbyPlaces() {
    const request = {
        location: currentPosition,
        radius: SEARCH_RADIUS,
        type: PLACE_TYPES
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            const nearestPlace = results[0];
            displayResult(nearestPlace);
        } else {
            showError('周辺のランドマークが見つかりませんでした。');
        }
    });
}

function displayResult(place) {
    const distance = calculateDistance(
        currentPosition.lat,
        currentPosition.lng,
        place.geometry.location.lat(),
        place.geometry.location.lng()
    );

    landmarkNameElement.textContent = place.name;
    landmarkDistanceElement.textContent = `約${Math.round(distance)}m`;

    hideElement(loadingElement);
    hideElement(errorElement);
    showElement(resultElement);
}

// 距離計算（ヒュベニの公式）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Google Maps APIの読み込みと初期化
document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
});