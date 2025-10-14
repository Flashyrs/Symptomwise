/**
 * Enhanced Form Validation Library for SymptomWise
 * Provides comprehensive validation for appointment booking and registration forms
 */

class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.errors = {};
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showErrors();
            }
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupRealTimeValidation() {
        // Phone number formatting
        const phoneInputs = this.form.querySelectorAll('input[type="tel"], input[name="phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Remove non-digits
                let value = e.target.value.replace(/\D/g, '');
                // Limit to 10 digits
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                e.target.value = value;
                this.validateField(e.target);
            });
        });

        // ZIP code formatting
        const zipInputs = this.form.querySelectorAll('input[name="zipcode"]');
        zipInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Remove non-digits
                let value = e.target.value.replace(/\D/g, '');
                // Limit to 6 digits
                if (value.length > 6) {
                    value = value.slice(0, 6);
                }
                e.target.value = value;
                this.validateField(e.target);
            });
        });

        // Name fields - only letters and spaces
        const nameInputs = this.form.querySelectorAll('input[name="first_name"], input[name="last_name"]');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Remove non-letters and non-spaces
                let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                e.target.value = value;
                this.validateField(e.target);
            });
        });
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        delete this.errors[fieldName];

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required`;
        }

        // Specific field validations
        if (value && isValid) {
            switch (fieldName) {
                case 'first_name':
                case 'last_name':
                    if (!/^[A-Za-z\s]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Only letters and spaces are allowed';
                    } else if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Must be at least 2 characters long';
                    }
                    break;

                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;

                case 'phone':
                    if (!/^[6-9][0-9]{9}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
                    }
                    break;

                case 'zipcode':
                    if (!/^[1-9][0-9]{5}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Enter a valid 6-digit pincode (cannot start with 0)';
                    }
                    break;

                case 'username':
                    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Username must start with a letter and contain only letters, numbers, underscore, and hyphen';
                    } else if (value.length < 3 || value.length > 30) {
                        isValid = false;
                        errorMessage = 'Username must be between 3 and 30 characters';
                    }
                    break;

                case 'password':
                    const passwordStrength = this.checkPasswordStrength(value);
                    if (passwordStrength.score < 4) {
                        isValid = false;
                        errorMessage = 'Password must contain uppercase, lowercase, number, and special character';
                    }
                    break;

                case 'confirm_password':
                    const passwordField = this.form.querySelector('input[name="password"]');
                    if (passwordField && value !== passwordField.value) {
                        isValid = false;
                        errorMessage = 'Passwords do not match';
                    }
                    break;

                case 'date_of_birth':
                    const dob = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    if (dob > today) {
                        isValid = false;
                        errorMessage = 'Date of birth cannot be in the future';
                    } else if (age > 120) {
                        isValid = false;
                        errorMessage = 'Please enter a valid date of birth';
                    }
                    break;

                case 'date':
                    const appointmentDate = new Date(value);
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    if (appointmentDate < currentDate) {
                        isValid = false;
                        errorMessage = 'Appointment date cannot be in the past';
                    }
                    break;
            }
        }

        // Update field appearance
        this.updateFieldAppearance(field, isValid, errorMessage);

        if (!isValid) {
            this.errors[fieldName] = errorMessage;
        }

        return isValid;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Check checkboxes
        const checkboxes = this.form.querySelectorAll('input[type="checkbox"][required]');
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                isValid = false;
                this.errors[checkbox.name] = 'This field is required';
                this.updateFieldAppearance(checkbox, false, 'This field is required');
            }
        });

        return isValid;
    }

    updateFieldAppearance(field, isValid, errorMessage) {
        // Remove existing classes
        field.classList.remove('is-valid', 'is-invalid');

        // Add appropriate class
        if (field.value.trim()) {
            field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }

        // Handle error message display
        let errorDiv = field.parentNode.querySelector('.invalid-feedback, .error-message');
        
        if (!isValid && errorMessage) {
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback error-message';
                field.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        } else if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-valid', 'is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback, .error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        delete this.errors[field.name];
    }

    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.replace('*', '').trim();
        }
        return field.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showErrors() {
        if (Object.keys(this.errors).length > 0) {
            const errorMessages = Object.values(this.errors).join('\n');
            alert('Please correct the following errors:\n\n' + errorMessages);
            
            // Focus on first error field
            const firstErrorField = this.form.querySelector('.is-invalid');
            if (firstErrorField) {
                firstErrorField.focus();
            }
        }
    }

    checkPasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[^a-zA-Z\d]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        return { score, checks };
    }
}

// Auto-initialize form validation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize for forms with data-validate attribute
    const forms = document.querySelectorAll('form[data-validate="true"]');
    forms.forEach(form => {
        new FormValidator(`#${form.id}`);
    });

    // Initialize for specific forms
    if (document.getElementById('appointmentForm')) {
        new FormValidator('#appointmentForm');
    }
    
    if (document.getElementById('registerForm')) {
        new FormValidator('#registerForm');
    }
});

// Export for manual initialization
window.FormValidator = FormValidator;