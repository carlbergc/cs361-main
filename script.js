document.addEventListener('DOMContentLoaded', () => {
    //Global Variables
    let currentMealList = null;
    let currentMealNumber = null;
    const ingredientModal = document.getElementById('ingredient-modal');
    const ingredientList = document.getElementById('ingredient-list');
    const ingredientSearch = document.getElementById('ingredient-search');
    const cancelIngredientBtn = document.getElementById('cancel-ingredient');
    
    //Grocery List Elements
    const groceryItems = document.getElementById('grocery-items');
    const removeGroceryButton = document.getElementById('remove-grocery');
    const groceryFullscreenButton = document.getElementById('fullscreen-grocery');
    const groceryFullscreenModal = document.getElementById('grocery-fullscreen-modal');
    const groceryItemsFullscreen = document.getElementById('grocery-items-fullscreen');
    
    //Saved Meals Elements
    const addSavedMealButton = document.getElementById('add-saved-meal');
    const removeSavedMealButton = document.getElementById('remove-saved-meal');
    const savedMealItems = document.getElementById('saved-meal-items');
    
    //Water Tracker Elements
    const glasses = document.querySelectorAll('.water-glass');
    const addWaterButton = document.getElementById('add-water');
    const removeWaterButton = document.getElementById('remove-water');
    let currentFull = 0;

    // Placeholder Initial ingredients
    let ingredients = [
        'Chicken', 'Rice', 'Broccoli', 'Beef', 'Pasta', 'Tomato', 'Lettuce', 'Eggs',
    ];

    // Load saved data from localStorage
    let savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];
    let waterCount = parseInt(localStorage.getItem('waterCount')) || 0;

    // Initialize the UI from saved data
    function initializeFromStorage() {
        if (savedMealItems) {
            savedMealItems.innerHTML = '';
            savedMeals.forEach(meal => {
                const li = document.createElement('li');
                li.textContent = meal;
                savedMealItems.appendChild(li);
            });
        }
        
        //Initialize water glasses
        currentFull = Math.min(waterCount, glasses.length);
        for (let i = 0; i < currentFull; i++) {
            glasses[i].classList.add('filled');
        }
        
        //Load grocery items if available
        const savedGroceryItems = JSON.parse(localStorage.getItem('groceryItems')) || [];
        if (groceryItems) {
            groceryItems.innerHTML = '';
            savedGroceryItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                groceryItems.appendChild(li);
            });
        }
    }

    //Ingredient handling
    function updateIngredientListUI(filterText = '') {
        if (!ingredientList) return;
        ingredientList.innerHTML = '';

        const lowerCaseFilter = filterText.toLowerCase();
        const filteredIngredients = filterText
            ? ingredients.filter(ing => ing.toLowerCase().includes(lowerCaseFilter))
            : ingredients;

        if (filteredIngredients.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No ingredients found.';
            li.style.fontStyle = 'italic';
            ingredientList.appendChild(li);
        } else {
            filteredIngredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                li.addEventListener('click', () => {
                    addIngredientToMeal(ingredient);
                    if (ingredientModal) ingredientModal.style.display = 'none';
                });
                ingredientList.appendChild(li);
            });
        }
    }

    function addIngredientToMeal(ingredient) {
        if (currentMealList) {
            //If adding directly to grocery list
            if (currentMealList === groceryItems) {
                const exists = Array.from(groceryItems.querySelectorAll('li'))
                    .some(item => item.textContent.toLowerCase() === ingredient.toLowerCase());
                if (!exists) {
                    const liGrocery = document.createElement('li');
                    liGrocery.textContent = ingredient;
                    groceryItems.appendChild(liGrocery);
                    
                    //Save grocery items
                    saveGroceryItems();
                }
            } else {
                //Adding to a meal
                const li = document.createElement('li');
                li.textContent = ingredient;
                li.classList.add('ingredient-item');
                currentMealList.appendChild(li);
                
                //Also add to grocery list if not already
                if (groceryItems) {
                    const exists = Array.from(groceryItems.querySelectorAll('li'))
                        .some(item => item.textContent.toLowerCase() === ingredient.toLowerCase());
                    if (!exists) {
                        const liGrocery = document.createElement('li');
                        liGrocery.textContent = ingredient;
                        groceryItems.appendChild(liGrocery);
                        
                        //Save grocery items to localStorage
                        saveGroceryItems();
                    }
                }
            }
        }
    }
    
    function saveGroceryItems() {
        if (groceryItems) {
            const items = Array.from(groceryItems.querySelectorAll('li')).map(li => li.textContent);
            localStorage.setItem('groceryItems', JSON.stringify(items));
        }
    }

    //handle add ingredient buttons
    document.querySelectorAll('.add-ingredient-btn').forEach(button => {
        button.addEventListener('click', function() {
            currentMealNumber = this.getAttribute('data-meal');
            
    //handle grocer list
            if (currentMealNumber === 'grocery') {
                currentMealList = groceryItems;
            } else {
                currentMealList = document.getElementById(`meal-list-${currentMealNumber}`);
            }

            if (currentMealList && ingredientModal) {
                updateIngredientListUI();
                ingredientModal.style.display = 'block';
                if (ingredientSearch) ingredientSearch.focus();
            }
        });
    });

    //Ingredient search
    if (ingredientSearch) {
        ingredientSearch.addEventListener('input', function() {
            updateIngredientListUI(this.value);
        });
    }

    //Close ingredient modal
    if (cancelIngredientBtn) {
        cancelIngredientBtn.addEventListener('click', () => {
            if (ingredientModal) ingredientModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (ingredientModal && event.target === ingredientModal) {
            ingredientModal.style.display = 'none';
        }
    });

    const ingredientHelpButton = document.getElementById('ingredient-help-button');
    if (ingredientHelpButton) {
        ingredientHelpButton.addEventListener('click', () => {
            alert("                         Help Page\n\n" +
              "When adding ingredients to your grocery list,\n" +
              "first locate through the list of ingredients for what you want\n" +
              "then tap the box on the left hand side of the item.\n" +
              "This will add the ingredient automatically to your list.\n" +
              "When you are finished, click the back button to continue to the homepage.\n");
        });
    }

    // Meal Plan
    document.querySelectorAll('.add-meal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const mealNumber = this.getAttribute('data-meal');
            const mealList = document.getElementById(`meal-list-${mealNumber}`);

            if (mealList && savedMealItems) {
                const savedMealsArray = Array.from(savedMealItems.querySelectorAll('li')).map(item => item.textContent);
                if (savedMealsArray.length > 0) {
                    const mealName = prompt(`Select a meal to add:\n- ${savedMealsArray.join('\n- ')}`);
                    if (mealName && savedMealsArray.some(meal => meal.toLowerCase() === mealName.trim().toLowerCase())) {
                        const matchedMeal = savedMealsArray.find(meal => meal.toLowerCase() === mealName.trim().toLowerCase());
                        const li = document.createElement('li');
                        li.textContent = matchedMeal;
                        li.classList.add('meal-item');
                        mealList.appendChild(li);
                    } else if (mealName) {
                        alert(`'${mealName}' not found in your saved meals list.`);
                    }
                } else {
                    alert('No saved meals available. Add meals to your saved list first.');
                }
            }
        });
    });

    //Remove meal items
    document.querySelectorAll('.remove-meal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const mealNumber = this.getAttribute('data-meal');
            const mealList = document.getElementById(`meal-list-${mealNumber}`);

            if (mealList && mealList.lastElementChild) {
                mealList.removeChild(mealList.lastElementChild);
            }
        });
    });

    //Water Tracker
    if (addWaterButton && removeWaterButton && glasses.length > 0) {
        addWaterButton.addEventListener('click', () => {
            if (currentFull < glasses.length) {
                glasses[currentFull].classList.add('filled');
                currentFull++;
                localStorage.setItem('waterCount', currentFull);
            }
        });

        removeWaterButton.addEventListener('click', () => {
            if (currentFull > 0) {
                currentFull--;
                glasses[currentFull].classList.remove('filled');
                localStorage.setItem('waterCount', currentFull);
            }
        });
    }

    //Grocery List
    function syncGroceryLists() {
        if (!groceryItems || !groceryItemsFullscreen) return;

        groceryItemsFullscreen.innerHTML = '';
        const items = groceryItems.querySelectorAll('li');

        if (items.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = 'Your grocery list is empty.';
            emptyMsg.style.fontStyle = 'italic';
            emptyMsg.style.color = '#666';
            emptyMsg.style.listStyle = 'none';
            groceryItemsFullscreen.appendChild(emptyMsg);
        } else {
            items.forEach(item => {
                const liFullscreen = document.createElement('li');
                liFullscreen.textContent = item.textContent;
                groceryItemsFullscreen.appendChild(liFullscreen);
            });
        }
    }

    if (removeGroceryButton) {
        removeGroceryButton.addEventListener('click', () => {
            if (groceryItems && groceryItems.lastElementChild) {
                groceryItems.removeChild(groceryItems.lastElementChild);
                saveGroceryItems();
            } else {
                alert('No grocery items to remove!');
            }
        });
    }

    if (groceryFullscreenButton) {
        groceryFullscreenButton.addEventListener('click', () => {
            if (groceryFullscreenModal) {
                syncGroceryLists();
                groceryFullscreenModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (groceryFullscreenModal && event.target === groceryFullscreenModal) {
            groceryFullscreenModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Saved Meals
    function saveMealToStorage() {
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
    }

    if (addSavedMealButton) {
        addSavedMealButton.addEventListener('click', () => {
            const meal = prompt('Enter name of meal to save:');
            const trimmedMeal = meal ? meal.trim() : null;
            if (trimmedMeal && savedMealItems) {
                const exists = Array.from(savedMealItems.querySelectorAll('li'))
                    .some(li => li.textContent.toLowerCase() === trimmedMeal.toLowerCase());
                const existsInArray = savedMeals.some(m => m.toLowerCase() === trimmedMeal.toLowerCase());
                
                if (exists || existsInArray) {
                    alert(`'${trimmedMeal}' is already in your saved meals list.`);
                    return;
                }
                const li = document.createElement('li');
                li.textContent = trimmedMeal;
                savedMealItems.appendChild(li);
                
    //Add to array and save
                savedMeals.push(trimmedMeal);
                saveMealToStorage();
            } else if (meal !== null) {
                alert("Please enter a valid meal name.");
            }
        });
    }

    if (removeSavedMealButton) {
        removeSavedMealButton.addEventListener('click', () => {
            if (savedMealItems && savedMealItems.lastElementChild) {
                const removedMeal = savedMealItems.lastElementChild.textContent;
                savedMealItems.removeChild(savedMealItems.lastElementChild);
                
            //Also remove from the array
                savedMeals = savedMeals.filter(meal => meal !== removedMeal);
                saveMealToStorage();
            } else {
                alert('No saved meals to remove!');
            }
        });
    }

    //Nav
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            const fullscreenModal = document.getElementById('grocery-fullscreen-modal');
            if (fullscreenModal && fullscreenModal.style.display === 'block') {
                fullscreenModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                window.history.back();
            }
        });
    }

    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', function() {
            alert("                         Help Page\n\n" +
              "When adding ingredients to your grocery list,\n" +
              "first locate through the list of ingredients for what you want\n" +
              "then tap the box on the left hand side of the item.\n" +
              "This will add the ingredient automatically to your list.\n" +
              "When you are finished, click the back button to continue to the homepage.\n");
        });
    }

    //Start app with stored data
    initializeFromStorage();
});