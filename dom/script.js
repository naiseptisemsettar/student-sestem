const API_URL = "http://localhost:3000/students";
let allStudents = [];
let showPassedOnly = false;
let useLocalStorage = false; // يتحول تلقائياً إذا لم يكن السيرفر شغالاً

// بيانات افتراضية تظهر عند فتح الموقع أونلاين بدون سيرفر
const defaultStudents = [
  { id: "1", name: "Ahmed", email: "ahmed@gmail.com", grade: 85 },
  { id: "2", name: "Sara", email: "sara@gmail.com", grade: 92 },
  { id: "3", name: "Omar", email: "omar@gmail.com", grade: 45 }
];

// 1. جلب البيانات (من السيرفر أو من ذاكرة المتصفح أونلاين)
async function getStudents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Server offline");
    allStudents = await response.json();
    useLocalStorage = false;
  } catch (error) {
    // في حال الفتح على Vercel وعدم وجود سيرفر محلي
    useLocalStorage = true;
    const saved = localStorage.getItem("students_data");
    if (saved) {
      allStudents = JSON.parse(saved);
    } else {
      allStudents = [...defaultStudents];
      localStorage.setItem("students_data", JSON.stringify(allStudents));
    }
  }
  filterAndDisplay();
}

function saveToLocal() {
  localStorage.setItem("students_data", JSON.stringify(allStudents));
}

function filterAndDisplay() {
  const searchText = document.getElementById("search-input").value.toLowerCase();
  let filtered = allStudents.filter((student) => {
    const matchesName = student.name.toLowerCase().includes(searchText);
    const matchesPass = showPassedOnly ? Number(student.grade) >= 50 : true;
    return matchesName && matchesPass;
  });
  displayStudents(filtered);
}

function displayStudents(data) {
  const tbody = document.getElementById("students-table-body");
  const countSpan = document.getElementById("student-count");
  const noResultsMsg = document.getElementById("no-results-msg");

  tbody.innerHTML = "";
  countSpan.textContent = data.length;

  if (data.length === 0) {
    noResultsMsg.style.display = "block";
    return;
  } else {
    noResultsMsg.style.display = "none";
  }

  data.forEach((student) => {
    const isPassed = Number(student.grade) >= 50;
    const row = `
      <tr>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.grade}</td>
        <td style="color: ${isPassed ? 'green' : 'red'}; font-weight: bold;">
          ${isPassed ? "ناجح" : "راسب"}
        </td>
        <td>
          <button class="btn-warning" onclick="editStudent('${student.id}')">تعديل</button>
          <button class="btn-danger" onclick="deleteStudent('${student.id}')">حذف</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// 2 و 3. إضافة أو تعديل طالب
document.getElementById("student-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("student-id").value;
  const studentData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    grade: Number(document.getElementById("grade").value),
  };

  if (useLocalStorage) {
    if (id) {
      const index = allStudents.findIndex((s) => String(s.id) === String(id));
      if (index !== -1) allStudents[index] = { id, ...studentData };
    } else {
      allStudents.push({ id: String(Date.now()), ...studentData });
    }
    saveToLocal();
    resetForm();
    filterAndDisplay();
    return;
  }

  try {
    if (id) {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
    }
    resetForm();
    getStudents();
  } catch (error) {
    console.error("خطأ أثناء الحفظ:", error);
  }
});

function editStudent(id) {
  const student = allStudents.find((s) => String(s.id) === String(id));
  if (!student) return;

  document.getElementById("student-id").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("email").value = student.email;
  document.getElementById("grade").value = student.grade;

  document.getElementById("form-title").textContent = "تعديل بيانات الطالب";
  document.getElementById("submit-btn").textContent = "حفظ التعديلات";
  document.getElementById("cancel-btn").style.display = "inline-block";
}

function resetForm() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("form-title").textContent = "إضافة طالب جديد";
  document.getElementById("submit-btn").textContent = "إضافة طالب";
  document.getElementById("cancel-btn").style.display = "none";
}

// 4. حذف طالب
async function deleteStudent(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

  if (useLocalStorage) {
    allStudents = allStudents.filter((s) => String(s.id) !== String(id));
    saveToLocal();
    filterAndDisplay();
    return;
  }

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    getStudents();
  } catch (error) {
    console.error("خطأ أثناء الحذف:", error);
  }
}

// 7. ترتيب حسب العلامة
function sortByGrade() {
  allStudents.sort((a, b) => Number(b.grade) - Number(a.grade));
  filterAndDisplay();
}

// 8. الناجحون فقط
function togglePassedOnly() {
  showPassedOnly = !showPassedOnly;
  const btn = document.getElementById("passed-btn");
  btn.textContent = showPassedOnly ? "عرض الجميع" : "عرض الناجحين فقط (50+)";
  filterAndDisplay();
}

function resetFilters() {
  document.getElementById("search-input").value = "";
  showPassedOnly = false;
  document.getElementById("passed-btn").textContent = "عرض الناجحين فقط (50+)";
  getStudents();
}

getStudents();
