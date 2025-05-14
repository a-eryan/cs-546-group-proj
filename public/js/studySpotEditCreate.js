//create/edit study spot with validation
console.log("Study spot edit/create validation script loaded");

const checkString = (string) => {
    if (!string) throw 'You must provide a string';
    if (typeof string !== 'string') throw `${string} must be a string`;
    string = string.trim();
    if (string.length === 0) throw `Text cannot be an empty string or string with just spaces`;
    return string;
}
const checkTitle = (title) => {
    title = checkString(title);
    if (title.length < 6) throw `Title: ${title} needs to be at least 6 characters long`;
    return title;
}
const checkDescription = (description) => {
    description = checkString(description);
    if (description.length < 10) throw `Description: ${description} needs to be at least 10 characters long`;
    return description;
}
const checkLocation = (location) => {
    location = checkString(location);
    if (location.length < 8) throw `Location: ${location} needs to be at least 8 characters long`;
    return location;
}
const checkNoiseLevel = (val) => {
    const num = Number(val);
    if (!Number.isInteger(num) || num < 1 || num > 3) {
        throw `${val} must be an integer between 1 and 3`;
    }
    return num;
}
const checkResources = (arr) => {
    if (!arr || !Array.isArray(arr)) {
        return [];
    } 
    if (arr.length === 0) {
        return arr;
    }
    const valid = ['printer', 'water fountain', 'vending machine', 'scanner', 'whiteboard', 'outlets', 'external monitors'];
    arr.forEach(r => { 
        if (!valid.includes(r)) throw `Invalid resource ${r}`; 
    });
    return arr;
}

document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const displayError = (form, message) => {
        let errorDiv = form.querySelector(".error-message");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            form.prepend(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: "smooth" });
    };

    if (uploadForm){
        uploadForm.addEventListener("submit", (e) => {
            try {
                let title = document.getElementById("title").value;
                let description = document.getElementById("description").value;
                let location = document.getElementById("location").value;
                let noiseLevel = document.getElementById("noiseLevel").value;
                const resourceNodes = document.querySelectorAll('input[name="resourcesNearby"]:checked');
                let resources = Array.from(resourceNodes).map(input => input.value);
                let imageInput = document.getElementById("image");
                
                const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                if (imageInput && imageInput.files && imageInput.files.length > 0) { //needed short circuiting here, imageInput.files would throw an error if imageInput was null 
                    if (!allowedTypes.includes(imageInput.files[0].type)) {
                        throw "Only JPG, PNG, and WEBP images are allowed.";
                    }
                } /*else {
                    throw "Image is required.";
                }*/

                //Will uncomment if making it required
                title = checkTitle(title);
                description = checkDescription(description);
                location = checkLocation(location);
                noiseLevel = checkNoiseLevel(noiseLevel);
                resources = checkResources(resources);
            } catch (error) {
                e.preventDefault();
                displayError(uploadForm, error);
                return;
            }
        });
    }

})