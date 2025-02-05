// date membre globale
let currentMaxSpaces = 0;
let currentSelectedCards = 0;

const firstPunchline = 1;
const secondPunchline = 2;
let firstPunchlineUsed = false;
let secondPunchlineUsed = false;

// randarea paginii
(async () => {
    await displayBlackCard();
    displayWhiteCards().then(() => handleCardSelection());
    document.getElementById('submit-button').addEventListener('click', function (event){
        submitAnswer(event.target);
    });
})();

// obtinere si afisare prompt
async function displayBlackCard() {
    const cardObject = await fetchBlackCard();
    document.getElementById('black-card').innerText = cardObject.sentence;
    currentMaxSpaces = cardObject.spaces;
}

// obtinere si afisare punchline-uri
async function displayWhiteCards() {
    const whiteCardsAreaHtmlElem = document.getElementById('white-cards-area');
    whiteCardsAreaHtmlElem.innerHTML = '';

    const whiteCardsArray = await fetchWhiteCards();
    whiteCardsArray.forEach(card => {
        const cardElement = createCardElement(card);
        whiteCardsAreaHtmlElem.append(cardElement);
    });
}

// gestionarea selectiei cardurilor
async function handleCardSelection() {
    const whiteCardsArea = document.getElementById('white-cards-area');
    whiteCardsArea.addEventListener('click', (e) => {
        let cardElem = getCardParentElementFromClickAnywhereInCardContainer(e);

        if (!cardElem || cardElem.classList.contains(StatusAction.DISABLED)) { // sanityCheck => dc. nu avem click pe card sau daca cardul e dezactivat => facem nimic
            return;
        }

        if (cardElem.tagName.toLowerCase() === "div" && cardElem.classList.contains('card')) { // dc. e card
            if (!cardElem.classList.contains(StatusAction.SELECTED) && currentSelectedCards < currentMaxSpaces ) { // dc. nu e selectat si dc. nr. curent de carduri selectate < nr. curent de cuvtine disponibile pentru propozitia curenta
                makeCardSelected(cardElem); // marcam cardul ca fiind selectat

                currentSelectedCards++; // crestem nr. de carduri curente selectate
                if (currentMaxSpaces === 2) { // dc. avem propozitie cu 2 spatii disp. => are sens sa adaugam badge-uri pentru carduri
                    addBadgeElementForCard(cardElem); // adaugam badge cardului
                }
                if (currentSelectedCards === currentMaxSpaces) { // dc. nr. curent de carduri selectate = nr. curent de cuvtine disponibile pentru propozitia curenta
                    changeDisableStatusForUnusedCards(StatusAction.DISABLED); // toate cardurile nefolosite devin disable
                }
            } else if (cardElem.classList.contains(StatusAction.SELECTED)) { // dc. cardul este marcat ca fiind selectat
                if (currentSelectedCards === currentMaxSpaces) {
                    changeDisableStatusForUnusedCards(StatusAction.ENABLED); // toate cardurile nefolosite devin enable
                }
                if (currentMaxSpaces === 2) { // dc. avem propozitie cu 2 spatii disp. => are sens sa adaugam badge-uri pentru carduri
                    removeBadgeElementForCard(cardElem); // stergem badge-ul cardului
                }
                currentSelectedCards--; // scadem nr. de carduri curente selectate

                makeCardUnselected(cardElem); // marcam cardul ca fiind neselectat
            }
            checkValiditySubmitButton(); // verif. dc. se respecta regula jocului pt. a trimite raspunsul
        }
    });
}


// logica adaugare badge
function addBadgeElementForCard(cardElem) {
    if (!firstPunchlineUsed) { //dc. nu a fost aleasa inca prima pozitie din propozitie
        const badge = createBadgeElementForCard(firstPunchline);
        firstPunchlineUsed = true;
        cardElem.appendChild(badge);
        cardElem.dataset.indexSentence = `${firstPunchline}`; // adauga un nou atribut cardului de tipul: "data-index-sentence="1"
    } else if (!secondPunchlineUsed) { //dc. nu a fost aleasa a doua pozitie din propozitie
        const badge = createBadgeElementForCard(secondPunchline);
        secondPunchlineUsed = true;
        cardElem.appendChild(badge);
        cardElem.dataset.indexSentence = `${secondPunchline}`; // adauga un nou atribut cardului de tipul: "data-index-sentence="2"
    }
}

// logica stergere badge
function removeBadgeElementForCard(cardElem) { // scoatem badge-ul cardului curent
    const spanChildArray = cardElem.getElementsByTagName('span'); // dc. cardul are badge copil => intoarce o lista de span-uri
    let spanElem = null;
    if (spanChildArray.length === 1) { // dc. are o un singur copil de tip span
        spanElem = spanChildArray[0];
    }

    if (spanElem) { // dc. exista span-ul copil disponibil
        if (+cardElem.dataset.indexSentence === firstPunchline && firstPunchlineUsed) { // verif. dc. cardul are badge de pozitie 1 in propozitie si e folosit
            cardElem.removeAttribute('data-index-sentence'); //stergem atributul cu pozitia 1 in propozitie
            cardElem.removeChild(spanElem);
            firstPunchlineUsed = false;
        } else if (+cardElem.dataset.indexSentence === secondPunchline && secondPunchlineUsed) { // verif. dc. cardul are badge de pozitie 2 in propozitie si e folosit
            cardElem.removeAttribute('data-index-sentence'); //stergem atributul cu pozitia 2 in propozitie
            cardElem.removeChild(spanElem);
            secondPunchlineUsed = false;
        }
    }
}



// functie folosita pt. a obtine
function getCardParentElementFromClickAnywhereInCardContainer(obj) { //trebuie sa fie inauntrul elementului care are in class 'white-cards-area'
    let elem = obj.target;
    if (elem.tagName.toLowerCase() === 'div' && elem.classList.contains('card')) { // is parent card container
        return elem;
    }
    if (elem.tagName.toLowerCase() === 'button' || elem.tagName.toLowerCase() === 'h5') { //is button or h5 title
        return elem.parentNode.parentNode;
    }
    if (elem.classList.contains('card-body')) { // is anywhere inside card-body
        return elem.parentNode;
    }
    return null; // inseamna ca a dat click inafara cardului deci nu ne intereseaza
}



// activarea/dezacticarea elemtelor de card nefolosite in cadrul selectiei
function changeDisableStatusForUnusedCards(status) {
    const allCards = document.getElementsByClassName('card');
    Array.from(allCards).forEach(card => {
        if (!card.classList.contains(StatusAction.SELECTED)) {
            if (status === StatusAction.DISABLED) { // dc. vrem sa dezactivam cardu;
                card.classList.add(StatusAction.DISABLED); // comenzi de a face cardul sa se "compoerte" disable
                card.style.cursor = "normal";
                card.style.opacity = "0.5";
            } else {
                card.classList.remove(StatusAction.DISABLED); // comenzi de a face cardul sa se "compoerte" enable (sa fie din nou selectabil
                card.style.cursor = "pointer";
                card.style.opacity = "1";
            }
        }
    });
}

// logica de activare a butonului de submit
function checkValiditySubmitButton() {
    const submitButton =  document.getElementById('submit-button');
    if (currentSelectedCards === currentMaxSpaces && submitButton.disabled) {
        submitButton.disabled = false;
    }

    if (currentSelectedCards !== currentMaxSpaces && !submitButton.disabled) {
        submitButton.disabled = true;
    }
}


async function submitAnswer(submitButton) {
    if (currentSelectedCards === currentMaxSpaces && !submitButton.disabled) {
        getSelectedCardsInfo();
        window.location.reload();
    }
    // const cardId = selectedCard.getAttribute('data-card-id');
    // await fetch('/api/submit-answer', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ cardId })
    // });
}

function getSelectedCardsInfo() {
    const allCards = document.getElementsByClassName('card');
    let response = '';
    Array.from(allCards).forEach(card => {
        if (card.classList.contains(StatusAction.SELECTED)) { // dc. e card marcat ca selectat
            if (currentMaxSpaces === 1) { // dc. e runda cu un singur spatiu
                response = card.firstElementChild.firstElementChild.innerText
            } else { //runda cu 2 spatii => ne intereseaza id-ul propozitiei si index-ul
                response += card.dataset.indexSentence + " " + card.firstElementChild.firstElementChild.innerText + "\n";
            }
        }
    });
    alert(response);
}