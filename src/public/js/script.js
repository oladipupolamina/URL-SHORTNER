import { custom } from "joi";

const token = "503bf5006708dc769617c571f07206858ef8c018";
const button = document.querySelector("#shorten");
const input = document.querySelector("#input-field");
const customDomain = document.querySelector("#domain-field");
const longUrl = document.querySelector("#input-url");
const shortUrl = document.querySelector("#new-url");
const resultDiv = document.querySelector("#output-div")
const errorDiv = document.querySelector("#error-div");
const errorMessage = document.querySelector("#error-text");
const clearButton = document.querySelector("#clear-btn");
const copyButton = document.querySelector("#copy-btn");
const shortHistoryList = document.querySelector("#short-history");

/* button action */
button.addEventListener("click", (event) => {
  event.preventDefault();
  if(input.value && customDomain.value) {
    shorten(input.value, customDomain.value);
  } else {
    showError();
    hideResult();
  }
})

/* function to handle errors */
const handleError = (response) => {
  console.log(response);
//   response
  if(!response.ok) {
    
    showError("Please enter a valid URL.");
    hideResult();
  } else {
  hideError();
  return response;
  }
}

/* function to get shortened url with input "url" with fetch and deal with error */
const shorten = (input, domain) => {
    // console.log(input)
    shortUrl.innerHTML = "Please wait...";
    showResult()
    const userId = localStorage.getItem("user_id")
    console.log(userId);
    fetch("/shorten-url", {
        method: "POST",
        headers: {
            //   "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "url": input,
            "domain": domain,
            "userId": userId == null ? "" : userId,
        }),
    })
    .then(handleError)
    .then(response => response.json())
    .then((json) => {
        localStorage.setItem('user_id', json.userId);
        shortUrl.innerHTML = json.shortUrl;
        getUpdated()
        showResult();
    })
    .catch(error => {
        console.log(error);
    })
}

const getUpdated = () => {
    const userId = localStorage.getItem('user_id')
    fetch("/history/"+userId, {
        method: "GET"
    })
    .then((v) => v.json())
    .then((v) => {
        console.log(v)
        localStorage.setItem('history', JSON.stringify(v))
        showHistory(v);
    })
}

/* Clipboard functions */

// const clipboard = new ClipboardJS("#copy-btn");

// clipboard.on('success', function(e) {
//     console.info('Action:', e.action);
//     console.info('Text:', e.text);
//     console.info('Trigger:', e.trigger);

//     e.clearSelection();
// });

// clipboard.on('error', function(e) {
//     console.error('Action:', e.action);
//     console.error('Trigger:', e.trigger);
// });

/* Clear fields */
const clearFields = () => {
  input.value = '';
  hideResult();
  hideError();
}

clearButton.addEventListener("click", (event) => {
  event.preventDefault();
  clearFields();
})


/* display/hide results and errors */
const showResult = () => {
  shortUrl.style.display = "flex";
  hideError()
}

const hideResult = () => {
  shortUrl.style.display = "none";
}

const showError = (message) => {
    errorMessage.textContent = message
    errorDiv.style.display = "block";
    hideResult()
}

const hideError = () => {
  errorDiv.style.display = "none";
}

const showHistory = () => {
    let history = localStorage.getItem("history")
    const his = JSON.parse(history)
    console.log(his);

    shortHistoryList.innerHTML = "";

    for (let index = 0; index < his.length; index++) {
        const short = his[index];
        const element = document.createElement("li")
        const aElement = document.createElement("a")

        aElement.setAttribute("href", short['shortUrl'])
        aElement.setAttribute("target","__blank")

        aElement.innerHTML = short['shortUrl']

        element.setAttribute("class", "short_history")

        element.appendChild(aElement)

        element.style = "color: white"

        shortHistoryList.appendChild(element);
    }

}

getUpdated();
