console.log('Profile picture edit script loaded!');
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('avatar');
  const form = document.querySelector('.upload-form');
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.style.display = 'none';
  
  fileInput.parentNode.insertBefore(errorContainer, fileInput.nextElementSibling.nextElementSibling);   //insert error container after the small hint text
  
  // Max file size: 5MB,  allowed file types
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']; 
  
  fileInput.addEventListener('change', validateFile);
  form.addEventListener('submit', validateOnSubmit);
  
  function validateFile() {     //reset error message
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
    
    const file = fileInput.files[0];
    if (!file) return;
    
    //check file size
    if (file.size > MAX_FILE_SIZE) {
      showError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      fileInput.value = ''; //clear the input
      return;
    }
    
    //check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(`Invalid file type. Please select an image file (JPG, PNG, WEBP)`);
      fileInput.value = ''; //clear the input
      return;
    }
    
    if (window.FileReader) {     //preview the image
      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.className = 'profile-preview';
        preview.style.maxWidth = '200px';
        preview.style.maxHeight = '200px';
        preview.style.margin = '10px 0';
        
        //remove any existing preview
        const existingPreview = document.querySelector('.profile-preview');
        if (existingPreview) {
          existingPreview.remove();
        }
        
        //add the preview before the submit button:
        const formActions = document.querySelector('.form-actions');
        form.insertBefore(preview, formActions);
      };
      reader.readAsDataURL(file);
    }
  }
  
  function validateOnSubmit(e) {
    const file = fileInput.files[0];
    
    if (!file) {     //check if a file was selected
      e.preventDefault();
      showError('Please select an image file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {     //Re-validate file size and type
      e.preventDefault();
      showError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      e.preventDefault();
      showError('Invalid file type. Please select an image file (JPG, PNG, WEBP)');
      return;
    }
  }
  
  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    errorContainer.style.color = '#FFFFFF'; 
    errorContainer.style.marginTop = '5px';
    errorContainer.style.marginBottom = '5px';
  }
});