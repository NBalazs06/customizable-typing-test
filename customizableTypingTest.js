import { validStrForTextToTypeRegex, words } from "./words.js";

//HTML ELEMENTS
const punctuationButton = document.getElementById("punctuationButton");
const numbersButton = document.getElementById("numbersButton");
const languageSelect = document.getElementById("languageSelect");
const resetButton = document.getElementById("resetButton");
const timeLeftDisplay = document.getElementById("timeLeftDisplay");
const rawWpmSpan = document.getElementById("rawWpmSpan");
const correctCharactersOnlyWpmSpan = document.getElementById("correctCharactersOnlyWpmSpan");
const textToType = document.getElementById("textToType");
const resultsTable = document.getElementById("resultsTable");
const correctCharactersInEndResultTd = document.getElementById("correctCharactersInEndResultTd");
const incorrectCharactersInEndResultTd = document.getElementById("incorrectCharactersInEndResultTd");
const rawWpmTd = document.getElementById("rawWpmTd");
const correctCharactersOnlyWpmTd = document.getElementById("correctCharactersOnlyWpmTd");
const accuracyTd = document.getElementById("accuracyTd");

//OTHER GLOBAL DECLARATIONS
const defaultTypingLanguageOption = "English";
const minLineLength = 75;
const cursorBlinkingIntervalTimeMs = 500;
const singlePunctuationCharacters = [".", ",", ";", ":", "?", "!", " -"];
const pairedPunctuationCharacters = [["(", ")"], ["[", "]"], ["{", "}"], ["\"", "\""], ["'", "'"]];
const sentenceEndingPunctuationCharacters = new Set([".", "?", "!"]);
const punctuationCharacters = new Set(
    [...singlePunctuationCharacters.map(char => char.trim()), ...pairedPunctuationCharacters.flat().map(char => char.trim())]
); //trimming is needed for " -" for example
const toggleButtons = [punctuationButton, numbersButton];
const durationButtons = document.querySelectorAll("#durationButtons button");
const radioGroups = [[...durationButtons]];
const inactiveSessionExclusiveInputs = new Set(Array.from(document.querySelectorAll("button, select")).filter(input => input !== resetButton));

let cursorLineIdx = 0;
let cursorCharIdx = 0;
let timerDurationSeconds = 15;
let correctCharactersTyped = 0;
let incorrectCharactersTyped = 0;
let nonBackspaceKeystrokes = 0;
let typingSessionActive = false;
let realTimeStatsUpdateIntervalId = null;
let cursorBlinkingIntervalId = null;

//MAIN LOGIC
radioGroups.forEach(radioGroupSubarr => createRadioGroup(radioGroupSubarr));
toggleButtons.forEach(toggleButton => addBasicToggleBehaviorToButton(toggleButton));

Object.keys(words).forEach(languageName => {
    const optionElement = document.createElement("option");
    optionElement.value = optionElement.innerHTML = languageName;
    languageSelect.appendChild(optionElement);
});

if (languageSelect.querySelector(`option[value="${defaultTypingLanguageOption}"]`))
    languageSelect.value = defaultTypingLanguageOption;
else
    console.error(`Default language option (${defaultTypingLanguageOption}) not found.`);

refreshTextToType();

resetButton.addEventListener("click", () => {
    refreshTextToType();
});

[punctuationButton, numbersButton].forEach(button => {
    button.addEventListener("click", () => {
        if (typingSessionActive)
            return;

        refreshTextToType();
    });
});

durationButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (typingSessionActive)
            return;

        if (timerDurationSeconds === 0)
            refreshTextToType();

        timerDurationSeconds = Number(button.dataset.durationSeconds);
        updateTimerDisplay();
    });
});

languageSelect.addEventListener("change", () => {
    if (typingSessionActive)
        return;

    refreshTextToType();
});

window.addEventListener("keydown", (event) => {
    if (timerDurationSeconds === 0)
        return;

    if (event.key === "Backspace") {
        backspace(event.ctrlKey);
        return;
    }

    if (event.code === "Space")
        event.preventDefault();
    
    if (event.key.length !== 1 || !validStrForTextToTypeRegex.test(event.key))
        return;

    setTypingSessionActive(true);

    nonBackspaceKeystrokes++;

    const userPressedSpaceCorrectly = event.code === "Space" && textToType.children[cursorLineIdx].children[cursorCharIdx].innerHTML === "&nbsp;";

    if (userPressedSpaceCorrectly || textToType.children[cursorLineIdx].children[cursorCharIdx].innerHTML === event.key) {
        textToType.children[cursorLineIdx].children[cursorCharIdx].classList.add("highlightedCharacter");
        correctCharactersTyped++;
    } else {
        textToType.children[cursorLineIdx].children[cursorCharIdx].classList.add("mistypedCharacter");
        incorrectCharactersTyped++;
    }

    textToType.children[cursorLineIdx].children[cursorCharIdx].classList.remove("cursorMarkedCharacter");

    cursorCharIdx++;

    if (cursorCharIdx === textToType.children[cursorLineIdx].children.length) {
        if (cursorLineIdx === 0) {
            cursorLineIdx = 1;
        } else {
            textToType.children[0].innerHTML = textToType.children[1].innerHTML;
            textToType.children[1].innerHTML = textToType.children[2].innerHTML;
            textToType.children[2].innerHTML = getRandomText(
                minLineLength, sentenceEndingPunctuationCharacters.has(textToType.children[1].textContent[textToType.children[1].textContent.length - 2])
            );
        }

        cursorCharIdx = 0;
    }

    textToType.children[cursorLineIdx].children[cursorCharIdx].classList.add("cursorMarkedCharacter");
});

//FUNCTIONS
function backspace(pressedWithCtrl) {
    if (cursorCharIdx === 0 && cursorLineIdx === 0)
        return;

    const lastSpanTypedBeforeBackspacePressed = cursorCharIdx === 0
    ? textToType.children[0].children[textToType.children[0].children.length - 1]
    : textToType.children[cursorLineIdx].children[cursorCharIdx - 1];

    do {
        const [lineIdxOfSpanToBackspaceOn, charIdxOfSpanToBackspaceOn] = cursorCharIdx === 0
        ? [0, textToType.children[0].children.length - 1]
        : [cursorLineIdx, cursorCharIdx - 1];

        const spanToBackspaceOn = textToType.children[lineIdxOfSpanToBackspaceOn].children[charIdxOfSpanToBackspaceOn];

        if (spanToBackspaceOn.classList.contains("highlightedCharacter")) {
            spanToBackspaceOn.classList.remove("highlightedCharacter");
            correctCharactersTyped--;
        } else {
            spanToBackspaceOn.classList.remove("mistypedCharacter");
            incorrectCharactersTyped--;
        }

        textToType.children[cursorLineIdx].children[cursorCharIdx--].classList.remove("cursorMarkedCharacter");

        cursorLineIdx = lineIdxOfSpanToBackspaceOn;
        cursorCharIdx = charIdxOfSpanToBackspaceOn;

        spanToBackspaceOn.classList.add("cursorMarkedCharacter");
    } while (
        (cursorLineIdx !== 0 || cursorCharIdx !== 0) &&
        pressedWithCtrl &&
        isWordBoundary(textToType.children[cursorLineIdx].children[cursorCharIdx - 1].innerHTML) === isWordBoundary(lastSpanTypedBeforeBackspacePressed.innerHTML)
    );
}

function isWordBoundary(character) {
    return character === "&nbsp;" || punctuationCharacters.has(character);
}

function getRandomText(minLength, capitalizeFirstWord) {
    let result = "";
    let nonNumberIterationsStreakLength = 0;
    let innerCharacterLengthOfResult = 0;
    let capitalizeNextWord = capitalizeFirstWord;

    while (innerCharacterLengthOfResult < minLength) {
        let strToAdd = "";

        const [openingPairPunctuationCharacter, closingPairPunctuationCharacter] = (punctuationButton.classList.contains("enabledButton") && Math.random() > 0.95)
        ? pairedPunctuationCharacters[Math.floor(Math.random() * pairedPunctuationCharacters.length)]
        : ["", ""];

        strToAdd += openingPairPunctuationCharacter;

        if (numbersButton.classList.contains("enabledButton") && Math.random() < nonNumberIterationsStreakLength * 0.115) {
            strToAdd += String(Math.floor(Math.random() * 10000));
            nonNumberIterationsStreakLength = 0;
        } else {
            const wordArrOfSelectedLanguage = words[languageSelect.value];
            const word = wordArrOfSelectedLanguage[Math.floor(Math.random() * wordArrOfSelectedLanguage.length)];
            strToAdd += capitalizeNextWord ? capitalize(word) : word;
            nonNumberIterationsStreakLength++;
        }

        strToAdd += closingPairPunctuationCharacter;

        if (punctuationButton.classList.contains("enabledButton") && Math.random() > 0.9) {
            const singlePunctuationCharacter = singlePunctuationCharacters[Math.floor(Math.random() * singlePunctuationCharacters.length)];
            strToAdd += singlePunctuationCharacter;
            capitalizeNextWord = sentenceEndingPunctuationCharacters.has(singlePunctuationCharacter);
        } else {
            capitalizeNextWord = false;
        }

        for (const char of strToAdd)
            result += "<span>" + char + "</span>";

        result += "<span>&nbsp;</span>"
        innerCharacterLengthOfResult += strToAdd.length + 1;
    }
    
    return result;
}

function createRadioGroup(buttons) {
    buttons.forEach(button1 => {
        button1.addEventListener("click", () => {
            if (typingSessionActive)
                return;

            buttons.forEach(button2 => {
                if (button2 === button1)
                    return;
                
                button2.classList.remove("enabledButton");
                button2.classList.add("disabledButton");
            });

            button1.classList.remove("disabledButton");
            button1.classList.add("enabledButton");
        });
    });
}

function addBasicToggleBehaviorToButton(button) {
    button.addEventListener("click", () => {
        if (typingSessionActive)
            return;

        button.classList.toggle("disabledButton");
        button.classList.toggle("enabledButton");
    });
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function updateTimerDisplay() {
    const minutesNum = Math.floor(timerDurationSeconds / 60);
    const secondsNum = timerDurationSeconds % 60;
    timeLeftDisplay.innerHTML = (minutesNum < 10 ? "0" : "") + minutesNum + ":" + (secondsNum < 10 ? "0" : "") + secondsNum;
}

function setTypingSessionActive(active) {
    if (typingSessionActive === active)
        return;

    typingSessionActive = active;

    if (typingSessionActive) {
        inactiveSessionExclusiveInputs.forEach(button => {
            button.classList.add("lockedInput");
        });

        clearInterval(cursorBlinkingIntervalId);

        textToType.children[cursorLineIdx].children[cursorCharIdx].classList.add("cursorMarkedCharacter");

        wpmDisplay.style.color = timeLeftDisplay.style.color = "var(--highlightColor)";

        rawWpmSpan.innerHTML = 0;
        correctCharactersOnlyWpmSpan.innerHTML = 0;

        realTimeStatsUpdateIntervalId = setInterval(() => {
            decrementTimer(1);

            const timeElapsedSeconds = Number(document.querySelector("#durationButtons .enabledButton").dataset.durationSeconds) - timerDurationSeconds;

            rawWpmSpan.innerHTML = getWpm(correctCharactersTyped + incorrectCharactersTyped, timeElapsedSeconds).toFixed(2);
            correctCharactersOnlyWpmSpan.innerHTML = getWpm(correctCharactersTyped, timeElapsedSeconds).toFixed(2);
        }, 1000);
    } else {
        inactiveSessionExclusiveInputs.forEach(button => {
            button.classList.remove("lockedInput");
        });

        wpmDisplay.style.color = timeLeftDisplay.style.color = "var(--basicTextColor)";

        clearInterval(realTimeStatsUpdateIntervalId);
    }
}

async function decrementTimer(seconds) {
    timerDurationSeconds -= seconds;
    updateTimerDisplay();

    if (timerDurationSeconds === 0)
        displayResultsScreen();
}

function displayResultsScreen() {
    const sessionTimespan = Number(document.querySelector("#durationButtons .enabledButton").dataset.durationSeconds);
    const correctCharactersInEndResultPercent = correctCharactersTyped / (correctCharactersTyped + incorrectCharactersTyped) * 100;
    const rawWpm = getWpm(correctCharactersTyped + incorrectCharactersTyped, sessionTimespan);
    const correctCharactersOnlyWpm = getWpm(correctCharactersTyped, sessionTimespan);

    setTypingSessionActive(false);

    textToType.children[0].innerHTML = "";
    textToType.children[1].innerHTML = "Session ended.";
    textToType.children[2].innerHTML = "Results:";

    correctCharactersInEndResultTd.innerHTML = correctCharactersTyped +
    (isNaN(correctCharactersInEndResultPercent) ? "" : " (" + correctCharactersInEndResultPercent.toFixed(2) + "%)");

    incorrectCharactersInEndResultTd.innerHTML = incorrectCharactersTyped +
    (isNaN(correctCharactersInEndResultPercent) ? "" : " (" + (100 - correctCharactersInEndResultPercent).toFixed(2) + "%)");

    rawWpmTd.innerHTML = rawWpm.toFixed(2) + " WPM";
    rawWpmSpan.innerHTML = rawWpm.toFixed(2);

    correctCharactersOnlyWpmTd.innerHTML = correctCharactersOnlyWpm.toFixed(2) + " WPM";
    correctCharactersOnlyWpmSpan.innerHTML = correctCharactersOnlyWpm.toFixed(2);

    accuracyTd.innerHTML = (correctCharactersTyped / nonBackspaceKeystrokes * 100).toFixed(2) + "%";
    
    resultsTable.style.display = "table";
}

function getWpm(characterCount, timeSeconds) {
    return (characterCount / 5) / (timeSeconds / 60);
}

function refreshTextToType() {
    setTypingSessionActive(false);

    resultsTable.style.display = "none";

    textToType.children[0].innerHTML = getRandomText(
        minLineLength, punctuationButton.classList.contains("enabledButton")
    );

    textToType.children[1].innerHTML = getRandomText(
        minLineLength, sentenceEndingPunctuationCharacters.has(textToType.children[0].textContent[textToType.children[0].textContent.length - 2])
    );

    textToType.children[2].innerHTML = getRandomText(
        minLineLength, sentenceEndingPunctuationCharacters.has(textToType.children[1].textContent[textToType.children[1].textContent.length - 2])
    );

    correctCharactersTyped = incorrectCharactersTyped = nonBackspaceKeystrokes = cursorCharIdx = cursorLineIdx = 0;
    rawWpmSpan.innerHTML = "Raw";
    correctCharactersOnlyWpmSpan.innerHTML = "Correct-characters-only";

    clearInterval(cursorBlinkingIntervalId);

    textToType.children[cursorLineIdx].children[cursorCharIdx].classList.add("cursorMarkedCharacter");

    cursorBlinkingIntervalId = setInterval(() => {
        textToType.children[cursorLineIdx].children[cursorCharIdx].classList.toggle("cursorMarkedCharacter");
    }, cursorBlinkingIntervalTimeMs);

    timerDurationSeconds = Number(document.querySelector("#durationButtons .enabledButton").dataset.durationSeconds);
    updateTimerDisplay();
}