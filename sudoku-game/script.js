// 数独游戏逻辑

class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.level = 'easy';
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateNewGame();
    }

    bindEvents() {
        // 关卡选择事件
        document.getElementById('level').addEventListener('change', (e) => {
            this.level = e.target.value;
            this.generateNewGame();
        });

        // 检查答案事件
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        // 显示答案事件
        document.getElementById('solve-btn').addEventListener('click', () => {
            this.showSolution();
        });

        // 新游戏事件
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.generateNewGame();
        });
    }

    // 生成新游戏
    generateNewGame() {
        // 生成完整的数独解决方案
        this.solution = this.generateSudokuSolution();
        
        // 根据难度挖洞生成题目
        this.board = this.puzzleFromSolution(this.solution, this.level);
        
        // 渲染游戏界面
        this.renderBoard();
        
        // 清空消息
        this.clearMessage();
    }

    // 生成数独解决方案
    generateSudokuSolution() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(board);
        return board;
    }

    // 解数独算法（回溯）
    solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 检查数字是否有效
    isValid(board, row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }

        // 检查列
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }

        // 检查3x3宫格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }

        return true;
    }

    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 根据解决方案生成题目
    puzzleFromSolution(solution, level) {
        const puzzle = JSON.parse(JSON.stringify(solution));
        
        // 根据难度确定挖洞数量
        let holes;
        switch(level) {
            case 'easy':
                holes = 35;
                break;
            case 'medium':
                holes = 45;
                break;
            case 'hard':
                holes = 55;
                break;
            case 'expert':
                holes = 65;
                break;
            default:
                holes = 35;
        }

        // 随机挖洞
        let removed = 0;
        while (removed < holes) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }

        return puzzle;
    }

    // 渲染游戏界面
    renderBoard() {
        const table = document.getElementById('sudoku-board');
        table.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                
                if (this.board[row][col] !== 0) {
                    td.textContent = this.board[row][col];
                } else {
                    td.contentEditable = true;
                    td.addEventListener('input', (e) => {
                        const value = e.target.textContent;
                        if (value && !/^[1-9]$/.test(value)) {
                            e.target.textContent = '';
                        }
                    });
                }
                
                tr.appendChild(td);
            }
            
            table.appendChild(tr);
        }
    }

    // 检查答案
    checkSolution() {
        const userBoard = this.getUserBoard();
        
        if (this.isBoardComplete(userBoard)) {
            if (this.isBoardCorrect(userBoard)) {
                this.showMessage('恭喜你，答案正确！', 'success');
            } else {
                this.showMessage('答案不正确，请再检查一下。', 'error');
            }
        } else {
            this.showMessage('请填写完整数独后再检查。', 'error');
        }
    }

    // 获取用户填写的数独板
    getUserBoard() {
        const board = [];
        const rows = document.querySelectorAll('#sudoku-board tr');
        
        for (let i = 0; i < 9; i++) {
            const row = [];
            const cells = rows[i].querySelectorAll('td');
            
            for (let j = 0; j < 9; j++) {
                const value = cells[j].textContent;
                row.push(value ? parseInt(value) : 0);
            }
            
            board.push(row);
        }
        
        return board;
    }

    // 检查数独板是否完整
    isBoardComplete(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) return false;
            }
        }
        return true;
    }

    // 检查数独板是否正确
    isBoardCorrect(board) {
        // 检查行
        for (let row = 0; row < 9; row++) {
            const rowSet = new Set();
            for (let col = 0; col < 9; col++) {
                if (rowSet.has(board[row][col])) return false;
                rowSet.add(board[row][col]);
            }
        }

        // 检查列
        for (let col = 0; col < 9; col++) {
            const colSet = new Set();
            for (let row = 0; row < 9; row++) {
                if (colSet.has(board[row][col])) return false;
                colSet.add(board[row][col]);
            }
        }

        // 检查3x3宫格
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxSet = new Set();
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const value = board[boxRow * 3 + row][boxCol * 3 + col];
                        if (boxSet.has(value)) return false;
                        boxSet.add(value);
                    }
                }
            }
        }

        return true;
    }

    // 显示解决方案
    showSolution() {
        const rows = document.querySelectorAll('#sudoku-board tr');
        
        for (let row = 0; row < 9; row++) {
            const cells = rows[row].querySelectorAll('td');
            
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    cells[col].textContent = this.solution[row][col];
                }
            }
        }
        
        this.showMessage('已显示答案。', 'success');
    }

    // 显示消息
    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    }

    // 清空消息
    clearMessage() {
        const messageEl = document.getElementById('message');
        messageEl.textContent = '';
        messageEl.className = 'message';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});