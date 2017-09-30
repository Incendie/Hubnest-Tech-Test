const hub = {};
hub.contactsArray = [];
hub.dBRef = firebase.database().ref();

//component for outputting individual contact cards
hub.printCard = name => {
  //structuring the output to the DOM
  const deleteContact = `<div class="deleteBtn deleteContact" data-name="${name}"><div class="deleteBtn__x"></div><p>Delete</p></div>`;
  const deleteNumber = `<div class="deleteBtn deleteNum"><div class="deleteBtn__x"></div><p>Delete</p></div>`;
  const select = `<select><option value="Home">Home</option><option value="workNum">Work</option><option value="Cell">Cell</option><option value="Other">Other</option></select>`;
  const input = `<input type="text" required placeholder="What is the phone #?">`;
  const form = `<form id="newNum" data-name="${name}">${select}${input}<button type="submit">Add</button></form>`;
  const titleSection = `<h2>${name}</h2>${deleteContact}`;

  //find the firebase key for "name"
  let key = "";
  hub.contactsArray.forEach(entry => {
    if (entry.name === name) {
      key = entry.key;
    }
  });

  //structure and output to DOM this contact's phone numbers
  let numbersSection = ``;
  const dBRefContact = firebase.database().ref(`/${key}`);
  dBRefContact.once("value", entry => {
    const dBData = entry.val();
    for (let numKey in dBData) {
      if (numKey !== "name") {
        numbersSection += `<div class="numEntry"><p>${dBData[numKey]
          .type}: ${dBData[numKey].number}</p>${deleteNumber}</div>`;
      }
    }
  });

  const sectionStructure = `<div class="contacts__person"><div class="contacts__person--heading">${titleSection}</div><div class="contacts__person--numbers">${numbersSection}</div>${form}</div>`;
  $("#contacts").append(sectionStructure);
};

//fetch firebase data and print to screen
hub.readDB = () => {
  hub.dBRef.on("value", data => {
    $("#contacts").empty();
    hub.contactsArray = [];
    let dBData = data.val();
    for (let key in dBData) {
      hub.contactsArray.push({ name: dBData[key].name, key });
    }
    // console.log(hub.contactsArray);
    for (let i = 0; i < hub.contactsArray.length; i++) {
      hub.printCard(hub.contactsArray[i].name);
    }
  });
};

//push a name to Firebase as a new entry
hub.newEntry = () => {
  $("#newEntry").on("submit", e => {
    e.preventDefault();
    const name = $("#newName").val();
    hub.dBRef.push({ name, numbers: {} });
    $(this).val("");
  });
};

//push a number and its type to Firebase under the specific person's property
hub.newNum = () => {
  $(document).on("submit", "#newNum", function(e) {
    e.preventDefault();
    const type = $(this)
      .find("select")
      .val();
    const number = $(this)
      .find("input")
      .val();
    const phone = { type, number };

    // const contactRef = firebase.database().ref();
    let name = $(this).data("name");
    let key = "";

    //find the unique firebase key for this specific contact
    hub.contactsArray.forEach(entry => {
      if (entry.name === name) {
        key = entry.key;
      }
    });

    //add the phone number and type to this contact
    const dBRefContact = firebase.database().ref(`/${key}`);
    dBRefContact.once("value").then(() => {
      dBRefContact.push(phone);
      $(this)
        .find("input")
        .val("");
    });
  });
};

hub.deleteEntry = () => {
  $(document).on("click", ".deleteContact", () => {
    const name = $(this).data("name");

    hub.dBRef.on("value", data => {
      const entry = data.val();

      for (let key in entry) {
        console.log(entry[key].name, name);
        if (entry[key].name === name) {
        }
      }
    });
  });
};

hub.init = () => {
  hub.readDB();
  hub.newEntry();
  hub.newNum();
  hub.deleteEntry();
};

$(() => {
  hub.init();
});
