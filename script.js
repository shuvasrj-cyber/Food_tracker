let foodData = JSON.parse(localStorage.getItem('foodEntries')) || [];

// Populate dropdowns on load
window.onload = function() {
    const yearSelect = document.getElementById('yearSelect');
    const daySelect = document.getElementById('daySelect');

    for (let i = 2070; i <= 2090; i++) {
        let opt = document.createElement('option');
        opt.value = i; opt.innerHTML = i;
        if(i === 2081) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    for (let i = 1; i <= 31; i++) {
        let opt = document.createElement('option');
        let val = i < 10 ? '0' + i : i;
        opt.value = val; opt.innerHTML = val;
        daySelect.appendChild(opt);
    }
};

function saveEntry() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const day = document.getElementById('daySelect').value;
    const fullDate = `${year}-${month}-${day}`;

    const entry = {
        id: Date.now(),
        date: fullDate,
        morning: getMealData('Morning'),
        afternoon: getMealData('Afternoon'),
        evening: getMealData('Evening')
    };

    entry.dailyTotal = (entry.morning.price || 0) + 
                       (entry.afternoon.price || 0) + 
                       (entry.evening.price || 0);

    foodData.push(entry);
    localStorage.setItem('foodEntries', JSON.stringify(foodData));
    alert("Record Saved Successfully!");
    
    if (!document.getElementById('excelView').classList.contains('hidden')) {
        renderTable();
    }
    clearInputs();
}

function getMealData(type) {
    const isChecked = document.getElementById(`check${type}`).checked;
    if (!isChecked) return { food: "-", price: 0 };

    return {
        food: document.getElementById(`food${type}`).value || "Unspecified",
        price: parseFloat(document.getElementById(`price${type}`).value) || 0
    };
}

function toggleExcelView() {
    const view = document.getElementById('excelView');
    view.classList.toggle('hidden');
    if (!view.classList.contains('hidden')) renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    foodData.forEach((item, index) => {
        const m = item.morning.food !== "-" ? `${item.morning.food} (Rs.${item.morning.price})` : "-";
        const a = item.afternoon.food !== "-" ? `${item.afternoon.food} (Rs.${item.afternoon.price})` : "-";
        const e = item.evening.food !== "-" ? `${item.evening.food} (Rs.${item.evening.price})` : "-";

        const row = `<tr>
            <td>${item.date}</td>
            <td>${m}</td>
            <td>${a}</td>
            <td>${e}</td>
            <td><strong>${item.dailyTotal}</strong></td>
            <td><button class="btn-del" onclick="deleteEntry(${index})">Del</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function deleteEntry(index) {
    if(confirm("Are you sure you want to delete this entry?")) {
        foodData.splice(index, 1);
        localStorage.setItem('foodEntries', JSON.stringify(foodData));
        renderTable();
    }
}

function calculateStats() {
    let grandTotal = foodData.reduce((sum, item) => sum + item.dailyTotal, 0);
    document.getElementById('results').innerHTML = `
        <div class="stats-card">
            <strong>Total Spent:</strong> Rs. ${grandTotal} | 
            <strong>Entries:</strong> ${foodData.length}
        </div>`;
}

function downloadExcel() {
    if (foodData.length === 0) { alert("No data to export!"); return; }
    
    const excelRows = foodData.map(i => ({
        Date: i.date,
        Morning_Food: i.morning.food,
        Morning_Rs: i.morning.price,
        Afternoon_Food: i.afternoon.food,
        Afternoon_Rs: i.afternoon.price,
        Evening_Food: i.evening.food,
        Evening_Rs: i.evening.price,
        Day_Total: i.dailyTotal
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Food Data");
    XLSX.writeFile(workbook, "Nepali_Food_Record.xlsx");
}

function clearInputs() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => input.value = "");
    const checks = document.querySelectorAll('input[type="checkbox"]');
    checks.forEach(check => check.checked = false);
}
