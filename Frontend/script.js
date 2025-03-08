const API_URL = "http://localhost:5000";

async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (res.ok) alert("Signup successful! Now login.");
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", JSON.parse(atob(data.token.split('.')[1])).userId);
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("expense-section").style.display = "block";
        loadExpenses();
    } else {
        alert(data.message);
    }
}

async function addExpense() {
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const userId = localStorage.getItem("userId");

    await fetch(`${API_URL}/expense`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userId, title, amount }),
    });

    loadExpenses();
}

async function loadExpenses() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`${API_URL}/expenses/${userId}`);
    const data = await res.json();

    document.getElementById("total").innerText = data.total;
    document.getElementById("expense-list").innerHTML = data.expenses.map(exp =>
        `<li>${exp.title} - $${exp.amount}</li>`
    ).join("");
}
