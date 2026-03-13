// 1. Khởi tạo bản đồ tại Thảo Cầm Viên
var map = L.map('map').setView([10.7875, 106.7052], 17);

// 2. Thêm lớp bản đồ nền
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Hàm gọi API từ Controller C#
async function loadData() {
    try {
        const response = await fetch('/api/poi'); // Đường dẫn đến Controller của bạn
        const data = await response.json();

        data.forEach(item => {
            // Vẽ marker cho từng POI từ SQL Server
            L.marker([item.latitude, item.longitude])
                .addTo(map)
                .bindPopup(`<b>${item.name}</b><br>${item.description}`);
        });
    } catch (err) {
        console.error("Không thể lấy dữ liệu từ SQL Server:", err);
    }
}

// Hàm để định vị vị trí hiện tại
function locateUser() {
    // Kiểm tra xem trình duyệt có hỗ trợ định vị không
    if (!navigator.geolocation) {
        alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
        return;
    }

    // Cấu hình tùy chọn để lấy tọa độ chính xác nhất (quan trọng cho Geofencing)
    const options = {
        enableHighAccuracy: true, // Lấy độ chính xác cao nhất
        timeout: 5000,
        maximumAge: 0
    };

    // Bắt đầu lấy vị trí
    navigator.geolocation.getCurrentPosition(success, error, options);
}

// Khi lấy vị trí thành công
function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    console.log(`Vị trí của bạn: Lat ${lat}, Lng ${lng}`);

    // Vẽ một vòng tròn màu xanh để đánh dấu người dùng
    var userMarker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: "#2196F3",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    userMarker.bindPopup("Bạn đang ở đây").openPopup();

    // Tự động di chuyển bản đồ về phía người dùng
    map.setView([lat, lng], 18);
}

// Khi gặp lỗi (ví dụ người dùng từ chối quyền truy cập)
function error() {
    alert("Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập GPS.");
}

// Gọi hàm định vị khi trang web tải xong
locateUser();

loadData();