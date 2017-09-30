const hub = {};
hub.contactsArray = [];
hub.dBRef = firebase.database().ref();

//component for outputting individual contact cards
hub.printCard = name => {
  //structuring the output to the DOM
  let deleteContact = `<div class="deleteBtn deleteContact" data-name="${name}"><div class="deleteBtn__x"><span></span><span></span></div><p>Delete</p></div>`;
  let deleteNumber = `<div class="deleteBtn deleteNum"><div class="deleteBtn__x"><span></span><span></span></div><p>Delete</p></div>`;
  let select = `<select><option value="Home">Home</option><option value="Work">Work</option><option value="Cell">Cell</option><option value="Other">Other</option></select>`;
  let input = `<input type="text" required placeholder="What is the phone #?">`;
  let form = `<form id="newNum" data-name="${name}">${select}${input}<button type="submit">Add</button></form>`;
  let titleSection = `<h2>${name}</h2>${deleteContact}`;

  //find the firebase key for "name"
  let key = "";
  hub.contactsArray.forEach(entry => {
    if (entry.name === name) {
      key = entry.key;
    }
  });

  //structure and output to DOM this contact's phone numbers
  let numbersSection = ``;
  let dBRefContact = firebase.database().ref(`/${key}`);
  dBRefContact.once("value", entry => {
    const dBData = entry.val();
    for (let numKey in dBData) {
      if (numKey !== "name") {
        numbersSection += `<div class="numEntry"><p><span class="numType">${dBData[
          numKey
        ].type}</span>: <span class="phoneNum">${dBData[numKey]
          .number}</span></p>${deleteNumber}</div>`;
      }
    }
  });

  let sectionStructure = `<div class="contacts__person"><div class="contacts__person--heading">${titleSection}</div><div class="contacts__person--numbers">${numbersSection}</div>${form}</div>`;
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
    let name = $("#newName").val();
    hub.dBRef.push({ name, numbers: {} });
    $(this).val("");
  });
};

//push a number and its type to Firebase under the specific person's property
hub.newNum = () => {
  $(document).on("submit", "#newNum", function(e) {
    e.preventDefault();
    let type = $(this)
      .find("select")
      .val();
    let number = $(this)
      .find("input")
      .val();
    let phone = { type, number };

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
  $(document).on("click", ".deleteContact", function() {
    let name = $(this)
      .siblings("h2")
      .text();

    hub.dBRef.on("value", data => {
      let entry = data.val();

      for (let key in entry) {
        // console.log(entry[key].name, name);
        if (entry[key].name === name) {
          firebase
            .database()
            .ref(`/${key}`)
            .remove();
          break;
        }
      }
    });
  });
};

hub.deleteNumber = () => {
  $(document).on("click", ".deleteNum", function() {
    let name = $(this)
      .parent()
      .parent()
      .siblings(".contacts__person--heading")
      .children("h2")
      .text();
    let number = $(this)
      .siblings("p")
      .children(".phoneNum")
      .text();

    hub.dBRef.on("value", data => {
      let entry = data.val();

      for (let key in entry) {
        // console.log(entry[key].name, name);
        if (entry[key].name === name) {
          let nameRef = firebase.database().ref(`/${key}`);

          nameRef.on("value", contactData => {
            let phoneEntry = contactData.val();

            for (let numKey in phoneEntry) {
              if (phoneEntry[numKey].number === number) {
                firebase
                  .database()
                  .ref(`/${key}/${numKey}`)
                  .remove();
                break;
              }
            }
          });
          break;
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
  hub.deleteNumber();
};

$(() => {
  hub.init();
});
