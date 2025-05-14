// validation for forum editing
console.log('Forum edit validation script loaded!');

document.addEventListener('DOMContentLoaded', () => {
    const editForumForm = document.getElementById('editForumForm');
    
    //Forum edit validation:
    if (editForumForm) {
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        
        const validateForm = () => {
            console.log("Validating edit form...");
            console.log("Title value:", titleInput.value);
            console.log("Content value:", contentInput.value);
            
            let isValid = true;
            let errorMessage = '';
            
            //Title validation:
            if (!titleInput.value.trim()) {
                errorMessage = 'Title cannot be empty';
                isValid = false;
            } else if (titleInput.value.trim().length < 6) {
                errorMessage = 'Title must be at least 6 characters';
                isValid = false;
            }
            
            //Content validation:
            if (!contentInput.value.trim()) {
                errorMessage = 'Description cannot be empty';
                isValid = false;
            } else if (contentInput.value.trim().length < 10) {
                errorMessage = 'Description must be at least 10 characters';
                isValid = false;
            }
            
            console.log("Validation result:", isValid, errorMessage);
            return { isValid, errorMessage };
        };
        
        editForumForm.addEventListener('submit', (e) => {
            const { isValid, errorMessage } = validateForm();
            
            if (!isValid) {
                e.preventDefault();
                
                let errorDiv = document.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    editForumForm.prepend(errorDiv);
                }
                
                errorDiv.textContent = errorMessage;
                errorDiv.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});