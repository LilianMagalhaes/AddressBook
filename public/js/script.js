document.addEventListener("DOMContentLoaded", () => {
  let tabContacts = [];
  const readDbData = () => {
    fetch("/getContacts")
      .then((response) => response.json())
      .then((data) => {
        tabContacts = data;
        console.log(tabContacts);
        displayContactsList(tabContacts);
      })
      .catch((error) => console.error(error));
  };

  readDbData();

  document.getElementById("app-icon").addEventListener("click", (e) => {
    readDbData();
  });

  //Create HTML elements and display contacts list:
  const displayContactsList = (contacts) => {
    //alert(`displayContactsList received: ${contacts}`);
    let sortedContactsList = sortContactsByFirstName(contacts);
    let wrap = document.getElementById("show-contactsList");
    wrap.innerHTML = "";
    let contactListCards = createListCard(sortedContactsList);
    for (const contactListCard of contactListCards) {
      wrap.insertAdjacentHTML("beforeEnd", contactListCard);
    }
  };

  //Sorts contacts by first name:
  const sortContactsByFirstName = (contacts) => {
    let sortedContactsList = contacts.sort(function Compare(a, b) {
      if (a.nameFirst.toLowerCase() < b.nameFirst.toLowerCase()) {
        return -1;
      }
      if (a.nameFirst.toLowerCase() > b.nameFirst.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return sortedContactsList;
  };

  const createListCard = (list) => {
    let contactsList = [];
    list.forEach((contact) => {
      let labelColor;
      let category = contact.category;
      switch (category) {
        case "family":
          labelColor = "bg-primary";
          break;
        case "friends":
          labelColor = "bg-danger";
          break;
        case "work":
          labelColor = "bg-warning";
          break;
        case "business":
          labelColor = "bg-success";
          break;
        default:
          labelColor = "";
      }
      let contactListCard = `
      <section class="contact-card-container bg-body-tertiary">
        <article class="contact-card-top">
          <div class="" data-bs-toggle="collapse" 
                        href="#${contact._id}" role="button" aria-expanded="false" 
                        aria-controls="${contact._id}">
  
            <img class="card-img-left" src="${contact.picture}" alt=""></img>

            <div class="contact-info-top">
              <span class="list-item title single-contact name">${contact.nameTitle} ${contact.nameFirst} ${contact.nameLast}</span>
              <span class="list-item subtitle single-contact phone">${contact.phone}</span>
              <span class="list-item subtitle single-contact email" href="">${contact.email}</span>
            </div>
            
          </div>
          <label class="list-item ${labelColor} category-label">${contact.category}</label>
        </article>

        <hr class="card-divider">

        <article class="collapse contacts-collapse" id="${contact._id}">
          <button href="#" class="delContact-submit bg-body-tertiary" type="button" data-bs-toggle="modal" data-bs-target="#modal-deleteContact" value="${contact._id}">
            <img src="images/icons/delete-icon.png" alt="" class="delete-icon">
          </button>
          <section class="contact-card-collapsed">
            <div class="contact-info-bottom">
              <p class="list-item__subtitle single-contact adress"><strong>Adress: </strong>
                </br>${contact.stNumber}, ${contact.stName} 
                </br>${contact.city}, ${contact.province}, ${contact.postcode} 
                <br>${contact.country} </p> 
              <p class="list-item__subtitle single-contact birthday">
                <strong>Birthday: </strong>${contact.dob}
              </p>

              <div class="socialMediaIcons mt-0 mb-3">
                <img class="card-icon facebook-link" src="images/icons/facebook-icon.png" alt=""></img>
                <img class="card-icon instagram-link" src="images/icons/instagram-icon.png" alt=""></img>
                <img class="card-icon linkedin-link" src="images/icons/linkedin-icon.png" alt=""></img>
                <img class="card-icon twitter-link" src="images/icons/twitter-icon.png" alt=""></img>
                
              </div>
            </div>
          </section>
          <img class="phone-link" src="images/icons/phone2-icon.png" alt=""></img>
          
          <hr class="card-divider-bottom">
        </article>
      </section>`;

      contactsList.push(contactListCard);
    });
    return contactsList;
  };

  //create an event listener for accueil and each category of contact (filter contacts by category or show all):
  [...document.getElementsByClassName("choice-category")].forEach((button) => {
    button.addEventListener("click", (event) => {
      console.log(`e.target: ${event.target}`);
      const choice = event.target.value;
      let category;
      console.log(`choice: ${choice}`);
      switch (choice) {
        case 0:
          displayContactsList(tabContacts);
          break;
        case 1:
          category = "family";
          const familyContacts = filterByCategory(category, tabContacts);
          displayContactsList(familyContacts);
          break;
        case 2:
          console.log("category friends!");
          category = "friends";
          const friendsContacts = filterByCategory(category, tabContacts);
          displayContactsList(friendsContacts);
          break;
        case 3:
          category = "work";
          const workContacts = filterByCategory(category, tabContacts);
          displayContactsList(workContacts);
          break;
        case 4:
          category = "business";
          const businessContacts = filterByCategory(category, tabContacts);
          displayContactsList(businessContacts);
          break;
        default:
          console.log("error - switch went to the default case");
          displayContactsList(tabContacts);
          break;
      }
    });
  });

  const filterByCategory = (category, list) => {
    let filteredContacts = [];
    for (const contact of list) {
      if (contact.category.toLowerCase() === category.toLowerCase()) {
        filteredContacts.push(contact);
      }
    }
    return filteredContacts;
  };

  //*Create addEventListener to Delete a contact:
  document.addEventListener("click", function (e) {
    const target = e.target.closest(".delContact-submit");
    if (target) {
      let contactToDelete = target.value;
      //alert(contactToDelete);
      document
        .getElementById("confirmToDeleteContact")
        .addEventListener("click", function (e) {
          let target2 = e.target;
          if (target2) {
            let data = JSON.stringify({ _id: contactToDelete });
            fetch("/deleteContact", {
              method: "DELETE",
              body: data,
              headers: new Headers({ "Content-type": "application/json" }),
            })
              .then((response) => response.text())
              .then((data) => console.log("Contact successfull deleted!"));

            tabContacts = "";
            readDbData();
          } else console.log(`error: contact wasn't deleted!`);
        });
    }
  });

  //*Create addEventListener for Searchbar et Display searched Contacts:
  document.getElementById("search-btn").addEventListener("click", (e) => {
    //alert(`click event triggered!`);
    searchName();
  });

  const searchName = () => {
    let searchInput = "";
    let foundContacts = [];
    searchInput = document.getElementById("searchInput").value;
    //alert(`search function got the input ${searchInput}`);
    foundContacts = getContactsSearchBar(searchInput, tabContacts);
    //alert(`search function receive from getContactsSearchBar: ${foundContacts}`);
    if (foundContacts.length <= 0) {
      let msg = "Contact not found!";
      alert(msg);
      displayMsg(msg);
    } else {
      displayContactsList(foundContacts);
    }
  };

  const displayMsg = (msg) => {
    //alert(`function displayMsg received: ${msg}`);
    let wrap = document.getElementById("show-contactsList");
    //wrap.innerHTML = "";
    wrap.innerHTML = `<p class="card msg-custom">${msg}</p>`;
    alert(`function displayMsg sent html: ${wrap.innerHTML}`);
  };

  //*Filter searchBar input:
  const getContactsSearchBar = (searchInput, list) => {
    //alert(`getContactsSearchBar function got the input ${searchInput}`);
    let filteredContacts = [];
    for (const contact of list) {
      if (
        contact.nameFirst.toLowerCase() === searchInput.toLowerCase() ||
        contact.nameLast.toLowerCase() === searchInput.toLowerCase()
      ) {
        filteredContacts.push(contact);
      }
    }
    return filteredContacts;
  };

  //create an event listener for addContact submit button and register new contact info in the database:
  document
    .getElementById("addContact-submit")
    .addEventListener("click", (e) => {
      let nameTitle = document.getElementById("input-title").value;
      let nameFirst = document.getElementById("input-name_first").value;
      let nameLast = document.getElementById("input-name_last").value;
      let stNumber = document.getElementById("input-number").value;
      let stName = document.getElementById("input-street").value;
      let city = document.getElementById("input-city").value;
      let province = document.getElementById("input-province").value;
      let postcode = document.getElementById("input-postalCode").value;
      let country = document.getElementById("input-country").value;
      let category = document.getElementById("input-category").value;
      let email = document.getElementById("input-email").value;
      let phone = document.getElementById("input-phone").value;
      let dob = document.getElementById("input-birthday").value;
      let picture = "images/icons/contact-icon.png";

      let data = JSON.stringify({
        nameTitle: nameTitle,
        nameFirst: nameFirst,
        nameLast: nameLast,
        stNumber: stNumber,
        stName: stName,
        city: city,
        province: province,
        country: country,
        postcode: postcode,
        category: category,
        email: email,
        phone: phone,
        dob: dob,
        picture: picture,
      });
      fetch("/addContact", {
        method: "POST",
        body: data,
        headers: new Headers({ "Content-type": "application/json" }),
      })
        .then((response) => response.text())
        .then((data) => alert("New contact successfull added!"));

      tabContacts = "";
      readDbData();
    });
}); //END DOM LOADED CONTENT//
