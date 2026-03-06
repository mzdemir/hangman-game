import './style.css'

let isGameOn = false
let renderHowToPlay = false
let isCategoryPicked = false
let pickedCategory: string | undefined
let currentWord = ""
let wrongGuesses = 0
let isWon = false
let isLost = false
let isPaused = false
const keyboard = "abcdefghijklmnopqrstuvwxyz"
const maxWrong = 8

const app = document.querySelector<HTMLDivElement>('#app')!

app.addEventListener("click", (event) => {
  const target = event.target as HTMLElement
  const actionElement = target.closest("[data-action]")

  if (!(actionElement instanceof HTMLElement)) return
  const action = actionElement.dataset.action

  if (action === "start-game") {
    isGameOn = true
    render()
  }

  if (action === "how-to-play") {
    renderHowToPlay = true
    render()
  }
  if (action === "go-back") {
    isGameOn = false
    renderHowToPlay = false
    render()
  }

  if (action === "pick-a-category") {
    isCategoryPicked = true
    pickedCategory = actionElement.dataset.category
    if (pickedCategory) currentWord = getRandomWord(categories[pickedCategory])
    render()
  }

  if (action === "guess-letter") {
    const letterboxes = document.querySelectorAll<HTMLElement>(".letter")
    const clickedLetter = actionElement.textContent?.trim().toUpperCase()
    actionElement.classList.add("opacity-25", "pointer-events-none")
    const isCorrect = currentWord.toUpperCase().includes(clickedLetter)

    if (isCorrect) {
      letterboxes.forEach(box => {
        if (box.dataset.letter?.toUpperCase() === clickedLetter) {
          box.classList.remove("opacity-25")
          box.querySelector("span")?.classList.remove("hidden")
        }
      })

      const allRevealed = Array.from(letterboxes).every(box =>
        !box.classList.contains("opacity-25"))

      if (allRevealed) {
        isWon = true
        render()
      }

    } else {
      wrongGuesses++
      const healthPercent = 100 - (wrongGuesses / maxWrong) * 100
      const healthBar = document.querySelector<HTMLElement>(".health-bar")
      if (healthBar) healthBar.style.width = `${healthPercent}%`
    }
  }

  if (action === "pause-game") {
    isPaused = true
    render()
  }

  if (action === "continue") {
    isPaused = false
    render()
  }

  if (action === "new-category") {
    wrongGuesses = 0
    isWon = false
    isLost = false
    isPaused = false
    isCategoryPicked = false
    pickedCategory = undefined
    currentWord = ""
    render()
  }

  if (action === "quit") {
    isCategoryPicked = false
    isPaused = false
    isGameOn = false
    isLost = false
    render()
  }

  if (wrongGuesses === 8) {
    isLost = true
    render()
  }

  if (action === "play-again") {
    wrongGuesses = 0
    isWon = false
    isLost = false
    isPaused = false
    if (pickedCategory) currentWord = getRandomWord(categories[pickedCategory])
    render()
  }
})

function render() {
  if (!isGameOn) app.innerHTML = mainMenu
  if (renderHowToPlay) app.innerHTML = howToPlay
  if (isGameOn && !isCategoryPicked) app.innerHTML = categoryPick
  if (isCategoryPicked) app.innerHTML = inGame(pickedCategory)
  if (isPaused || isWon || isLost) app.innerHTML = inGame(pickedCategory) + menu()
}

async function getCategories() {
  const response = await fetch("./data.json")
  const result = await response.json()
  return result.categories
}

const categories = await getCategories()

const mainMenu = `
  <main aria-live="assertive" class="bg-[image:var(--gradient-1)] max-w-[90rem] rounded-[3rem] shadow-(--shadow-1) relative w-[20.25rem] md:w-[37rem] h-[30rem] mbs-[3rem] sm:mbs-[5rem]">
    <div class="flex flex-col items-center gap-[3.625rem]  absolute top-[-3.5rem] sm:top-[-5.5rem] bottom-0 left-[2rem] right-[2rem]">
      <img src="../assets/images/logo.svg" alt="The Hangman Game Logo">
      <button data-action="start-game" class="size-[10rem] flex items-center justify-center bg-[image:var(--gradient-3)] rounded-full shadow-(--shadow-2) cursor-pointer" aria-label="Click to start game">
        <img class="size-[3.25rem]" src="../assets/images/icon-play.svg" aria-hidden="true">
      </button>
      <button data-action="how-to-play" class="text-preset-8 bg-(--blue-600) text-(--neutral-0) p-[0.75rem] w-full rounded-full shadow-(--shadow-3) cursor-pointer mx-[4rem] max-w-[16.25rem]">
        HOW TO PLAY
      </button>
    </div>
  </main>
`

const header = (title: string) => `
  <header class="flex justify-between items-center pbe-[5rem] w-full">
    <button data-action="go-back" class="size-[2.5rem] md:size-[4rem] bg-[image:var(--gradient-3)] rounded-full flex justify-center items-center" aria-label="Click to return to main menu">
      <img class="size-[1.125rem] md:size-[1.75rem]" src="../assets/images/icon-back.svg" aria-hidden="true">
    </button>
    <h1 class="text-(length:--fs-6)/(--lh) tracking-(--ls-6) md:text-(length:--fs-2)/(--lh) md:tracking-(--ls-1) text-border uppercase md:m-auto" data-text="${title}">${title}</h1>
  </header>
`

const howToPlay = `
  <main aria-live="assertive">
  ${header("how to play")}
    <ol class="flex flex-col gap-[1.5rem] ">
      <li class=" p-[2rem] bg-(--neutral-0) grid grid-cols-[auto_1fr] gap-[1rem] md:gap-x-[2.5rem] rounded-[1.25rem]">
      <span class="text-(--blue-600) text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-4) tracking-(--ls-4) md:row-span-2 self-center">01</span>
        <h2 class="text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-7) tracking-(--ls-7) flex gap-[1rem] text-(--indigo-600) uppercase w-full">
          Choose a category
        </h2>
        <p class="text-(length:--fs-12)/(--lh) tracking-(--ls-10) text-(--indigo-400) md:text-(length:--fs-11)  col-span-2 md:col-span-1">
          First, choose a word category, like animals or movies. 
          The computer then randomly selects a secret word from that 
          topic and shows you blanks for each letter of the word.
        </p>
      </li>
      <li class=" p-[2rem] bg-(--neutral-0) grid grid-cols-[auto_1fr] gap-[1rem] md:gap-x-[2.5rem] rounded-[1.25rem]">
        <span class="text-(--blue-600) text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-4) tracking-(--ls-4) md:row-span-2 self-center">02</span>
        <h2 class="text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-7) tracking-(--ls-7) flex gap-[1rem] text-(--indigo-600) uppercase">
          Guess letters
        </h2>
        <p class="text-(length:--fs-12)/(--lh) tracking-(--ls-10) md:text-(length:--fs-11) text-(--indigo-400) col-span-2 md:col-span-1">
          Take turns guessing letters. The computer fills in the relevant blank 
          spaces if your guess is correct. If it's wrong, you lose some health, 
          which empties after eight incorrect guesses.
        </p>
      </li>
      <li class=" p-[2rem] bg-(--neutral-0) grid grid-cols-[auto_1fr] gap-[1rem] md:gap-x-[2.5rem] rounded-[1.25rem]">
        <span class="text-(--blue-600) text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-4) tracking-(--ls-4) md:row-span-2 self-center">03</span>
        <h2 class="text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-7) tracking-(--ls-7) flex gap-[1rem] text-(--indigo-600) uppercase">
          Win or lose
        </h2>
        <p class="text-(length:--fs-12)/(--lh) tracking-(--ls-10) md:text-(length:--fs-11) text-(--indigo-400) col-span-2 md:col-span-1">
          You win by guessing all the letters in the word before your health runs out. 
          If the health bar empties before you guess the word, you lose.
        </p>
      </li>
    </ol>
  </main>
`

const categoryPick =  `
  <main aria-live="assertive" class="w-full max-w-[90rem]">
  ${header("Pick a Category")}
    <ul class="grid gap-[1rem] items-center md:grid-cols-2 md:gap-[2rem] lg:grid-cols-3">
    ${Object.keys(categories).map(cate => `
      <li data-action="pick-a-category" data-category="${cate}" class="text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-6) tracking-(--ls-6) md:py-[4rem] bg-(--blue-600) w-full text-center py-[1.5rem] rounded-[1.25rem] text-(--neutral-0) shadow-(--shadow-3) uppercase">${cate}</li>
    `).join("")} 
    </ul>
  </main> 
`

type Word = { name: string, selected: boolean }
const getRandomWord = (array: Word[]) => {
  return array[Math.floor(Math.random() * array.length)].name
}

const inGame = (category: string | undefined) => `
  <main aria-live="assertive" class="max-w-[90rem]">
    <header class="flex justify-between items-center pbe-[5rem] w-full">
      <div class="flex items-center gap-[1rem] md:gap-[2rem]">
        <button data-action="pause-game" class="size-[2.5rem] md:size-[4rem] p-[.75rem] md:p-[1.25rem] bg-[image:var(--gradient-3)] rounded-full" aria-label="Click to open menu">
          <img class="" src="../assets/images/icon-menu.svg" aria-hidden="true">
        </button>
        <h1 class="text-(length:--fs-7)/(--lh) tracking-(--ls-7) md:text-(length:--fs-6) tracking-(--ls-6) text-(--neutral-0) uppercase">${category}</h1>
      </div>
      <div class="flex items-center gap-[1rem] md:gap-[2.5rem]">
        <div class="flex items-center justify-start h-[1rem] w-[3.5rem] md:w-[10rem] md:h-[2rem] bg-(--neutral-0) rounded-full p-[.25rem] md:p-[.625rem]">
          <div class="health-bar w-full h-[0.5rem] md:h-[.75rem] bg-(--indigo-600) rounded-full transition-all duration-300"></div>
        </div>
        <img class="size-[1.5rem] md:size-[3rem]" src="../assets/images/icon-heart.svg" aria-hidden="true">
      </div>
    </header>

    <section class="wordbox flex flex-wrap justify-center gap-x-[2.0875rem] md:gap-x-[5rem] gap-y-[1rem] w-full">
      ${currentWord.split(" ").map(word => `
      <div class="flex gap-[.5rem] md:gap-[.75rem] flex-wrap">
        ${word.split("").map(letter => `
        <div aria-live="assertive" data-letter="${letter}" class="letter opacity-25 flex items-center justify-center w-[2.0875rem] md:w-[5rem] h-[4.125rem] md:h-[7rem] py-[0.5625rem] md:py-[1.125rem] px-[.5rem] md:px-[2rem] bg-(--blue-600) rounded-[.625rem] md:rounded-[2rem] shadow-(--shadow-3)">
          <span class="hidden text-(length:--fs-7)/(--lh) tracking-(--ls-7) md:text-(length:--fs-4) tracking-(--ls-6) text-(--neutral-0) uppercase">${letter}</span>
        </div>`).join("")}
      </div>`).join("")}
    </section>

    <section class="keyboard grid grid-rows-3 grid-cols-9 gap-x-[.5rem] md:gap-x-[1rem] gap-y-[1.5rem] mbs-[3rem] md:mbs-[5rem] mbe-[10rem]">
      ${keyboard.split("").map((letter) => `
        <button data-action="guess-letter" class="text-(length:--fs-10)/(--lh) tracking-(--ls-10) md:text-(length:--fs-6) tracking-(--ls-6) text-(--indigo-600) bg-(--neutral-0) px-[.5625rem] py-[.875rem] md:px-[1.5rem] rounded-[.5rem] uppercase cursor-pointer">${letter}</button>
      `).join("")}
    </section>
  </main>
`

const menu = () => {
  const menuTitle = isPaused ? "Paused" : isWon ? "You Won" : isLost ? "You Lost" : null
  const action = isPaused ? "continue" : isWon || isLost ? "play-again" : null
  const actionLabel = isPaused ? "Continue" : isWon || isLost ? "Play Again!" : null

  return `
  <div class="overlay">
    <div class=" w-324 max-w-[37rem] h-[27.5rem] mx-[1.5rem] bg-[image:var(--gradient-1)] rounded-[3rem] shadow-(--shadow-1) relative ">
      <div class="flex flex-col items-center gap-[3rem] absolute top-[-3.5rem] bottom-0 right-[1.5rem] left-[1.5rem]">
        <h2 data-text="${menuTitle}" class="text-preset-3 text-border">${menuTitle}</h2>
        <div class="flex flex-col gap-[2rem] w-full">
          <button data-action="${action}" class="text-preset-8 bg-(--blue-600) mx-[1.25rem] text-(--neutral-0) py-[.75rem] rounded-[2.5rem] shadow-(--shadow-3) uppercase">${actionLabel}</button>
          <button data-action="new-category" class="text-preset-8 bg-(--blue-600) text-(--neutral-0) py-[.75rem] rounded-[2.5rem] shadow-(--shadow-3) uppercase">New Category</button>
          <button data-action="quit" class="text-preset-8 bg-[image:var(--gradient-3)] mx-[1.25rem] text-(--neutral-0) py-[.75rem] rounded-[2.5rem] shadow-(--shadow-4) uppercase">Quit Game</button>
        </div>
      </div>
    </div>
  </div>`
}

render()