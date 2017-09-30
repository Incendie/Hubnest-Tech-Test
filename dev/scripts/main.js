var hub = {};
hub.contactsArray = [];
hub.dBRef = firebase.database().ref();

//component for outputting individual contact cards
hub.printCard = (name, key) => {
  //structuring the output to the DOM
  let deleteContact = `<div class="deleteBtn deleteContact" data-name="${name}" data-key="${key}"><div class="deleteBtn__x"><span></span><span></span></div><p>Delete</p></div>`;
  let deleteNumber = `<div class="deleteBtn deleteNum"><div class="deleteBtn__x"><span></span><span></span></div><p>Delete</p></div>`;
  let select = `<select><option value="Home">Home</option><option value="Work">Work</option><option value="Cell">Cell</option><option value="Other">Other</option></select>`;
  let input = `<input type="tel" size="20" minlength="8" maxlength="20" required placeholder="What is the phone #?">`;
  let form = `<form id="newNum" data-key="${key}">${select}${input}<button type="submit">Add</button></form>`;
  let titleSection = `<h2>${name}</h2>${deleteContact}`;

  //structure and output to DOM this contact's phone numbers
  let numbersSection = ``;
  let dBRefContact = firebase.database().ref(`${key}`);

  dBRefContact.on("value", entry => {
    const dBData = entry.val();
    for (let numKey in dBData) {
      if (numKey != "name" && numKey != "key") {
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
    for (let i = 0; i < hub.contactsArray.length; i++) {
      hub.printCard(hub.contactsArray[i].name, hub.contactsArray[i].key);
    }
  });
};

//push a name to Firebase as a new entry
hub.newEntry = () => {
  $("#newEntry")
    .unbind("submit")
    .on("submit", e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      let name = $("#newName").val();
      let pushKey = hub.dBRef.push().key;
      firebase
        .database()
        .ref(`/${pushKey}`)
        .update({ name, numbers: {}, key: pushKey });
      $("#newName").val("");
      return false;
    });
};

//push a number and its type to Firebase under the specific person's property
hub.newNum = () => {
  $(document).on("submit", "#newNum", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    let type = $(this)
      .find("select")
      .val();
    let number = $(this)
      .find("input")
      .val();
    let contactKey = $(this).data("key");
    if (number.match(/[a-zA-Z]/) === null) {
      let phone = { type, number };
      let name = $(this).data("name");
      let key = "";

      //find the unique firebase key for this specific contact
      hub.contactsArray.some(entry => {
        if (entry.name === name) {
          key = entry.key;
          return key;
        }
      });

      //add the phone number and type to this contact
      const dBRefContact = firebase.database().ref(`/${contactKey}`);
      dBRefContact.once("value", snapshot => {
        dBRefContact.push(phone);
        $(this)
          .find("input")
          .val("");
      });
    } else {
      alert("Please enter a valid phone number");
      return false;
    }
  });
};

hub.deleteEntry = () => {
  $(document).on("click", ".deleteContact", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let key = $(this).data("key");
    firebase
      .database()
      .ref(`/${key}`)
      .remove();
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
