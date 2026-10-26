let products = document.getElementById("products");

let subtotal = 0;
let couponApplied = false;
let gateClosed = false;

let Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

let ROW_CLASS =
    "product-row mb-3 grid grid-cols-[minmax(0,1fr)_95px_38px] gap-1.5 sm:grid-cols-[1fr_130px_45px] sm:gap-2.5";
let INPUT_CLASS =
    "w-full min-w-0 rounded-lg border border-slate-300 px-[7px] py-2.5 text-[13px] outline-none focus:border-blue-600 sm:p-3 sm:text-[15px]";
let ADD_BTN_CLASS =
    "add-btn rounded-lg bg-green-600 p-[5px] text-[21px] font-bold text-white sm:text-[23px]";
let REMOVE_BTN_CLASS =
    "remove-btn rounded-lg bg-red-100 p-[5px] text-[21px] font-bold text-red-600 sm:text-[23px]";
let ITEM_CLASS =
    "invoice-item flex justify-between gap-3 border-b border-slate-200 py-[13px]";

function addProduct() {
    let row = document.createElement("div");
    row.className = ROW_CLASS;

    row.innerHTML = `
        <input type="text" class="product-name ${INPUT_CLASS}"
               placeholder="اسم المنتج">

        <input type="number" class="product-price ${INPUT_CLASS}"
               placeholder="السعر" min="0" step="any">

        <button class="${REMOVE_BTN_CLASS}"
                onclick="this.parentElement.remove()"
                title="حذف المنتج">×</button>
    `;

    products.appendChild(row);

    let addButton = document.createElement("button");
    addButton.className = ADD_BTN_CLASS;
    addButton.textContent = "+";
    addButton.title = "إضافة منتج";
    addButton.onclick = addProduct;

    row.replaceChild(addButton, row.lastElementChild);
}

function createInvoice() {
    let rows = document.querySelectorAll(".product-row");
    let invoiceItems = document.getElementById("invoiceItems");

    let hasError = false;

    rows.forEach(row => {
        let name = row.querySelector(".product-name").value.trim();
        let priceInput = row.querySelector(".product-price");
        let price = Number(priceInput.value);

        if (!name || priceInput.value.trim() === ""
            || !Number.isFinite(price) || price < 0) {
            hasError = true;
        }
    });

    if (hasError) {
        Swal.fire({
            title: "Error!",
            text: "Please fill all fields!",
            icon: "error"
        });
        return;
    }

    invoiceItems.innerHTML = "";
    subtotal = 0;

    rows.forEach(row => {
        let name = row.querySelector(".product-name").value.trim();
        let price = Number(row.querySelector(".product-price").value);

        subtotal += price;

        let item = document.createElement("div");
        item.className = ITEM_CLASS;

        let productName = document.createElement("span");
        productName.textContent = name;

        let productPrice = document.createElement("strong");
        productPrice.textContent = formatMoney(price);

        item.append(productName, productPrice);
        invoiceItems.appendChild(item);
    });

    couponApplied = false;
    gateClosed = false;

    document.getElementById("closeGate").textContent = "سكر المعبر";
    document.getElementById("couponCode").value = "";
    document.getElementById("couponArea").style.display = "none";
    document.getElementById("couponMessage").textContent = "";
    document.getElementById("gateIncrease").textContent = formatMoney(0);
    document.getElementById("subtotal").textContent = formatMoney(subtotal);

    document.getElementById("invoice").style.display = "block";

    updateTotals();

    document.getElementById("invoice").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function toggleCoupon() {
    let area = document.getElementById("couponArea");

    area.style.display = area.style.display === "block" ? "none" : "block";
}

function applyCoupon() {
    let code = document.getElementById("couponCode").value.trim();

    if (code === "ABC123") {
        couponApplied = true;

        Toast.fire({
            icon: "success",
            title: "تم تطبيق خصم 20% بنجاح!"
        });
    } else {
        couponApplied = false;

        Toast.fire({
            icon: "error",
            title: "الكوبون غير صحيح."
        });
    }

    updateTotals();
}

document.getElementById("closeGate").addEventListener("click", () => {
    if (document.getElementById("invoice").style.display !== "block") {
        alert("أنشئ الفاتورة أولًا.");
        return;
    }

    gateClosed = !gateClosed;

    document.getElementById("closeGate").textContent =
        gateClosed ? "إلغاء سكر المعبر" : "سكر المعبر";

    updateTotals();
});

function updateTotals() {
    let discount = couponApplied ? subtotal * 0.20 : 0;
    let afterDiscount = subtotal - discount;

    let finalTotal = gateClosed ? afterDiscount * 1.5 : afterDiscount;
    let increase = finalTotal - afterDiscount;
    document.getElementById("discount").textContent = formatMoney(discount);
    document.getElementById("gateIncrease").textContent = formatMoney(increase);
    document.getElementById("finalTotal").textContent = formatMoney(finalTotal);
}

function formatMoney(amount) {
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}






