var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const snackbarContainer = document.querySelector('#confirmation-toast');

var deferredPrompt; // Define the variable in a scope accessible to your code

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default installation prompt
  event.preventDefault();
  
  // Store the event for later use
  deferredPrompt = event;
  
  // Optionally show your own custom install button
  // For example, if you have an HTML button with the id 'installButton'
  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';
});

function openCreatePostModal() {
  let form101 = document.getElementById("form101");
  form101.style.display = 'flex';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if (deferredPrompt) {
  //   deferredPrompt.prompt();

  //   deferredPrompt.userChoice.then(function (choiceResult) {
  //     // console.log(choiceResult.outcome);

  //     if (choiceResult.outcome === 'dismissed') {
  //       // console.log('User cancelled installation');
  //     } else {
  //       // console.log('User added to home screen');
  //     }
  //   });

  //   deferredPrompt = null;
  // }

  // delete our service workers
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then(registerations => {
  //     for (let i = 0; i < registerations.length; i++) {
  //       registerations[i].unregister();
  //     }
  //   })
  // }

}

function closeCreatePostModal() {
  let form101 = document.getElementById("form101");
  form101.style.display = 'none';
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


// allow to save assets in cache.
function handleSaveClick() {
  // console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested').then(cache => {
      cache.add('https://httpbin.org/get');
      cache.add('/src/images/eg-binner.jpg');
    });
  }
}
function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp p-3';
  cardWrapper.style.margin = '0.5rem 1rem';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("' + data.image + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitleTextElement.style.color = '#fff';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // 
  var saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', handleSaveClick)
  cardSupportingText.appendChild(saveBtn);

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

// Cache,then network strategy.
//firebase url
var url = 'http://localhost:9000/posts';
var urlCreatePost = 'http://localhost:9000/create/post';
var networkDataRecived = false;
// Operation num 1 in Strategy
if ('caches' in window) {
  caches.match(url).then(data => {
    // console.log("BP101 [web-page] Cache data :", data);
    // if (!networkDataRecived)
    //   createCard();
  });
}
// Operation num 2 in Strategy
fetch(url).then(res => {
  return res.json();
}).then(function (data) {
  console.log("DAtt",data)
  clearCards();
  for (let i = 0; i < data?.length; i++) {
    createCard(data[i]);
  }
});


if ('indexDB' in window) {
  readAll().then(data => {
    console.log("[indexDB in feed.js in data]", data);
    if (data) {
      clearCards();
      for (let i = 0; i < data?.posts?.length; i++) {
        createCard(data?.posts[i]);
      }
    }
  }).catch(err => {
    console.log("[indexDB in feed.js in line 116]", err);
  });
}

// background asyncing...

function sendData(data) {
  fetch(urlCreatePost, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(res => {
    console.log("Send Data Operation done - response :", res);
    createCard(data);
  }).catch(err => {
    console.log("Error in send Data to server ", err);
  })
}
// handle create post function
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (titleInput.value.trim() == '' || locationInput.value.trim() == '') {
    alert("All Fields is required!");
    return;
  }
  var post = {
    id: new Date().toISOString(),
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    image: "/src/images/alex.jpeg"
  };
  // check if BackgroundAsync is supported in our Browser.
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    // SyncManager is supported
    navigator.serviceWorker.ready.then((sw) => {
      // store data in indexedDB
      writeDate('sync-posts', post).then(() => {
        // register event in SyncManager
        return sw.sync.register('sync-new-post');
      }).then(() => {
        // send feed back message for user.
        let data = { message: "Your post was saved for syncing!" };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
      }).catch(err => {
        console.log("Error in feed.js in writeDate on indexedDB :", err)
      })
    }).catch(err => {
      console.log("Error in feed.js in create post serviceWorker register :", err)
    })
  } else {
    // normal work
    console.log("SyncManager is not supported");
    sendData(post);
  }
  closeCreatePostModal();
});