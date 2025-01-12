// Initialize EmailJS
(function() {
    // Replace with your EmailJS public key
    emailjs.init("m5wM5wWm3XTfjUmeV");
})();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const message = this.querySelector('textarea[name="message"]').value;

        // Validate form fields
        if (!name || !email || !message) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Please fill in all fields';
            contactForm.insertBefore(errorMessage, this.querySelector('button[type="submit"]'));
            
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Send email using EmailJS
        const templateParams = {
            from_name: name,
            reply_to: email,
            message: message,
            to_name: "Chiemeka"
        };
        
        console.log('Sending email with params:', templateParams);
        console.log('Service ID:', "service_rnoeqqu");
        console.log('Template ID:', "template_3envigm");
        
        emailjs.send(
            "service_rnoeqqu",
            "template_3envigm",
            templateParams
        )
        .then(() => {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for your message! I will get back to you soon.';
            
            // Insert at the top of the form
            contactForm.insertBefore(successMessage, contactForm.firstChild);
            
            // Scroll the message into view
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Clear form
            contactForm.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        })
        .catch((error) => {
            console.error('EmailJS Error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Oops! There was an error sending your message. Please try again later.';
            
            // Make sure we're inserting before the submit button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            contactForm.insertBefore(errorMessage, submitBtn);
            
            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
}

// Add active class to nav items on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Scroll animation for about section
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target); // Stop observing once animation is triggered
        }
    });
}, observerOptions);

// Start observing about section paragraphs
document.addEventListener('DOMContentLoaded', () => {
    const aboutParagraphs = document.querySelectorAll('#about p');
    aboutParagraphs.forEach((p, index) => {
        observer.observe(p);
    });
});
