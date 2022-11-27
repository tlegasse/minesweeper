class Cell {
    revealed = false
    isMine = false
    hasInputText = true
    x = 0
    y = 0
    width = 0

    constructor(isMine, x, y){
        this.isMine = isMine
        this.x = x
        this.y = y
    }

    getHTMLNode(inputText) {
        if(inputText == ' ') this.hasInputText = false;

        inputText = typeof inputText == 'undefined' ? " " : inputText

        let button = document.createElement('input')
        button.setAttribute('type', 'button')
        button.dataset.y = this.y
        button.dataset.x = this.x
        button.setAttribute('style', `width: ${this.width}`)
        button.value = this.isMine ? '*': inputText

        return button
    }
}

class Game {
    level = 0
    gameBoard = []
    scarcity = 0
    gameEle = document.getElementById('game')
    statusEle = document.getElementById('reset')
    minesCountEle = document.getElementById('mines-count')
    timerEle = document.getElementById('timer')
    timer = false
    timerVal = 0

    minesCount = 0

    width = 10
    height = 10

    totalCells = 0
    totalSafeCells = 0

    constructor(){
        this.setupLevel()
    }

    setupLevel(){
        this.gameEle.innerHTML = ''
        this.minesCount = 0
        this.calculateScarcity()
        this.resetCells()
        this.resetBoard()
        this.updateHTML()
        this.updateMineCountDisplay()
        this.updateStatusDisplay()
        this.setupListeners()
        this.updateStatusDisplay('😁')
        this.timerVal = 0
        this.timerEle.innerText = 0

        clearTimeout(this.timer)
        this.timer = false

        this.cellsBlocked = false

        this.totalCells = this.width * this.height
        this.totalSafeCells = this.totalCells - this.minesCount
    }

    updateMineCountDisplay() {
        this.minesCountEle.innerText = this.minesCount
    }

    updateStatusDisplay(text) {
        this.statusEle.innerText = text
    }

    resetCells(){
        this.gameBoard = []
    }

    resetBoard() {
        let styleWidth = 100 / this.width
        for (let x = 0; x < this.width; x++) {
            this.gameBoard[x] = []
            for (let y = 0; y < this.height; y++) {
                let rand = Math.random()
                let isMine = rand < this.scarcity

                this.gameBoard[x][y] = new Cell(isMine, x, y)
                this.gameBoard[x][y].width = styleWidth + '%'

                if(isMine) this.minesCount ++
            }
        }
    }

    calculateScarcity() {
        this.scarcity = this.scarcity < 0.10 ? (1 + this.level) * 0.1 : 0.10
    }

    levelUp() {
        this.updateStatusDisplay('🥳')
        this.level ++
    }

    setupTimer() {
        this.timer = setInterval(() => {
            this.timerVal += 0.01
            this.timerEle.innerText = (Math.floor(this.timerVal * 10) / 10).toFixed(1)
        }, 10)
    }

    cellClick(e) {
        if(this.cellsBlocked) return
        if(!this.timer) this.setupTimer()
        let foundCell = this.gameBoard[e.target.dataset.x][e.target.dataset.y]
        
        e.target.classList.add('revealed')
        foundCell.revealed = true

        if(foundCell.isMine) {
            this.updateStatusDisplay('😵')
            clearTimeout(this.timer)
            this.timer = false
            this.cellsBlocked = true
            return
        }

        if(!foundCell.hasInputText) this.propagateSafeCellsReveal(foundCell)

        this.checkFinished()
    }

    checkFinished() {
        let totalRevealed = 0
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if(this.gameBoard[x][y].revealed) totalRevealed ++
            }
        }


        console.log(totalRevealed);

        console.log(this);

        if(this.totalSafeCells == totalRevealed) this.levelUp()
    }

    propagateSafeCellsReveal(foundCell) {
        let adjacentCells = this.getAdjacentCellsByCell(foundCell)
        foundCell.revealed = true
        for (const cell of adjacentCells) {
            let cellEle = document.querySelector(`input[type="button"][data-x="${cell.x}"][data-y="${cell.y}"]`)
            cellEle.classList.add('revealed')
            if(!cell.hasInputText && !cell.revealed) this.propagateSafeCellsReveal(cell)
            cell.revealed = true
        }
    }

    updateHTML(){
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let cell = this.gameBoard[x][y]

                let adjacentCells = this.getAdjacentCellsByCell(cell)

                let neighborMines = adjacentCells.filter(adjacentCell => adjacentCell.isMine)
                let neighborMinesCount = neighborMines.length
                
                //console.log(cell, adjacentCells, neighborMinesCount);

                let neighborMinesCountOrSpace = neighborMinesCount == 0 ? " " : neighborMinesCount

                this.gameEle.appendChild(cell.getHTMLNode(neighborMinesCountOrSpace))
            }

            let br = document.createElement('br')
            this.gameEle.appendChild(br)
        }
    }

    getAdjacentCellsByCell(cell){
        let keysArr = [-1, 0, 1]
        let foundCells = []

        for (let i = 0; i < keysArr.length; i++) {
            const xModifier = keysArr[i];
            const newX = cell.x + xModifier;

            if (typeof this.gameBoard[newX] == 'undefined' ) continue;

            for (let o = 0; o < keysArr.length; o++) {
                const yModifier = keysArr[o];
                const newY = cell.y + yModifier;

                if (typeof this.gameBoard[newX][newY] == 'undefined') continue;

                if(this.gameBoard[newX][newY] != cell) foundCells.push(this.gameBoard[newX][newY])
            }
        }

        return foundCells
    }

    setupListeners(){
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let cell = document.querySelector(`input[type="button"][data-x="${x}"][data-y="${y}"]`)

                cell.addEventListener('click', (e) => this.cellClick(e))
            }
        }

        this.statusEle.addEventListener('click', (e) => this.setupLevel())
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let game = new Game()
})
