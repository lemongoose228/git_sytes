(function() {
    
    let gameStarted = false;
    let gameEnded = false;
    let bombMap = [];
    let countBombs = 10;
    let cells = [];

    let currentCell = [0, 0];

    function initGame(gameDiv, width, height) {
        gameStarted = false;
    
        gameDiv.style.setProperty('--cell-count', width);
    
        gameDiv.innerHTML = "";

        // let bombMap = makeBombs(10, width, height, 3, 3);

    
    
        for (let y = 0; y < height; y++) {
            cells[y] = [];
            for (let x = 0; x < width; x++) {
                let cell = document.createElement('div');
                cell.x = x;
                cell.y = y;
                cell.className = "cell";
                gameDiv.append(cell);
                cells[y][x] = cell;
            }
    
        }

        setFocus(gameDiv, width, height);
    
        gameDiv.addEventListener('click', e => {
            let cell = e.target;
            if (cell.matches(".cell")) {
                currentCell = [cell.x, cell.y];
                setFocus(gameDiv, width, height);
                gameDiv.dispatchEvent(new CustomEvent("cellOpening", {
                    detail: {
                        coords: currentCell
                    }
                }));
            }
            
        });
    
        gameDiv.addEventListener('contextmenu', e => {
            e.preventDefault();

            let cell = e.target;
            if (cell && cell.matches(".cell") && !cell.classList.contains('cell--open')) {
                
                currentCell = [cell.x, cell.y];
                gameDiv.dispatchEvent(new CustomEvent("cellMarking", {
                    detail: {
                        coords: [currentCell[0], currentCell[1]]
                    }
                }));
            }
        });

        window.addEventListener("keydown", e => {
            if (gameEnded) {
                return;
            }
            switch (e.code) {
                case 'ArrowRight':
                    currentCell[0]++;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    currentCell[0]--;
                    e.preventDefault();
                    break;  
                case 'ArrowUp':
                    currentCell[1]--;
                    e.preventDefault();
                    break;  
                case 'ArrowDown':
                    currentCell[1]++;
                    e.preventDefault();
                    break; 
                case "Enter": 
                case "Space":
                    e.preventDefault();
                    if (e.shiftKey || e.ctrlKey) {
                        gameDiv.dispatchEvent(new CustomEvent("cellMarking", {
                            detail: {
                                coords: [currentCell[0], currentCell[1]]
                            }
                        }));
                    } else {
                        gameDiv.dispatchEvent(new CustomEvent("cellOpening", {
                            detail: {
                                coords: [currentCell[0], currentCell[1]]
                            }
                        }));
                }
                break;
            }
            setFocus(gameDiv, width, height);
        });
       
        gameDiv.addEventListener('cellOpening', e => {
            if (!e.detail.coords) {
                return;
            }

            let cell = cells[e.detail.coords[1]][e.detail.coords[0]];

            if (!cell) return;

            if (!cell.classList.contains("cell--marked")) {
                if (!gameStarted) {
                    startGame(countBombs, width, height, cell.x, cell.y);
                    openCell(cell, width, height, true);
                    
                    
                }
                else if (openCell(cell, width, height, true) === false) {
                    gameOver(gameDiv, false);
                }

                let OpenCells = gameDiv.querySelectorAll(".cell--open");
                if (OpenCells.length === 54) {
                    gameOver(gameDiv, true);
                }
    
            }
        });

        gameDiv.addEventListener('cellMarking', e => {
            if (!e.detail.coords) {
                return;
            }

            let cell = cells[e.detail.coords[1]][e.detail.coords[0]];

            if (!cell) return;

            if (!cell.classList.contains("cell--marked")) {
                cell.classList.add("cell--marked");
            }
            else {
                cell.classList.remove("cell--marked");
            }
        });
    }

    function startGame(count, width, height, notX, notY) {
        bombMap = makeBombs(count, width, height, notX, notY);
        gameStarted = true;
    }

    function setFocus(gameDiv, width, height) {
        if (currentCell[0] < 0) currentCell[0] = 0;
        if (currentCell[1] < 0) currentCell[1] = 0;
        if (currentCell[0] >= width) currentCell[0] = width  - 1;
        if (currentCell[1] >= height) currentCell[1] = height  - 1;

        let cell = cells[currentCell[1]][currentCell[0]]
        if (cell) {
            let currCell = gameDiv.querySelector(".cell--focus");
            
            if (currCell) {
                currCell.classList.remove("cell--focus");
            }
            cell.classList.add("cell--focus");
        }
    }

    function openCell(cell, width, height, userAction) {

        if (!cell.classList.contains('cell--open')) {
            if (bombMap[cell.x][cell.y]) {
                if (userAction) {
                    cell.classList.add('cell--mined');
                    return false;
                }
            } else {
                cell.classList.add('cell--open');
                let n = calcBombsAround(cell, width, height);
                if (n > 0) {
                    cell.textContent = n;
                } else {
                    for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                        for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                            if (cells[y] && cells[y][x]) {
                                openCell(cells[y][x], width, height)
                            }
                        }
                    }
                }
                let bombsAround = calcBombsAround(cell, width, height);
                if (bombsAround != 0) {
                    cell.textContent = bombsAround;
                }
            }
        }
    }

    function gameOver(gameDiv, result) {
        if (gameEnded) return;

        console.log("1234")

        let resultBlock = document.getElementById("resultBlock");
        resultBlock.style.display = "flex";
        if (!result) {
            resultBlock.style.backgroundColor = "#663336";
            resultBlock.querySelector(".resultText").textContent = "Вы проиграли!";
        }

        gameEnded = true;
        console.log("123456")

        gameDiv.querySelectorAll('.cell').forEach(cell => {
            if (bombMap[cell.x][cell.y]) {
                cell.classList.add('cell--mined');
            };
            
            openCell(cell, true);
            cell.classList.remove("cell--marked")
        } );

    }

    function calcBombsAround(cell, width, height) {
        let n = 0;

        let x = cell.x;
        let y = cell.y;

        width--;
        height--;

        for (let x = cell.x - 1; x <= cell.x + 1; x++) {
            for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                if (bombMap[x] && bombMap[x][y]) {
                    n++;
                }
            }
        }

        return n;
    }

    function makeBombs(count, width, height, notX, notY) {
        let bombMap = [];
        let currentCount = 0;

        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(0);

            }
            bombMap.push(row);
        }
        while (currentCount < count) {
            let x = Math.floor(Math.random() * width);
            let y = Math.floor(Math.random() * height);

            if (x == notX && y == notY) {
                continue;
            }
            if (!bombMap[x][y] ) {
                bombMap[x][y] = 1;
                currentCount++;
            }
        }

        return bombMap;
    }

    
    window.addEventListener("DOMContentLoaded", () => {
        initGame(document.getElementById('game'), 8, 8);

    });

})();

