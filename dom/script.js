const API_URL = "http://localhost:3000/students";
let allStudents = []; // لتخزين جميع الطلاب محلياً للبحث والترتيب
let showPassedOnly = false; // حالة فلتر الناجحين

// 1. جلب البيانات من JSON Server
async function getStudents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("فشل جلب البيانات");
    
    allStudents = await response.json();
    filterAndDisplay();
  } catch (error) {
    console.error("خطأ:", error);
    alert("تأكد من تشغيل json-server على المنفذ 3000!");
  }
}

// دالة موحدة لتطبيق البحث والفلترة ثم العرض
function filterAndDisplay() {
  const searchText = document.getElementById("search-input").value.toLowerCase();

  let filtered = allStudents.filter((student) => {
    // 5. البحث بالاسم
    const matchesName = student.name.toLowerCase().includes(searchText);
    // 8. فلتر الناجحين فقط (العلامة >= 50)
    const matchesPass = showPassedOnly ? Number(student.grade) >= 50 : true;
    return matchesName && matchesPass;
  });

  displayStudents(filtered);
}

// عرض الطلاب في الجدول وتحديث العداد
function displayStudents(data) {
  const tbody = document.getElementById("students-table-body");
  const countSpan = document.getElementById("student-count");
  const noResultsMsg = document.getElementById("no-results-msg");

  tbody.innerHTML = "";
  
  // 6. تحديث عداد الطلاب
  countSpan.textContent = data.length;

  // 8. إظهار رسالة عند عدم وجود نتائج
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

// 2 و 3. إضافة طالب جديد أو حفظ تعديل طالب موجود
document.getElementById("student-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("student-id").value;
  const studentData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    grade: Number(document.getElementById("grade").value),
  };

  try {
    if (id) {
      // تعديل طالب موجود (PUT)
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
    } else {
      // إضافة طالب جديد (POST)
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
    }

    resetForm();
    getStudents(); // إعادة جلب البيانات المحدثة
  } catch (error) {
    console.error("خطأ أثناء الحفظ:", error);
  }
});

// تعبئة النموذج ببيانات الطالب عند الضغط على زر "تعديل"
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

// إعادة ضبط النموذج لوضع الإضافة
function resetForm() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("form-title").textContent = "إضافة طالب جديد";
  document.getElementById("submit-btn").textContent = "إضافة طالب";
  document.getElementById("cancel-btn").style.display = "none";
}

// 4. حذف طالب (DELETE)
async function deleteStudent(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    getStudents();
  } catch (error) {
    console.error("خطأ أثناء الحذف:", error);
  }
}

// 7. ترتيب الطلاب حسب العلامة (تنازلياً)
function sortByGrade() {
  allStudents.sort((a, b) => Number(b.grade) - Number(a.grade));
  filterAndDisplay();
}

// 8. تفعيل أو إلغاء عرض الناجحين فقط
function togglePassedOnly() {
  showPassedOnly = !showPassedOnly;
  const btn = document.getElementById("passed-btn");
  btn.textContent = showPassedOnly ? "عرض الجميع" : "عرض الناجحين فقط (50+)";
  filterAndDisplay();
}

// إعادة ضبط الفلاتر والبحث
function resetFilters() {
  document.getElementById("search-input").value = "";
  showPassedOnly = false;
  document.getElementById("passed-btn").textContent = "عرض الناجحين فقط (50+)";
  getStudents();
}

// تشغيل الجلب عند فتح الصفحة
getStudents();