console.log('Report form script loaded!');
document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const reasonTextarea = document.getElementById('reason');
    const charCount = document.getElementById('char-count');
    
    if (reportForm && reasonTextarea) {
        //Update character counter as user types:
        reasonTextarea.addEventListener('input', () => {
            const length = reasonTextarea.value.length;
            charCount.textContent = length;
        
            if (length > 200) { //visual warning when approaching limit
                charCount.style.color = '#f0ad4e'; //warning color
            } else {
                charCount.style.color = ''; //reset to default
            }
        });
        
        charCount.textContent = reasonTextarea.value.length;   //initialize counter on page load
        
        reportForm.addEventListener('submit', (e) => {         //form submission validation
            const reason = reasonTextarea.value.trim();
            
            clearErrors(); //clear previous errors
            
            if (!reason) {  //validate empty
                e.preventDefault();
                showError('Please provide a reason for the report');
                return;
            }
            
            if (reason.length > 250) { //Validate length
                e.preventDefault();
                showError('Report reason cannot exceed 100 characters');
                return;
            }
            
            if (reason.length < 10) {             //validate minimum length
                e.preventDefault();
                showError('Please provide a more detailed reason (at least 10 characters)');
                return;
            }
        });
        
        function showError(message) {  //helper function to show errors
            let errorDiv = document.querySelector('.error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                reportForm.prepend(errorDiv);
            }
            errorDiv.textContent = message;
            errorDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
        function clearErrors() {         //helper function to clear errors
            const errorDiv = document.querySelector('.error-message');
            if (errorDiv && !errorDiv.hasAttribute('data-server-error')) {
                errorDiv.remove();
            }
        }
    }
});