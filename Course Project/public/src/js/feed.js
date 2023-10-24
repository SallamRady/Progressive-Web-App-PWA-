var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


// allow to save assets in cache.
function handleSaveClick() {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested').then(cache => {
      cache.add('https://httpbin.org/get');
      cache.add('/src/images/eg-binner.jpg');
    });
  }
}

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp p-3';
  cardWrapper.style.margin = '0.5rem 1rem';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/eg-binner.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'Ciaro Trip';
  cardTitleTextElement.style.color = '#fff';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In Egypt';
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
var url = 'https://httpbin.org/get';
var networkDataRecived = false;
// Operation num 1 in Strategy
if ('caches' in window) {
  caches.match(url).then(res => {
    return res.json();
  }).then(data => {
    console.log("[web-page] Cache data :", data);
    if (!networkDataRecived)
      createCard();
  });
}
// Operation num 2 in Strategy
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log("[web-page] network data :", data);
    clearCards();
    createCard();
  });
