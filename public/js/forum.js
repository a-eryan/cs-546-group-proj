//validation for forum posting
console.log('Forum validation script loaded!');
document.addEventListener('DOMContentLoaded', () => {
    const createForumForm = document.getElementById('createForumForm');
    const commentForm = document.querySelector('.comment-form');
    
    // Forum creation validation
    if (createForumForm) {
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        // const submitButton = createForumForm.querySelector('button[type="submit"]');
        
        const validateForm = () => {
            console.log("Validating form...");
            console.log("Title value:", titleInput.value);
            console.log("Content value:", contentInput.value);
            
            let isValid = true;
            let errorMessage = '';
            
            // Title validation
            if (!titleInput.value.trim()) {
                errorMessage = 'Title cannot be empty';
                isValid = false;
            } else if (titleInput.value.trim().length < 6) {
                errorMessage = 'Title must be at least 6 characters';
                isValid = false;
            }
            
            //content validation:
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
        
        createForumForm.addEventListener('submit', (e) => {
            const { isValid, errorMessage } = validateForm();
            
            if (!isValid) {
                e.preventDefault();
                
                let errorDiv = document.querySelector('.error-message');  //create or update error message
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    createForumForm.prepend(errorDiv);
                }
                
                errorDiv.textContent = errorMessage;
                errorDiv.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Comment form validation
    if (commentForm) {
        const commentTextarea = commentForm.querySelector('textarea');
        
        commentForm.addEventListener('submit', (e) => {
            if (!commentTextarea.value.trim()) {
                e.preventDefault();
                
                let errorDiv = document.querySelector('.error-message');  //create or update error message
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    commentForm.prepend(errorDiv);
                }
                
                errorDiv.textContent = 'Comment cannot be empty';
                errorDiv.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
