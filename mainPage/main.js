// Initialize
(async () => {
    await displayBlackCard();
    displayWhiteCards().then(() => handleCardSelection());
    document.getElementById('submit-button').addEventListener('click', function (event){
        submitAnswer(event.target);
    });
})();


let currentMaxSpaces = 0;


async function displayBlackCard() {
    const cardObject = await fetchBlackCard();
    document.getElementById('black-card').innerText = cardObject.sentence;
    currentMaxSpaces = cardObject.spaces;
}

async function displayWhiteCards() {
    const whiteCardsAreaHtmlElem = document.getElementById('white-cards-area');
    whiteCardsAreaHtmlElem.innerHTML = '';

    const whiteCardsArray = await fetchWhiteCards();
    whiteCardsArray.forEach(card => {
        const cardElement = createCardElement(card);
        whiteCardsAreaHtmlElem.append(cardElement);
    });
}

function createCardElement(cardObject) {
    const h5 = document.createElement('h5');
    h5.className = 'card-title';
    h5.textContent = cardObject.text;

    const a = document.createElement('button');
    a.className = 'btn btn-success';
    a.textContent = 'Selectează';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.style.textAlign = 'center';

    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.id = cardObject.id;

    cardBody.appendChild(h5);
    cardBody.appendChild(a);
    cardElement.appendChild(cardBody);

    return cardElement;
}

async function handleCardSelection() {
    const whiteCardsArea = document.querySelector('.card-area');
    whiteCardsArea.addEventListener('click', (e) => {
        let obj = e.target;
        if (obj.tagName.toLowerCase() === "button") {
            if (!obj.classList.contains('selected') && getNumberOfCurrentSelectedCards() < currentMaxSpaces && !obj.disabled) {
                obj.classList.add('selected');
                obj.classList.remove('btn-success');
                obj.classList.add('btn-danger');
                obj.textContent = 'Deselectează';

                if (getNumberOfCurrentSelectedCards() === currentMaxSpaces) {
                    changeStatusUnusedCards(StatusAction.DISABLE);
                }
            } else if (obj.classList.contains('selected')) {
                if (getNumberOfCurrentSelectedCards() === currentMaxSpaces) {
                    changeStatusUnusedCards(StatusAction.ENABLE);
                }

                obj.classList.remove('selected');
                obj.textContent = 'Selectează';
                obj.classList.remove('btn-danger');
                obj.classList.add('btn-success');
            }
            checkValiditySubmitButton();
        }
    });
}

function changeStatusUnusedCards(status) {
    const allButtons = document.getElementsByTagName('button');
    Array.from(allButtons).forEach(button => {
        if (!button.classList.contains('selected')) {
            status === StatusAction.DISABLE ? button.disabled = true : button.disabled = false;
        }
    });
}

function getNumberOfCurrentSelectedCards() {
    let count = 0;
    const buttons = document.getElementsByTagName('button');
    Array.from(buttons).forEach(button => {
        if (button.classList.contains('selected')) {
            count++;
        }
    });
    return count;
}

function checkValiditySubmitButton() {
    const submitButton =  document.getElementById('submit-button');
    if (getNumberOfCurrentSelectedCards() === currentMaxSpaces && submitButton.disabled) {
        submitButton.disabled = false;
    }

    if (getNumberOfCurrentSelectedCards() !== currentMaxSpaces && !submitButton.disabled) {
        submitButton.disabled = true;
    }
}

async function submitAnswer(submitButton) {
    if (getNumberOfCurrentSelectedCards() === currentMaxSpaces && !submitButton.disabled) {
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