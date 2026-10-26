let products = document.getElementById("products");
let subtotal = 0, couponApplied = false, gateClosed = false;

const Toast = Swal.mixin({
    toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const CLASSES = {
    row: "product-row mb-3 grid grid-cols-[minmax(0,1fr)_95px_38px] gap-1.5 sm:grid-cols-[1fr_130px_45px] sm:gap-2.5",
    input: "w-full min-w-0 rounded-lg border border-slate-300 px-[7px] py-2.5 text-[13px] outline-none focus:border-blue-600 sm:p-3 sm:text-[15px]",
    addBtn: "add-btn rounded-lg bg-green-600 p-[5px] text-[21px] font-bold text-white sm:text-[23px]",
    removeBtn: "remove-btn rounded-lg bg-red-100 p-[5px] text-[21px] font-bold text-red-600 sm:text-[23px]",
    item: "invoice-item flex justify-between gap-3 border-b border-slate-200 py-[13px]"
};

function addProduct() {
    let row = document.createElement("div");
    row.className = CLASSES.row;
    row.innerHTML = `
        <input type="text" class="product-name ${CLASSES.input}" placeholder="اسم المنتج">
        <input type="number" class="product-price ${CLASSES.input}" placeholder="السعر" min="0" step="any">
        <button class="${CLASSES.addBtn}" type="button" onclick="addProduct()">+</button>
    `;
    
    // استبدال زر الإضافة السابق بزر حذف
    let prevBtn = products.querySelector(".add-btn");
    if (prevBtn) {
        prevBtn.className = CLASSES.removeBtn;
        prevBtn.textContent = "×";
        prevBtn.title = "حذف المنتج";
        prevBtn.onclick = function() { this.parentElement.remove(); };
    }

    products.appendChild(row);
}

function createInvoice() {
    let rows = document.querySelectorAll(".product-row");
    if (!rows.length) return showError("أضف منتجًا واحدًا على الأقل.");

    let valid = true;
    rows.forEach(row => {
        let name = row.querySelector(".product-name").value.trim();
        let price = Number(row.querySelector(".product-price").value);
        if (!name || isNaN(price) || price < 0 || row.querySelector(".product-price").value.trim() === "") valid = false;
    });

    if (!valid) return showError("يرجى تعبئة جميع الحقول بشكل صحيح.");

    let invoiceItems = document.getElementById("invoiceItems");
    invoiceItems.innerHTML = "";
    subtotal = 0;

    rows.forEach(row => {
        let name = row.querySelector(".product-name").value.trim();
        let price = Number(row.querySelector(".product-price").value);
        subtotal += price;

        invoiceItems.innerHTML += `
            <div class="${CLASSES.item}">
                <span>${name}</span>
                <strong>${formatMoney(price)}</strong>
            </div>
        `;
    });

    couponApplied = false;
    gateClosed = false;

    document.getElementById("closeGate").textContent = "سكر المعبر";
    document.getElementById("couponCode").value = "";
    document.getElementById("couponArea").style.display = "none";
    document.getElementById("subtotal").textContent = formatMoney(subtotal);
    document.getElementById("invoice").style.display = "block";

    updateTotals();
    document.getElementById("invoice").scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleCoupon() {
    let area = document.getElementById("couponArea");
    area.style.display = area.style.display === "block" ? "none" : "block";
}

function applyCoupon() {
    couponApplied = document.getElementById("couponCode").value.trim() === "ABC123";
    Toast.fire({
        icon: couponApplied ? "success" : "error",
        title: couponApplied ? "تم تطبيق خصم 20% بنجاح!" : "الكوبون غير صحيح."
    });
    updateTotals();
}

document.getElementById("closeGate").addEventListener("click", () => {
    if (document.getElementById("invoice").style.display !== "block") return alert("أنشئ الفاتورة أولًا.");
    gateClosed = !gateClosed;
    document.getElementById("closeGate").textContent = gateClosed ? "إلغاء سكر المعبر" : "سكر المعبر";
    updateTotals();
});

function updateTotals() {
    let discount = couponApplied ? subtotal * 0.2 : 0;
    let afterDiscount = subtotal - discount;
    let increase = gateClosed ? afterDiscount * 1.5 : 0;

    document.querySelectorAll(".product-row").forEach((row, index) => {
        let price = Number(row.querySelector(".product-price").value) * (gateClosed ? 2.5 : 1);
        let item = document.querySelectorAll(".invoice-item")[index];
        if (item) item.querySelector("strong").textContent = formatMoney(price);
    });

    document.getElementById("discount").textContent = formatMoney(discount);
    document.getElementById("gateIncrease").textContent = formatMoney(increase);
    document.getElementById("finalTotal").textContent = formatMoney(afterDiscount + increase);
}

const formatMoney = (amount) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const showError = (text) => Swal.fire({ title: "خطأ!", text, icon: "error" });