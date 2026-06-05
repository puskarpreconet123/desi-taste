// Mobile drawer menu logic is handled globally and smoothly in js/navbar.js

// Form submission handler
function submitReservation(event) {
    event.preventDefault();
    
    const form = document.getElementById('standalone-booking-form');
    const successBox = document.getElementById('booking-success');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    
    if (!form) return;

    // Save original button state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Confirm Reservation Request';
    
    // Set loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="inline-flex items-center gap-2">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Request...
            </span>
        `;
    }

    // Hide success box from any previous attempt
    if (successBox) {
        successBox.classList.add('hidden');
    }

    const formData = new FormData(form);

    fetch('send_booking.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Read as text first to handle cases where the server outputs PHP warnings or non-JSON text
        return response.text().then(text => {
            try {
                return { ok: response.ok, status: response.status, data: JSON.parse(text) };
            } catch (e) {
                return { ok: false, status: response.status, rawText: text };
            }
        });
    })
    .then(result => {
        if (result.ok && result.data && result.data.success) {
            // Show custom success confirmation box
            if (successBox) {
                successBox.classList.remove('hidden');
                // Auto scroll to success box
                successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Reset the form inputs
            form.reset();
        } else {
            // Handle structured error from PHP validation, or generic server crash (HTTP 500 etc)
            const errorMessage = (result.data && result.data.error)
                ? result.data.error
                : `The booking server encountered an issue (HTTP ${result.status}). Please try again or contact the restaurant by phone.`;
            
            alert(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error submitting reservation:', error);
        alert('Could not contact the booking server. Please check your internet connection or call the restaurant directly.');
    })
    .finally(() => {
        // Restore button state
        if (submitBtn) {
            const agreeCheckbox = document.getElementById('booking-agree');
            submitBtn.disabled = agreeCheckbox ? !agreeCheckbox.checked : false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Set min date input to today
const bookingDate = document.getElementById('booking-date');
if (bookingDate) {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    bookingDate.min = today;
}

// Newsletter Subscription Handler
function handleNewsletterSubscribe(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    
    if (!input || !button) return;

    const originalBtnText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
        <span class="inline-flex items-center gap-1.5 justify-center">
            <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subscribing...
        </span>
    `;

    const formData = new FormData(form);

    fetch('subscribe_newsletter.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text().then(text => {
            try {
                return { ok: response.ok, status: response.status, data: JSON.parse(text) };
            } catch (e) {
                return { ok: false, status: response.status, rawText: text };
            }
        });
    })
    .then(result => {
        if (result.ok && result.data && result.data.success) {
            alert(result.data.message || 'Thank you for subscribing!');
            form.reset();
        } else {
            const errorMessage = (result.data && result.data.error)
                ? result.data.error
                : `Subscription service unavailable (Error ${result.status}). Please try again later.`;
            alert(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error subscribing to newsletter:', error);
        alert('Connection error. Please check your internet connection and try again.');
    })
    .finally(() => {
        button.disabled = false;
        button.innerHTML = originalBtnText;
    });
}

// Disable submit button on load, and toggle based on agreement checkbox
document.addEventListener('DOMContentLoaded', () => {
    const agreeCheckbox = document.getElementById('booking-agree');
    const form = document.getElementById('standalone-booking-form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    
    if (agreeCheckbox && submitBtn) {
        // Initial state
        submitBtn.disabled = !agreeCheckbox.checked;
        
        // Listen for changes
        agreeCheckbox.addEventListener('change', () => {
            submitBtn.disabled = !agreeCheckbox.checked;
        });
    }
});

