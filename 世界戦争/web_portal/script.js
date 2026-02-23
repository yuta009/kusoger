function openChar(evt, charName) {
    var i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove('active');
    }

    // Remove active class from all tab links
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(charName).style.display = "block";
    // Use timeout to allow display:block to apply before adding class for animation
    setTimeout(() => {
        document.getElementById(charName).classList.add('active');
    }, 10);

    evt.currentTarget.className += " active";
}

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
});

// Add fade-in class to elements you want to animate on scroll
// (Currently basic styles handle this, but can extend here)
console.log("World War Portal Site Loaded");
