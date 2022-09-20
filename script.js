'use strict';

const form = document.querySelector('#submit');
const searchInp = document.querySelector('#search');
const searchBtn = document.querySelector('.search-btn');
const random = document.querySelector('#random');
const mealsEl = document.querySelector('#meals');
const resultHeading = document.querySelector('#result-heading');
const single_MealEl = document.querySelector('#single-meal');
const errorMessage = document.querySelector('.message');

//FUNCTIONS

//DISPLAY ERROR MESSAGE
const displayError = function (msg) {
  resultHeading.innerHTML = '';
  errorMessage.innerHTML = `<h2>${msg}</h2>`;
};
//SEARCH MEALS BY NAME/KEYWORD
const getMeal = async function (e) {
  try {
    e.preventDefault();

    //clear single meal container
    single_MealEl.innerHTML = '';
    resultHeading.innerHTML = '';
    errorMessage.innerHTML = '';
    mealsEl.innerHTML = '';

    const keyword = searchInp.value;
    if (!keyword)
      throw new Error(
        `<i class="fas fa-duotone fa-circle-exclamation"></i> Please enter your search term!`
      );

    //AJAX CALL
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`
    );
    const data = await res.json();
    resultHeading.innerHTML = `<h2>Search results for '${keyword}'</h2>`;

    if (!data.meals) {
      mealsEl.innerHTML = '';
      searchInp.value = '';
      throw new Error(
        `<i class="fas fa-duotone fa-circle-exclamation"></i> No search results for this term. Try again!`
      );
    }

    mealsEl.innerHTML = data.meals
      .map(
        meal => `
      <div class = "meal">
        <img src="${meal.strMealThumb}" alt ="${meal.strMeal}">
        <div class= "meal-info" data-mealID = "${meal.idMeal}">
          <h3>${meal.strMeal}</h3>
        </div>
      </div>
      `
      )
      .join('');

    //CLEAR SEARCH INPUT
    searchInp.value = '';
  } catch (err) {
    displayError(err.message);
  }
};

//SEARCH MEALS BY ID
const getMealById = async function (id) {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const data = await res.json();
    if (!data.meals)
      throw new Error(
        '<i class="fas fa-duotone fa-circle-exclamation"></i> Something wrong happened! Try again'
      );
    const meal = data.meals[0];
    displayMeal(meal);
    single_MealEl.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    displayError(err.message);
  }
};

//SEARCH RANDOM MEAL
const getRandomMeal = async function () {
  try {
    //clear meals container
    mealsEl.innerHTML = '';
    errorMessage.innerHTML = '';

    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/random.php`
    );
    const data = await res.json();
    if (!data.meals)
      throw new Error(
        '<i class="fas fa-duotone fa-circle-exclamation"></i> Something wrong happened! Try again'
      );
    const meal = data.meals[0];
    //change the heading text
    resultHeading.innerHTML = `<h2>Our suggestion for you is ${
      meal.strArea ? meal.strArea : ''
    } : ${meal.strMeal}</h2>`;
    displayMeal(meal);
  } catch (err) {
    displayError(err);
  }
};

//DISPLAY MEAL DETAILS TO DOM
const displayMeal = function (meal) {
  //clear single meal container
  single_MealEl.innerHTML = '';
  //filter all ingredients
  const ingredients = Object.entries(meal)
    .filter(
      el => el[0].startsWith('strIngredient') && el[1] !== '' && el[1] !== null
    )
    .map(ing => ing[1]);

  //filter all measurements
  const measures = Object.entries(meal)
    .filter(
      el => el[0].startsWith('strMeasure') && el[1] !== '' && el[1] !== null
    )
    .map(ing => ing[1]);

  //combine [ingredients, measurements]
  const allIng = ingredients.map((elt, i) => [elt, measures[i]]);

  const markup = `
  <div class="single-meal">
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" href="#${
    meal.idMeal
  }" />
    <div class="single-meal-info">
      <p class = "meal-category">${meal.strCategory ? meal.strCategory : ''}</p>
      <p class = "meal-area">${meal.strArea ? meal.strArea : ''}</p>
    </div>
    <div class="main">
      <p>${meal.strInstructions}</p>
      <h2>Ingredients</h2>
      <ul>
         ${allIng.map(entry => `<li>${entry[0]} : ${entry[1]}</li>`).join('')}
      </ul>
    </div>
  </div>
  `;
  single_MealEl.insertAdjacentHTML('beforeend', markup);
};

//EVENT LISTENERS
form.addEventListener('submit', getMeal);

mealsEl.addEventListener('click', function (e) {
  const mealID = e.target.closest('.meal-info').dataset.mealid;
  if (!mealID) return;
  getMealById(mealID);
});

random.addEventListener('click', getRandomMeal);
