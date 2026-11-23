console.log("JavaScript is connected!");

// Get form elements
const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

const hallInput = document.getElementById("hall");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");

// Get the EXISTING availability button from booking.html
const checkAvailabilityBtn = document.getElementById("checkAvailabilityBtn");
const availabilityMessage = document.getElementById("availabilityMessage");

// Get status checker elements
const bookingReference = document.getElementById("bookingReference");
const checkStatusBtn = document.getElementById("checkStatusBtn");
const statusMessage = document.getElementById("statusMessage");
const receiptArea = document.getElementById("receiptArea");

// Safely display information
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

// Get saved bookings
function getBookings() {
    try {
        const saved = JSON.parse(localStorage.getItem("hallBookings") || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

// Save bookings
function saveBookings(bookings) {
    localStorage.setItem("hallBookings", JSON.stringify(bookings));
}

// Get today's date
const now = new Date();
const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");

if (dateInput) {
    dateInput.min = today;
}

// Check whether the hall is already booked
function hasBookingConflict(hall, date, startTime, endTime) {
    const bookings = getBookings();

    return bookings.some(function(booking) {
        const status = booking.status || "Pending";

        return (
            booking.hall === hall &&
            booking.date === date &&
            status !== "Rejected" &&
            startTime < booking.endTime &&
            endTime > booking.startTime
        );
    });
}

// CHECK HALL AVAILABILITY
if (checkAvailabilityBtn) {

    checkAvailabilityBtn.addEventListener("click", function() {

        const hall = hallInput.value;
        const date = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        if (!hall || !date || !startTime || !endTime) {
            availabilityMessage.style.color = "red";
            availabilityMessage.textContent =
                "Please select a hall, date, starting time and ending time.";
            return;
        }

        if (date < today) {
            availabilityMessage.style.color = "red";
            availabilityMessage.textContent =
                "Please select today or a future date.";
            return;
        }

        if (endTime <= startTime) {
            availabilityMessage.style.color = "red";
            availabilityMessage.textContent =
                "Ending time must be later than starting time.";
            return;
        }

        const conflict = hasBookingConflict(
            hall, date, startTime, endTime
        );

        if (conflict) {
            availabilityMessage.style.color = "red";
            availabilityMessage.textContent =
                "Sorry! This hall is NOT AVAILABLE at this date and time. Please choose another time or hall.";
        } else {
            availabilityMessage.style.color = "green";
            availabilityMessage.textContent =
                "Great! This hall is AVAILABLE. You can submit your booking request.";
        }
    });
}

// SUBMIT BOOKING REQUEST
if (bookingForm) {

    bookingForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const hall = hallInput.value;
        const eventType = document.getElementById("event").value;
        const date = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const guests = document.getElementById("guests").value;
        const requirements = document.getElementById("requirements").value;

        if (date < today) {
            formMessage.style.color = "red";
            formMessage.textContent = "Please select today or a future date.";
            return;
        }

        if (endTime <= startTime) {
            formMessage.style.color = "red";
            formMessage.textContent =
                "Ending time must be later than starting time.";
            return;
        }

        if (hasBookingConflict(hall, date, startTime, endTime)) {
            formMessage.style.color = "red";
            formMessage.textContent =
                "Sorry! This hall is already booked or has a pending request during that time.";
            return;
        }

        const bookings = getBookings();

        const bookingId = "CHB-" + Date.now();

        const booking = {
            bookingId: bookingId,
            name: name,
            phone: phone,
            email: email,
            hall: hall,
            eventType: eventType,
            date: date,
            startTime: startTime,
            endTime: endTime,
            guests: guests,
            requirements: requirements,
            status: "Pending"
        };

        bookings.push(booking);
        saveBookings(bookings);

        formMessage.style.color = "green";
        formMessage.textContent =
            "Thank you, " + name +
            "! Your booking request has been saved. Your reference number is: " +
            bookingId;

        bookingForm.reset();
        dateInput.min = today;

        availabilityMessage.textContent = "";
    });
}

// CUSTOMER BOOKING STATUS CHECKER
if (checkStatusBtn) {

    checkStatusBtn.addEventListener("click", function() {

        const enteredReference = bookingReference.value.trim();

        receiptArea.innerHTML = "";

        if (!enteredReference) {
            statusMessage.style.color = "red";
            statusMessage.textContent =
                "Please enter your booking reference number.";
            return;
        }

        const bookings = getBookings();

        const foundBooking = bookings.find(function(booking) {
            return booking.bookingId &&
                booking.bookingId.toLowerCase() ===
                enteredReference.toLowerCase();
        });

        if (!foundBooking) {
            statusMessage.style.color = "red";
            statusMessage.textContent =
                "Booking not found. Please check your reference number.";
            return;
        }

        statusMessage.style.color = "green";

        const currentStatus = foundBooking.status || "Pending";

let notificationColor = "#b7791f";
let notificationMessage =
    "Your booking request has been received and is waiting for admin approval.";

if (currentStatus === "Approved") {
    notificationColor = "green";
    notificationMessage =
        foundBooking.notification ||
        "Congratulations! Your Community Hall booking has been confirmed successfully. Thank you for choosing us!";
} 
else if (currentStatus === "Rejected") {
    notificationColor = "red";
    notificationMessage =
        foundBooking.notification ||
        "Sorry! Your booking request has been rejected. Please contact the administrator for further information.";
}

statusMessage.innerHTML =
    "<h3>Booking Details</h3>" +
    "<p><strong>Customer:</strong> " +
    escapeHTML(foundBooking.name) + "</p>" +
    "<p><strong>Hall:</strong> " +
    escapeHTML(foundBooking.hall) + "</p>" +
    "<p><strong>Booking Date:</strong> " +
    escapeHTML(foundBooking.date) + "</p>" +
    "<p><strong>Reference Number:</strong> " +
    escapeHTML(foundBooking.bookingId) + "</p>" +
    "<p><strong>Booking Status:</strong> " +
    escapeHTML(currentStatus) + "</p>" +
    "<div style='background:#f0f7f0;padding:15px;border-radius:8px;margin-top:15px;color:" +
    notificationColor + "'>" +
    "<strong>Admin Message</strong><p>" +
    escapeHTML(notificationMessage) +
    "</p></div>";

        // Show receipt button only for approved bookings
        if (foundBooking.status === "Approved") {

            receiptArea.innerHTML =
                "<button type='button' id='printReceiptBtn'>Print Receipt</button>";

            document.getElementById("printReceiptBtn")
                .addEventListener("click", function() {

                    const b = {
                        bookingId: escapeHTML(foundBooking.bookingId),
                        name: escapeHTML(foundBooking.name),
                        phone: escapeHTML(foundBooking.phone),
                        email: escapeHTML(foundBooking.email),
                        hall: escapeHTML(foundBooking.hall),
                        eventType: escapeHTML(foundBooking.eventType),
                        date: escapeHTML(foundBooking.date),
                        startTime: escapeHTML(foundBooking.startTime),
                        endTime: escapeHTML(foundBooking.endTime),
                        guests: escapeHTML(foundBooking.guests),
                        requirements: escapeHTML(foundBooking.requirements || "None")
                    };

                    const receiptWindow = window.open("", "_blank");

                    if (!receiptWindow) {
                        alert("Please allow pop-ups to print your receipt.");
                        return;
                    }

                    receiptWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Community Hall Booking Receipt</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    padding: 30px;
                                    color: #222;
                                }
                                .receipt {
                                    max-width: 700px;
                                    margin: auto;
                                    border: 2px solid #17365d;
                                    padding: 30px;
                                }
                                .header {
                                    text-align: center;
                                    border-bottom: 3px solid #17365d;
                                    padding-bottom: 15px;
                                }
                                h1 { color: #17365d; }
                                .reference {
                                    text-align: center;
                                    padding: 15px;
                                    background: #eef4ff;
                                    margin: 20px 0;
                                    font-weight: bold;
                                }
                                .approved {
                                    color: green;
                                    text-align: center;
                                    font-weight: bold;
                                    font-size: 20px;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                td {
                                    padding: 12px 8px;
                                    border-bottom: 1px solid #ddd;
                                    overflow-wrap: anywhere;
                                }
                                td:first-child {
                                    font-weight: bold;
                                    width: 40%;
                                }
                                .footer {
                                    margin-top: 40px;
                                    text-align: center;
                                    border-top: 1px solid #aaa;
                                    padding-top: 15px;
                                }
                                @page {
                                    size: A4;
                                    margin: 15mm;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="receipt">
                                <div class="header">
                                    <h1>COMMUNITY HALL</h1>
                                    <p>Booking Management System</p>
                                </div>

                                <h2 style="text-align:center">
                                    BOOKING CONFIRMATION RECEIPT
                                </h2>

                                <div class="reference">
                                    BOOKING REF: ${b.bookingId}
                                </div>

                                <p class="approved">✓ APPROVED</p>

                                <table>
                                    <tr><td>Customer Name</td><td>${b.name}</td></tr>
                                    <tr><td>Mobile Number</td><td>${b.phone}</td></tr>
                                    <tr><td>Email Address</td><td>${b.email}</td></tr>
                                    <tr><td>Community Hall</td><td>${b.hall}</td></tr>
                                    <tr><td>Event Type</td><td>${b.eventType}</td></tr>
                                    <tr><td>Booking Date</td><td>${b.date}</td></tr>
                                    <tr><td>Starting Time</td><td>${b.startTime}</td></tr>
                                    <tr><td>Ending Time</td><td>${b.endTime}</td></tr>
                                    <tr><td>Number of Guests</td><td>${b.guests}</td></tr>
                                    <tr><td>Additional Requirements</td><td>${b.requirements}</td></tr>
                                </table>

                                <div style="display:flex;justify-content:space-between;margin-top:60px">
                                    <span>Customer Signature</span>
                                    <span>Authorized Signature</span>
                                </div>

                                <div class="footer">
                                    <p>Thank you for choosing Community Hall.</p>
                                    <p>Receipt Date: ${new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `);

                    receiptWindow.document.close();

                    receiptWindow.onload = function() {
                        receiptWindow.focus();
                        receiptWindow.print();
                    };
                });
        }
    });
}
// Community Hall Search Feature

document.addEventListener("DOMContentLoaded", function () {

    const hallSearch = document.getElementById("hallSearch");
    const hallCards = document.querySelectorAll(".hall-card");
    const noHallsMessage = document.getElementById("noHallsMessage");

    if (!hallSearch) return;

    hallSearch.addEventListener("input", function () {

        const searchText = hallSearch.value.toLowerCase().trim();
        let visibleCount = 0;

        hallCards.forEach(function (card) {

            const hallName = card.querySelector("h3")?.textContent.toLowerCase() || "";

            if (hallName.includes(searchText)) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }

        });

        if (noHallsMessage) {
            noHallsMessage.style.display =
                visibleCount === 0 ? "block" : "none";
        }

    });

});