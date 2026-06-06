import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* Firebase Config */

const firebaseConfig = {
    apiKey: "AIzaSyA6M-wCOH81zQsQq_cCz6qFlDiNfNw3hUs",
    authDomain: "inve-sto-manegment.firebaseapp.com",
    projectId: "inve-sto-manegment",
    storageBucket: "inve-sto-manegment.firebasestorage.app",
    messagingSenderId: "275212080566",
    appId: "1:275212080566:web:d548683dbce730dc805d17"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let products = [];
let editId = null;

/* Auth Check */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadProducts();

});

/* Add / Update Product */

window.addProduct = async function () {

    const name =
        document.getElementById("productName").value.trim();

    const qty =
        parseInt(document.getElementById("quantity").value);

    const price =
        parseFloat(document.getElementById("price").value);

    const gstPercent =
        parseFloat(document.getElementById("gst").value);

    if (
        !name ||
        isNaN(qty) ||
        isNaN(price) ||
        isNaN(gstPercent)
    ) {
        alert("Fill All Fields");
        return;
    }

    const gstAmount =
        (price * qty * gstPercent) / 100;

    const total =
        (price * qty) + gstAmount;

    const productData = {

        date: new Date().toLocaleDateString(),

        createdAt: Date.now(),

        name,
        qty,
        price,
        gstPercent,
        gstAmount,
        total

    };

    try {

        if (editId) {

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "products",
                    editId
                ),
                productData
            );

            editId = null;

            document.querySelector(
                ".form-box button"
            ).innerText = "Add Product";

        } else {

            await addDoc(
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "products"
                ),
                productData
            );

        }

        clearForm();

        await loadProducts();

    } catch (error) {

        alert(error.message);

    }

};

/* Load Products */

async function loadProducts() {

    products = [];

    const snapshot =
        await getDocs(
            collection(
                db,
                "users",
                currentUser.uid,
                "products"
            )
        );

    snapshot.forEach((docSnap) => {

        products.push({
            id: docSnap.id,
            ...docSnap.data()
        });

    });

    products.sort(
        (a, b) => b.createdAt - a.createdAt
    );

    displayProducts();

}

/* Display Products */

function displayProducts() {

    const table =
        document.getElementById("tableBody");

    table.innerHTML = "";

    let grandTotal = 0;
    let totalQty = 0;
    let lowStock = 0;

    products.forEach((p, index) => {

        grandTotal += p.total;
        totalQty += p.qty;

        if (p.qty <= 5) {
            lowStock++;
        }

        table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${p.date}</td>
            <td>${p.name}</td>
            <td>${p.qty}</td>
            <td>₹${p.price}</td>
            <td>${p.gstPercent}%</td>
            <td>₹${p.gstAmount.toFixed(2)}</td>
            <td>₹${p.total.toFixed(2)}</td>

            <td class="${
                p.qty <= 5
                ? "low"
                : "stock"
            }">
                ${
                    p.qty <= 5
                    ? "Low Stock"
                    : "In Stock"
                }
            </td>

            <td>

                <button
                class="edit"
                onclick="editProduct('${p.id}')">
                Edit
                </button>

                <button
                class="delete"
                onclick="deleteProduct('${p.id}')">
                Delete
                </button>

            </td>
        </tr>
        `;

    });

    document.getElementById(
        "totalProducts"
    ).innerText = products.length;

    document.getElementById(
        "totalQty"
    ).innerText = totalQty;

    document.getElementById(
        "lowStock"
    ).innerText = lowStock;

    document.getElementById(
        "grandTotal"
    ).innerText =
        "₹" + grandTotal.toFixed(2);

}

/* Edit */

window.editProduct = function (id) {

    const p =
        products.find(
            item => item.id === id
        );

    if (!p) return;

    document.getElementById(
        "productName"
    ).value = p.name;

    document.getElementById(
        "quantity"
    ).value = p.qty;

    document.getElementById(
        "price"
    ).value = p.price;

    document.getElementById(
        "gst"
    ).value = p.gstPercent;

    editId = id;

    document.querySelector(
        ".form-box button"
    ).innerText = "Update Product";

};

/* Delete */

window.deleteProduct =
async function (id) {

    if (!confirm("Delete Product?"))
        return;

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "products",
                id
            )
        );

        await loadProducts();

    } catch (error) {

        alert(error.message);

    }

};

/* Clear Form */

function clearForm() {

    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "quantity"
    ).value = "";

    document.getElementById(
        "price"
    ).value = "";

    document.getElementById(
        "gst"
    ).value = "";

}

/* Search */

window.searchProduct = function () {

    const filter =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    document
        .querySelectorAll("#tableBody tr")
        .forEach(row => {

            row.style.display =
                row.innerText
                .toLowerCase()
                .includes(filter)
                ? ""
                : "none";

        });

};

/* PDF */

window.downloadPDF = function () {

    if (products.length === 0) {

        alert("No Products Found");

        return;

    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let grandTotal = 0;

    products.forEach(p => {
        grandTotal += p.total;
    });

    pdf.text(
        "Inventory Report",
        14,
        15
    );

    pdf.autoTable({

        startY: 25,

        head: [[
            "Sr",
            "Date",
            "Product",
            "Qty",
            "Price",
            "GST %",
            "Total"
        ]],

        body: products.map(
        (p, i) => [
        i + 1,
        p.date,
        p.name,
        p.qty,
        "Rs. " + p.price.toFixed(2),
        p.gstPercent + "%",
        "Rs. " + p.total.toFixed(2)
        ]
    )

    });

    pdf.text(
        "Grand Total : Rs. " +
        grandTotal.toFixed(2),
        14,
        pdf.lastAutoTable.finalY + 15
    );

    pdf.save(
        "Inventory_Report.pdf"
    );

};

/* Logout */

window.logoutUser =
async function () {

    await signOut(auth);

    window.location.href =
        "login.html";

};

/* Clock */

setInterval(() => {

    const clock =
        document.getElementById("clock");

    if (clock) {

        clock.innerHTML =
            new Date()
            .toLocaleString();

    }

}, 1000);