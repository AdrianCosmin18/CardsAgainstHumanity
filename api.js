function api(path, method = "GET", body = null) {

    const url = "http://localhost:8080/cards-against-humanity/" + path;

    const options = {
        method,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        mode:"cors",
    };
    if(body !== null){
        options.body = JSON.stringify(body);
    }
    return fetch(url, options);
}

async function fetchBlackCard() {
    return new Promise((resolve, reject) => {
        const randomIndex = Math.floor(Math.random() * blackCards.length);
        resolve(blackCards[randomIndex]);
    });

    // const response = await api('/get-black-card');
    // if (response.status === 200) {
    //     const data = await response.json();
    //     console.log(data);
    //     return data;
    // } else {
    //     await data.json();
    //     throw Error(data.message);
    // }
}

async function fetchWhiteCards() {
    return new Promise((resolve, reject) => {
        const shuffled = [...whiteCards].sort(() => 0.5 - Math.random()); // Amestecă lista
        resolve(shuffled.slice(0, 10));
    })

    // const response = await api('/get-white-cards');
    // if (response.status === 200) {
    //     const data = await response.json();
    //     console.log(data);
    //     return data;
    // } else {
    //     await data.json();
    //     throw Error(data.message);
    // }
}

async function submitAnswer() {

}