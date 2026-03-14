let mapPicker;
let markerPicker;
const poiModalElement = document.getElementById('poiModal');
let poiModal;

document.addEventListener('DOMContentLoaded', () => {
    if (poiModalElement) {
        poiModal = new bootstrap.Modal(poiModalElement);
    }
    loadPois();

    if (poiModalElement) {
        poiModalElement.addEventListener('shown.bs.modal', function () {
            if (!mapPicker) {
                mapPicker = L.map('map-picker').setView([10.7875, 106.7052], 17);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapPicker);

                mapPicker.on('click', function(e) {
                    const lat = e.latlng.lat.toFixed(6);
                    const lng = e.latlng.lng.toFixed(6);
                    
                    document.getElementById('poi-lat').value = lat;
                    document.getElementById('poi-lng').value = lng;

                    if (markerPicker) {
                        markerPicker.setLatLng(e.latlng);
                    } else {
                        markerPicker = L.marker(e.latlng).addTo(mapPicker);
                    }
                });
            }
            mapPicker.invalidateSize();
        });
    }
});

async function loadPois() {
    try {
        const res = await fetch('/api/admin/pois');
        const data = await res.json();
        
        const tbody = document.getElementById('poi-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        data.forEach(poi => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${poi.poiId}</td>
                <td><strong>${poi.name}</strong></td>
                <td><small>${poi.latitude}, ${poi.longitude}</small></td>
                <td>${poi.radius}</td>
                <td><span class="badge ${poi.isActive ? 'bg-success' : 'bg-secondary'}">${poi.isActive ? 'Bật' : 'Tắt'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick='editPoi(${JSON.stringify(poi)})'>Sửa</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePoi(${poi.poiId})">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Lỗi tải POIs", e);
    }
}

function showCreateModal() {
    document.getElementById('poi-form').reset();
    document.getElementById('poi-id').value = '';
    document.getElementById('poiModalLabel').innerText = 'Thêm POI mới';
    if (markerPicker) mapPicker.removeLayer(markerPicker);
    markerPicker = null;
    
    if(poiModal) poiModal.show();
}

function editPoi(poi) {
    document.getElementById('poi-id').value = poi.poiId;
    document.getElementById('poi-name').value = poi.name;
    document.getElementById('poi-desc').value = poi.description;
    document.getElementById('poi-lat').value = poi.latitude;
    document.getElementById('poi-lng').value = poi.longitude;
    document.getElementById('poi-radius').value = poi.radius;
    document.getElementById('poi-priority').value = poi.priority;
    document.getElementById('poi-active').checked = poi.isActive;
    
    document.getElementById('poiModalLabel').innerText = 'Chỉnh sửa POI';
    
    // Set map center if exists
    if (mapPicker) {
        mapPicker.setView([poi.latitude, poi.longitude], 18);
        if (markerPicker) {
            markerPicker.setLatLng([poi.latitude, poi.longitude]);
        } else {
            markerPicker = L.marker([poi.latitude, poi.longitude]).addTo(mapPicker);
        }
    }

    if(poiModal) poiModal.show();
}

async function savePoi() {
    const id = document.getElementById('poi-id').value;
    const body = {
        name: document.getElementById('poi-name').value,
        description: document.getElementById('poi-desc').value,
        latitude: parseFloat(document.getElementById('poi-lat').value),
        longitude: parseFloat(document.getElementById('poi-lng').value),
        radius: parseInt(document.getElementById('poi-radius').value),
        priority: parseInt(document.getElementById('poi-priority').value),
        isActive: document.getElementById('poi-active').checked
    };

    try {
        let url = '/api/admin/pois';
        let method = 'POST';

        if (id) {
            url += `/${id}`;
            method = 'PUT';
            body.poiId = parseInt(id);
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            poiModal.hide();
            loadPois();
        } else {
            alert('Lỗi lưu POI');
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi mạng');
    }
}

async function deletePoi(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa điểm này không?')) return;
    
    try {
        const res = await fetch(`/api/admin/pois/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadPois();
        } else {
            alert('Lỗi xóa POI');
        }
    } catch (e) {
        console.error(e);
    }
}
