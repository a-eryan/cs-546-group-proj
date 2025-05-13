document.addEventListener('DOMContentLoaded', () => { 
    const filterForm = document.getElementById('filter-form'); //grab reference to the whole form (#filter-form) (returns a single DOM element compared to querySelectorAll)
    // const spotsContainer = document.querySelector('.card-grid');
    const allCards = document.querySelectorAll('.card');
    
    if (filterForm) {
        const originalDisplays = new Map(); //Store each card’s computed display value (inline or from CSS) in a Map keyed by that element. Later, when we show it again, we can re‑apply exactly the right display mode.
        allCards.forEach(card => {
            originalDisplays.set(card, window.getComputedStyle(card).display);
        });
        
        //Get all filter inputs:
        const noiseFilter = document.getElementById('filter-noise');
        const resourcesFilter = document.querySelectorAll('input[name="filter-resources"]');
        const searchFilter = document.getElementById('filter-search');
        
        //Apply filters on any change:
        filterForm.addEventListener('change', applyFilters);
        
        //Search input with debouncing:
        let searchTimeout;
        searchFilter?.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300); //use a debounce (setTimeout/clearTimeout) so that we only re‑filter 300 ms after the user stops typing. This saves unnecessary work and prevents janky typing.
        });
        
        function applyFilters() {
            const selectedNoiseLevel = noiseFilter?.value;
            const selectedResources = Array.from(resourcesFilter)
                .filter(cb => cb.checked) //e.g. splits “printer,scanner,” into [“printer”,“scanner”]
                .map(cb => cb.value);
            const searchTerm = searchFilter?.value.toLowerCase();
            
            let visibleCount = 0;
            
            allCards.forEach(card => {
                let shouldShow = true;
                
                //Filter logic:
                const cardNoise = card.dataset.noiseLevel;
                const cardResources = card.dataset.resources?.split(',').filter(r => r) || [];
                const cardTitle = card.querySelector('h2')?.textContent.toLowerCase();
                const cardDescription = card.querySelector('.description')?.textContent.toLowerCase();
                
                if (selectedNoiseLevel && selectedNoiseLevel !== 'all') {
                    if (cardNoise !== selectedNoiseLevel) {
                        shouldShow = false;
                    }
                }
                
                if (selectedResources.length > 0) {
                    const hasAllResources = selectedResources.every(resource => 
                        cardResources.includes(resource)
                    );
                    if (!hasAllResources) {
                        shouldShow = false;
                    }
                }
                
                if (searchTerm) {
                    if (!cardTitle?.includes(searchTerm) && 
                        !cardDescription?.includes(searchTerm)) {
                        shouldShow = false;
                    }
                }
                
                //Preserve original display type:
                card.style.display = shouldShow ? originalDisplays.get(card) : 'none';
                if (shouldShow) visibleCount++;
            });
            
            //Update count:
            const countElement = document.getElementById('results-count');
            if (countElement) {
                countElement.textContent = `Showing ${visibleCount} of ${allCards.length} spots`;
            }
        }
        
        //Reset filters button:
        const resetButton = document.getElementById('reset-filters');
        resetButton?.addEventListener('click', () => {
            filterForm.reset();
            applyFilters();
        });
    }
});