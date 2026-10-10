
"use strict";

// Question 1: External JavaScript Alert
alert("Welcome to my first site");


// Question 2: Currency Exchange
function exchangeEgyPound(egyPound) {
    const exchangeRate = 30.9;
    return Math.round((egyPound / exchangeRate) * 10) / 10;
}

function testExchange() {
    console.log(exchangeEgyPound(2000)); // 64.7
    console.log(exchangeEgyPound(340));  // 11
}


// Question 3: Print numbers from 1 to 20
function printNumbers() {
    for (let i = 1; i <= 20; i++) {
        if (i % 2 === 0) {
            console.log("I'm even");
        } else {
            console.log(i);
        }
    }
}


// Question 4: Get and Validate User Information
function getUserInfo() {
    let firstName;
    let birthYear;
    let mobile;
    let color;

    // Validate first name: letters and spaces only
    while (true) {
        firstName = prompt("Enter your first name:");

        if (firstName === null) return;

        firstName = firstName.trim();

        if (/^[\p{L}\s]+$/u.test(firstName) && firstName !== "") {
            break;
        }

        alert("Invalid name! Enter letters only.");
    }

    // Validate birth year: greater than 1900
    while (true) {
        let input = prompt("Enter your birth year:");

        if (input === null) return;

        if (/^\d+$/.test(input.trim()) &&
            Number(input) > 1900 &&
            Number(input) <= new Date().getFullYear()) {
            birthYear = Number(input);
            break;
        }

        alert("Birth year must be greater than 1900 and not in the future.");
    }

    // Validate mobile number: exactly 11 digits
    while (true) {
        mobile = prompt("Enter your mobile number (11 digits):");

        if (mobile === null) return;

        mobile = mobile.trim();

        if (/^\d{11}$/.test(mobile)) {
            break;
        }

        alert("Mobile number must contain exactly 11 digits.");
    }

    // Validate color
    while (true) {
        color = prompt("Choose a color: red, green, or blue");

        if (color === null) return;

        color = color.trim().toLowerCase();

        if (["red", "green", "blue"].includes(color)) {
            break;
        }

        alert("Color must be red, green, or blue.");
    }

    // Calculate age using the current year
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // Display user information on the page
    const userInfo = document.getElementById("userInfo");

    userInfo.style.color = color;

    userInfo.innerHTML = `
        <h2>Welcome, ${firstName}!</h2>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Birth Year:</strong> ${birthYear}</p>
        <p><strong>Mobile Number:</strong> ${mobile}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Favorite Color:</strong> ${color}</p>
    `;
}


// Question 5: Equal Numbers
function equalFunc(a, b, c) {
    if (a === b && b === c) {
        return 3;
    }

    if (a === b || a === c || b === c) {
        return 2;
    }

    return 0;
}

function testEqualFunc() {
    console.log(equalFunc(3, 4, 3)); // 2
    console.log(equalFunc(1, 1, 1)); // 3
    console.log(equalFunc(3, 4, 1)); // 0
}


// Question 6: Sum until 0 or sum exceeds 50
function calculateSum() {
    let sum = 0;

    while (sum <= 50) {
        const input = prompt("Enter a number (0 to stop):");

        if (input === null) {
            break;
        }

        const valueText = input.trim();

        // Check that input is numeric and not empty
        if (valueText === "" || !Number.isFinite(Number(valueText))) {
            alert("Invalid input! Please enter a number.");
            continue;
        }

        const value = Number(valueText);

        if (value === 0) {
            break;
        }

        sum += value;
    }

    alert("The total sum is: " + sum);
}


// Question 7: Display message using h1 to h6 with a loop
function displayHeadings() {
    const message = prompt("Enter your message:");

    if (message === null) return;

    const container = document.getElementById("headings");
    container.replaceChildren();

    for (let i = 1; i <= 6; i++) {
        const heading = document.createElement("h" + i);

        heading.textContent = message;

        container.appendChild(heading);
    }
}
