/**
 * Created by oz on 5/29/2017.
 */

Object.extend = function(dest, src){
    Object.keys(src).forEach(function(key) { dest[key] = src[key]; });
    return dest;
};

var Puzzle = {

    init: function (config) {
        var that = this;
        that.config = config;
        that.PUZZLE_DIFFICULTY = 7;
        that.PUZZLE_HOVER_TINT = '#009900';
        that._stage = null;
        that._canvas = null;
        that._img = null;
        that._pieces = null;
        that._puzzleWidth = null;
        that._puzzleHeight = null;
        that._pieceWidth = null;
        that._pieceHeight = null;
        that._currentPiece = null;
        that._currentDropPiece = null;
        that._mouse = null;
        that.movesCount = [];

        var defaultConfig = {
            imageSrc: 'css/images/puzzle.jpg',
            difficulty: 'Beginner',
            element: null
        };

        var difficultyLevels = {
            'Beginner': 2,
            'Intermediate': 4,
            'Advanced': 6
        };

        that.config = Object.extend(defaultConfig, that.config);
        that.PUZZLE_DIFFICULTY = difficultyLevels[that.config.difficulty];

        var imagePath = that.config.imageSrc;

        that._img = new Image();

        var onImageLoaded = function (e) {
            
            document.getElementById(that.config.loading).style.display = 'none';
            
            that._pieceWidth = Math.floor(that._img.width / that.PUZZLE_DIFFICULTY);
            that._pieceHeight = Math.floor(that._img.height / that.PUZZLE_DIFFICULTY);
            that._puzzleWidth = that._pieceWidth * that.PUZZLE_DIFFICULTY;
            that._puzzleHeight = that._pieceHeight * that.PUZZLE_DIFFICULTY;
            that.setCanvas();
            that.initPuzzle();
        };

        that._img.addEventListener('load', onImageLoaded, false);
        that._img.src = imagePath;
    },

    setCanvas: function () {
        var that = this;
        that._canvas = document.getElementById(that.config.element);
        that._stage = that._canvas.getContext('2d');
        that._canvas.width = that._puzzleWidth;
        that._canvas.height = that._puzzleHeight;
        that._canvas.style.border = "1px solid black";
    },

    initPuzzle: function () {
        var that = this;
        that._pieces = [];
        that._mouse = {x: 0, y: 0};
        that._currentPiece = null;
        that._currentDropPiece = null;
        that._stage.drawImage(that._img, 0, 0, that._puzzleWidth, that._puzzleHeight, 0, 0, that._puzzleWidth, that._puzzleHeight);
        that.createTitle(3);
    },

    createTitle: function (msg) {
        var that = this;
        document.getElementById('canvasTimer').style.display = 'block';
        var countdown = 3;
        var countDownInterval = setInterval(function () {
            if (countdown <= 0) {
                document.getElementById('canvasTimer').style.display = 'none';
                that.startTimer();
                clearInterval(countDownInterval);
                that.buildPieces();
                that.shufflePuzzle();
            }
            document.getElementById('spCounter').innerHTML = countdown;
            countdown--;
        }, 1000);
    },

    buildPieces: function () {
        var that = this;
        var i;
        var piece;
        var xPos = 0;
        var yPos = 0;
        for (i = 0; i < that.PUZZLE_DIFFICULTY * that.PUZZLE_DIFFICULTY; i++) {
            piece = {};
            piece.sx = xPos;
            piece.sy = yPos;
            that._pieces.push(piece);
            xPos += that._pieceWidth;
            if (xPos >= that._puzzleWidth) {
                xPos = 0;
                yPos += that._pieceHeight;
            }
        }
        document.onmousedown = that.shufflePuzzle;
    },

    shuffleArray: function (o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    shufflePuzzle: function () {
        var that = this;
        that._pieces = that.shuffleArray(that._pieces);
        that._stage.clearRect(0, 0, that._puzzleWidth, that._puzzleHeight);
        var i;
        var piece;
        var xPos = 0;
        var yPos = 0;
        for (i = 0; i < that._pieces.length; i++) {
            piece = that._pieces[i];
            piece.xPos = xPos;
            piece.yPos = yPos;
            that._stage.drawImage(that._img, piece.sx, piece.sy, that._pieceWidth, that._pieceHeight, xPos, yPos, that._pieceWidth, that._pieceHeight);
            that._stage.strokeRect(xPos, yPos, that._pieceWidth, that._pieceHeight);
            xPos += that._pieceWidth;
            if (xPos >= that._puzzleWidth) {
                xPos = 0;
                yPos += that._pieceHeight;
            }
        }

        document.onmousedown = function (e) {
            if (e.layerX || e.layerX == 0) {
                that._mouse.x = e.layerX - that._canvas.offsetLeft;
                that._mouse.y = e.layerY - that._canvas.offsetTop;
            }
            else if (e.offsetX || e.offsetX == 0) {
                that._mouse.x = e.offsetX - that._canvas.offsetLeft;
                that._mouse.y = e.offsetY - that._canvas.offsetTop;
            }
            that._currentPiece = that.checkPieceClicked();
            if (that._currentPiece != null) {
                that._stage.clearRect(that._currentPiece.xPos, that._currentPiece.yPos, that._pieceWidth, that._pieceHeight);
                that._stage.save();
                that._stage.globalAlpha = .9;
                that._stage.drawImage(that._img, that._currentPiece.sx, that._currentPiece.sy, that._pieceWidth, that._pieceHeight, that._mouse.x - (that._pieceWidth / 2), that._mouse.y - (that._pieceHeight / 2), that._pieceWidth, that._pieceHeight);
                that._stage.restore();
                document.onmousemove = function (e) {
                    that._currentDropPiece = null;
                    if (e.layerX || e.layerX == 0) {
                        that._mouse.x = e.layerX - that._canvas.offsetLeft;
                        that._mouse.y = e.layerY - that._canvas.offsetTop;
                    }
                    else if (e.offsetX || e.offsetX == 0) {
                        that._mouse.x = e.offsetX - that._canvas.offsetLeft;
                        that._mouse.y = e.offsetY - that._canvas.offsetTop;
                    }
                    that._stage.clearRect(0, 0, that._puzzleWidth, that._puzzleHeight);
                    var i;
                    var piece;
                    for (i = 0; i < that._pieces.length; i++) {
                        piece = that._pieces[i];
                        if (piece == that._currentPiece) {
                            continue;
                        }
                        that._stage.drawImage(that._img, piece.sx, piece.sy, that._pieceWidth, that._pieceHeight, piece.xPos, piece.yPos, that._pieceWidth, that._pieceHeight);
                        that._stage.strokeRect(piece.xPos, piece.yPos, that._pieceWidth, that._pieceHeight);
                        if (that._currentDropPiece == null) {
                            if (that._mouse.x < piece.xPos || that._mouse.x > (piece.xPos + that._pieceWidth) || that._mouse.y < piece.yPos || that._mouse.y > (piece.yPos + that._pieceHeight)) {
                                //NOT OVER
                            }
                            else {
                                that._currentDropPiece = piece;
                                that._stage.save();
                                that._stage.globalAlpha = .4;
                                that._stage.fillStyle = that.PUZZLE_HOVER_TINT;
                                that._stage.fillRect(that._currentDropPiece.xPos, that._currentDropPiece.yPos, that._pieceWidth, that._pieceHeight);
                                that._stage.restore();
                            }
                        }
                    }
                    that._stage.save();
                    that._stage.globalAlpha = .6;
                    that._stage.drawImage(that._img, that._currentPiece.sx, that._currentPiece.sy, that._pieceWidth, that._pieceHeight, that._mouse.x - (that._pieceWidth / 2), that._mouse.y - (that._pieceHeight / 2), that._pieceWidth, that._pieceHeight);
                    that._stage.restore();
                    that._stage.strokeRect(that._mouse.x - (that._pieceWidth / 2), that._mouse.y - (that._pieceHeight / 2), that._pieceWidth, that._pieceHeight);
                };

                document.onmouseup = function (e) {
                    that.movesCount.push('1');
                    document.onmousemove = null;
                    document.onmouseup = null;
                    if (that._currentDropPiece != null) {
                        var tmp = {xPos: that._currentPiece.xPos, yPos: that._currentPiece.yPos};
                        that._currentPiece.xPos = that._currentDropPiece.xPos;
                        that._currentPiece.yPos = that._currentDropPiece.yPos;
                        that._currentDropPiece.xPos = tmp.xPos;
                        that._currentDropPiece.yPos = tmp.yPos;
                    }
                    that.updateMovesCount();
                    that.resetPuzzleAndCheckWin();
                };
            }
        };
    },

    checkPieceClicked: function () {
        var that = this;
        var i;
        var piece;
        for (i = 0; i < that._pieces.length; i++) {
            piece = that._pieces[i];
            if (that._mouse.x < piece.xPos || that._mouse.x > (piece.xPos + that._pieceWidth) || that._mouse.y < piece.yPos || that._mouse.y > (piece.yPos + that._pieceHeight)) {
                //PIECE NOT HIT
            }
            else {
                return piece;
            }
        }
        return null;
    },

    resetPuzzleAndCheckWin: function () {
        var that = this;
        that._stage.clearRect(0, 0, that._puzzleWidth, that._puzzleHeight);
        var gameWin = true;
        var i;
        var piece;
        for (i = 0; i < that._pieces.length; i++) {
            piece = that._pieces[i];
            that._stage.drawImage(that._img, piece.sx, piece.sy, that._pieceWidth, that._pieceHeight, piece.xPos, piece.yPos, that._pieceWidth, that._pieceHeight);
            that._stage.strokeRect(piece.xPos, piece.yPos, that._pieceWidth, that._pieceHeight);
            if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
                gameWin = false;
            }
        }
        if (gameWin) {
            setTimeout(that.gameOver, 500);
        }
    },

    gameOver: function () {
        var that = this;
        document.onmousedown = null;
        document.onmousemove = null;
        document.onmouseup = null;
        clearInterval(that.Puzzle.timer);
        that.movesCount = [];
        document.getElementById('gameOverMessageContainer').style.display = 'block';
    },

    updateMovesCount: function(){
        var that = this;
        document.getElementById('spMoves').innerHTML = that.movesCount.length+'';
    },

    startTimer: function(){
        var that = this;
        var timer = 0;
        var minutes = 0;
        var seconds = 0;

        that.timer = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            document.getElementById('spTime').innerHTML = minutes + ":" + seconds;
            timer++;
        }, 1000);
    }
};

