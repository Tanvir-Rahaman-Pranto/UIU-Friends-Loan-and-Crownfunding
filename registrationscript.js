// =============================================
//  UIU Friends Network - Registration Script
//  Submits form data to register.php via fetch()
// =============================================


// ── Element references ────────────────────────
const uploadBtn        = document.getElementById('uploadBtn');
const idUpload         = document.getElementById('idUpload');
const fileNameDisplay  = document.getElementById('fileName');
const registrationForm = document.getElementById('registrationForm');
const submitBtn        = document.getElementById('submitBtn');
const submitBtnText    = document.getElementById('submitBtnText');
const submitBtnIcon    = document.getElementById('submitBtnIcon');
const formBanner       = document.getElementById('formBanner');


// ── 1. File Upload ────────────────────────────
uploadBtn.addEventListener('click', () => idUpload.click());

idUpload.addEventListener('change', function () {
    const file = idUpload.files[0];
    if (file) {
        fileNameDisplay.textContent = '✓ ' + file.name;
        fileNameDisplay.style.display = 'block';
    } else {
        fileNameDisplay.style.display = 'none';
    }
});


// ── 2. Banner helper ──────────────────────────
function showBanner(message, type) {
    formBanner.textContent  = message;
    formBanner.className    = 'form-banner form-banner--' + type;
    formBanner.style.display = 'block';
    formBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideBanner() {
    formBanner.style.display = 'none';
}


// ── 3. Loading state helpers ──────────────────
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtnText.textContent = 'Submitting…';
        submitBtnIcon.textContent = 'hourglass_top';
    } else {
        submitBtnText.textContent = 'Submit for Verification';
        submitBtnIcon.textContent = 'arrow_forward';
    }
}


// ── 4. Client-side validation ─────────────────
function validate(fullName, studentId, emailUser, password, confirm) {
    if (!fullName || !studentId || !emailUser || !password || !confirm)
        return 'Please fill in all required fields.';

    if (!/^\d{10}$/.test(studentId))
        return 'Student ID must be exactly 10 digits (e.g. 0112010000).';

    if (!/^[a-zA-Z]+\d+$/.test(emailUser))
        return 'Email must match UIU format: letters followed by digits (e.g. tpranto2331028).';

    if (password.length < 8)
        return 'Password must be at least 8 characters long.';

    if (password !== confirm)
        return 'Passwords do not match. Please try again.';

    return null; // all good
}


// ── 5. Form submission → fetch to register.php ─
registrationForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideBanner();

    // Read field values
    const fullName        = document.getElementById('fullName').value.trim();
    const studentId       = document.getElementById('studentId').value.trim();
    const emailUser       = document.getElementById('emailUser').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone           = document.getElementById('phone').value.trim();
    const department      = document.getElementById('department').value;
    const idFile          = idUpload.files[0]; // may be undefined — that's fine

    // Client-side validation
    const validationError = validate(fullName, studentId, emailUser, password, confirmPassword);
    if (validationError) {
        showBanner(validationError, 'error');
        return;
    }

    // Build FormData — supports both text fields AND the optional file upload
    const formData = new FormData();
    formData.append('fullName',        fullName);
    formData.append('studentId',       studentId);
    formData.append('emailUser',       emailUser);
    formData.append('password',        password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('phone',           phone);
    formData.append('department',      department);

    // Only append the file if the user actually chose one
    if (idFile) {
        formData.append('idUpload', idFile, idFile.name);
    }

    setLoading(true);

    try {
        const response = await fetch('register.php', {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type manually — fetch sets it with the
            // correct multipart boundary when using FormData.
        });

        // Handle non-JSON responses gracefully
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error('Non-JSON response:', text);
            showBanner('Unexpected server response. Please try again.', 'error');
            return;
        }

        if (data.success) {
            showBanner(data.message, 'success');
            registrationForm.reset();
            fileNameDisplay.style.display = 'none';
            setTimeout(() => { window.location.href = 'login.html'; }, 1800);
        } else {
            showBanner(data.message || 'Something went wrong. Please try again.', 'error');
        }

    } catch (networkError) {
        console.error('Network / parse error:', networkError);
        showBanner('Could not reach the server. Please check your connection and try again.', 'error');
    } finally {
        setLoading(false);
    }
});