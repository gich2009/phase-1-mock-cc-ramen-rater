document.addEventListener("DOMContentLoaded", () => {
  //Fetch configuration details
  const baseUrl = "http://localhost:3000";
  const mainRoute = "/ramens";

  //Function used to render each character's name in the character bar of the website.
  function renderRamenInMenu(ramen){

    //Create a span with the character name as its contents.
    const ramenImage = document.createElement("img");
    ramenImage.src = ramen.image;
    ramenImage.alt = ramen.name;


    //Add the character to the DOM
    const ramenMenu = document.querySelector("#ramen-menu");
    ramenMenu.appendChild(ramenImage);
  }


  //Function that renders the body of the website. It renders each ramen's details.
  function renderRamenBody(ramen){
    const image = document.querySelector(".detail-image");
    image.src = ramen.image;
    image.alt = ramen.name;

    const name = document.querySelector(".name");
    name.textContent = ramen.name;

    const restaurant = document.querySelector(".restaurant");
    restaurant.textContent = ramen.restaurant;

    const rating = document.querySelector("#rating-display");
    rating.textContent = ramen.rating;

    const comment = document.querySelector("#comment-display");
    comment.textContent = ramen.comment;
  }


  //Function to add event listeners to the images contained in the ramen menu.
  function addMenuListeners(ramenImage, ramensArray) {
    ramenImage.addEventListener("click", (event) => clickLogic(ramenImage.src, ramensArray));
  
    function clickLogic(ramenImage, ramensArray) {
      for (let index = 0; index < ramensArray.length; ++index) {
        if ((ramensArray[index].image).substring(1) === (ramenImage.slice(-(ramensArray[index].image.length - 1)))) {
          renderRamenBody(ramensArray[index]);
          break;
        }
      }
    }
  }


  //Function that defines a template for a new ramen and POSTS it to the database.
  function createNewRamen(ramensArray){
    const newId = ramensArray.length + 1;
    const newName = document.querySelector("#new-name");
    const newRestaurant = document.querySelector("#new-restaurant");
    const newImage = document.querySelector("#new-image");
    const newRating = document.querySelector("#new-ramen > #new-rating");
    const newComment = document.querySelector("#new-ramen > #new-comment");
    
    //Build the new Ramen object
    const newRamen = {id: newId, name: newName.value, restaurant: newRestaurant.value, image: newImage.value, rating: newRating.value, comment: newComment.value};

    newName.value = "";
    newRestaurant.value = "";
    newImage.value = "";
    newRating.value = ""
    newComment.value = "";

    //Add the new ramen to the cached data.
    ramensArray.push(newRamen);

    //Post the new ramen to the database.
    const url = baseUrl + mainRoute;
    fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(newRamen)})
    .then(response => response.json())
    .then(data => console.log(data));

    return newRamen;
  }

  
  //Function that renders the new ramen immediately after it is created.
  function renderNewRamen(ramensArray, newEntry){
    renderRamenInMenu(newEntry);
    renderRamenBody(newEntry);

    const ramenMenu = document.querySelector("#ramen-menu");
    addMenuListeners(ramenMenu.lastChild, ramensArray);

  }


  //Function to update the ramen details based on the edit form. Rejects input that is not an integer between 0 and 10.
  function updateRamenDetails(ramensArray, newDetails){
    try{
      let newRating = newDetails.rating;
      const newComment = newDetails.comment;
      newRatingNumber = parseInt(newRating, 10);

      const isInvalidRating = isNaN(newRating) || newRating === "" || newRatingNumber < 0 || newRatingNumber > 10;

      if (isInvalidRating) throw ("Rating must be an integer between 0 and 10");

      const name = document.querySelector(".name");
      const rating = document.querySelector("#rating-display");
      const comment = document.querySelector("#comment-display");
      
      let index = 0
      for ( ; index < ramensArray.length; ++index) {
        if (ramensArray[index].name === name.textContent) {
          //Update rating in the DOM and the cache.
          rating.textContent = newRating;
          ramensArray[index].rating = newRating;

          //Update comment in the DOM and the cache.
          comment.textContent = newComment;
          ramensArray[index].comment = newComment;
          break;
        }
      }

      const url = baseUrl + mainRoute + `/${index + 1}`;
      fetch(url, {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({"rating": ramensArray[index].rating, "comment": ramensArray[index].comment})})
      .then(response => response.json())
      .then(data => console.log(data));

    } catch(error){
        alert(error);
    }
  }


  //Solution begins here.
  const url = baseUrl + mainRoute;

  fetch(url).then((result) => result.json()).then((data) => {

    //Cache the fetched data.
    const ramensArray = Array.from(data);
  
    //Render the top part of the homepage (ramen menu)
    ramensArray.forEach((ramen) => renderRamenInMenu(ramen));

    //Render the body of the home page using the first ramen record.
    renderRamenBody(ramensArray[0]);

    return ramensArray;

  }).then((ramensArray) => {

    //Render the page based on the ramen clicked on the menu.
    const ramensMenu = document.querySelector("#ramen-menu");
    const ramensMenuArray = Array.from(ramensMenu.childNodes);
    ramensMenuArray.slice(3).forEach((ramenImage) => addMenuListeners(ramenImage, ramensArray));


    //Create a new Ramen Entry.
    const newRamenForm = document.querySelector("#new-ramen");
    newRamenForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderNewRamen(ramensArray, createNewRamen(ramensArray));

    })

    // Update the ramen details from the input given in the form.
    const updateRamenForm = document.querySelector("#edit-ramen");
    updateRamenForm.addEventListener("submit", (event) => { 
      event.preventDefault(); 
      
      updateRamenDetails(ramensArray, {rating: event.target.querySelector("#new-rating").value, comment: event.target.querySelector("#new-comment").value});

      const newRating = document.querySelector("#edit-ramen > #new-rating");
      newRating.value = "";

      const newComment = document.querySelector("#edit-ramen > #new-comment");
      newComment.value = "";
    });

  })
    
})