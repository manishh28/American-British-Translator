const textArea = document.getElementById("text-input");
const localeArea = document.getElementById("locale-select");
const errorArea = document.getElementById("error-msg");
const translatedArea = document.getElementById("translated-sentence");
const translateButton = document.getElementById("translate-btn");
const clearButton = document.getElementById("clear-btn");
const sampleButtons = document.querySelectorAll(".sample-btn");

const resetOutput = () => {
  errorArea.innerText = "";
  translatedArea.innerHTML = "Your translation will appear here.";
};

const translateHandler = async () => {
  errorArea.innerText = "";
  translatedArea.innerHTML = "Translating...";

  const data = await fetch("/api/translate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      text: textArea.value,
      locale: localeArea.value
    })
  });

  const parsed = await data.json();

  if (parsed.error) {
    translatedArea.innerHTML = "Your translation will appear here.";
    errorArea.innerText = JSON.stringify(parsed);
    return;
  }

  translatedArea.innerHTML = parsed.translation;
};

const clearHandler = () => {
  textArea.value = "";
  localeArea.value = "american-to-british";
  resetOutput();
  textArea.focus();
};

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    textArea.value = button.dataset.text;
    localeArea.value = button.dataset.locale;
    translateHandler();
  });
});

translateButton.addEventListener("click", translateHandler);
clearButton.addEventListener("click", clearHandler);
