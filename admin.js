// Get dashboard elements
const bookingList = document.getElementById("bookingList");
const searchInput = document.getElementById("searchBooking");
const filterStatus = document.getElementById("filterStatus");

// Get saved bookings
let bookings = JSON.parse(
    localStorage.getItem("hallBookings") || "[]"
);

// Update dashboard summary
function updateSummary() {
    document.getElementById("totalBookings").textContent = bookings.length;

    document.getElementById("pendingBookings").textContent =
        bookings.filter(b => !b.status || b.status === "Pending").length;

    document.getElementById("approvedBookings").textContent =
        bookings.filter(b => b.status === "Approved").length;

    document.getElementById("rejectedBookings").textContent =
        bookings.filter(b => b.status === "Rejected").length;
}

// Display bookings
function displayBookings() {
    bookingList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = filterStatus.value;

    const filteredBookings = bookings.filter(function(booking) {
        const name = (booking.name || "").toLowerCase();
        const phone = (booking.phone || "").toLowerCase();
        const bookingId = (booking.bookingId || "").toLowerCase();
        const status = booking.status || "Pending";

        const matchesSearch =
            name.includes(searchText) ||
            phone.includes(searchText) ||
            bookingId.includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredBookings.length === 0) {
        bookingList.textContent = "No matching bookings found.";
        updateSummary();
        return;
    }

    filteredBookings.forEach(function(booking) {
        const index = bookings.indexOf(booking);

        const card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.padding = "15px";
        card.style.marginBottom = "15px";
        card.style.borderRadius = "8px";

        // Customer name
        const heading = document.createElement("h3");
        heading.textContent = booking.name;
        card.appendChild(heading);

        // Booking reference number
        const reference = document.createElement("p");
        reference.style.fontWeight = "bold";
        reference.style.color = "green";
        reference.textContent =
            "Booking Reference: " +
            (booking.bookingId || "Not available");
        card.appendChild(reference);

        // Booking details
        function addDetail(label, value) {
            const p = document.createElement("p");
            p.textContent = label + ": " + (value || "");
            card.appendChild(p);
        }

        addDetail("Phone", booking.phone);
        addDetail("Email", booking.email);
        addDetail("Hall", booking.hall);
        addDetail("Event", booking.eventType);
        addDetail("Date", booking.date);
        addDetail("Start Time", booking.startTime);
        addDetail("End Time", booking.endTime);
        addDetail("Guests", booking.guests);
        addDetail("Requirements", booking.requirements);
        addDetail("Status", booking.status || "Pending");

        // Approve button
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";

        approveButton.onclick = function() {
    bookings[index].status = "Approved";
    bookings[index].notification =
        "Congratulations! Your Community Hall booking has been confirmed successfully. Thank you for choosing us!";

    saveBookings();

    alert("Booking approved successfully!");
};

        // Reject button
        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.onclick = function() {
    bookings[index].status = "Rejected";
    bookings[index].notification =
        "Sorry! Your Community Hall booking request has been rejected. Please contact the administrator for more information.";

    saveBookings();

    alert("Booking rejected successfully!");
};
  
        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            const confirmDelete = confirm(
                "Are you sure you want to delete this booking?"
            );

            if (confirmDelete) {
                bookings.splice(index, 1);
                saveBookings();
            }
        };

        card.appendChild(approveButton);
        card.appendChild(rejectButton);
        card.appendChild(deleteButton);

        bookingList.appendChild(card);
    });

    updateSummary();
}

// Save bookings
function saveBookings() {
    localStorage.setItem(
        "hallBookings",
        JSON.stringify(bookings)
    );

    displayBookings();
}

// Download bookings backup
const downloadButton = document.getElementById("downloadBookings");

if (downloadButton) {
    downloadButton.addEventListener("click", function() {
        const savedBookings = localStorage.getItem("hallBookings") || "[]";

        const file = new Blob([savedBookings], {
            type: "application/json"
        });

        const url = URL.createObjectURL(file);
        const link = document.createElement("a");

        link.href = url;
        link.download = "community-hall-bookings-backup.json";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 1000);
    });
}

// Listen for search and filter changes
searchInput.addEventListener("input", displayBookings);
filterStatus.addEventListener("change", displayBookings);

// Display bookings when page opens
displayBookings();
document.getElementById("logoutButton")
.addEventListener("click", function() {

    sessionStorage.removeItem("adminAuthenticated");

    window.location.href = "admin-login.html";

});
