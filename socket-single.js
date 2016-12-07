var io = require('socket.io-client');
var request = require("superagent");
var host = "http://players.world-of-myths.com";

var c1 = io("http://players.world-of-myths.com", { 'force new connection': true });

c1.emit("findOpponent", { 'force new connection': true })

var c1Board;
var c2Board;

var activeBoard;
var opponentBoard;

var activeSocket;
var opponentSocket;

var gameData = {};

function updatePLayerslayer() {
    if (c1Board.username === gameData.gameBoard.players[0].username) {
        c1Board = gameData.gameBoard.players[0];
        c2Board = gameData.gameBoard.players[1];
    } else {
        c1Board = gameData.gameBoard.players[1];
        c2Board = gameData.gameBoard.players[0]
    }
}

function updateBoard() {
    return new Promise(function (resolve, reject) {
        request
            .get(host + "/game/" + gameData.gameId + "/game-board")
            .set("Authorization", "Bearer " + gameData.accessToken)
            .end(function (err, res) {
                var board = JSON.parse(res.text);

                gameData.gameBoard = board;
                updatePLayerslayer()

                resolve(board);
            });
    });
}

c1.on("connect", function (data) {
});

c1.on("connected", function (data) {
});

c1.on("error", function (data) {
});

c2.on("error", function (data) {
});

c1.on("opponentFound", function (data) {
    gameData = data;

    if (data.playerName === data.gameBoard.players[0].username) {
        c1Board = gameData.gameBoard.players[0];
        c2Board = gameData.gameBoard.players[1];
    } else {
        c1Board = gameData.gameBoard.players[1];
        c2Board = gameData.gameBoard.players[0];
    }

    c1.emit("preloadingCompleted");
});

c1.on("startGame", function (data) {
});

c1.on("activePlayerChanged", function (data) {
    if (data.u) {
        activeBoard = c1Board;
        opponentBoard = c2Board;
    } else {
        activeBoard = c2Board;
        opponentBoard = c1Board;
    }
});

c1.on("newRound", function (data) {
});

c1.on("action", function (data) {
    if (data.a === "drawCard" && data.u) {
        updateBoard()
            .then(function () {
                c1.emit("cardPlayRequest", { uid: c1Board.hand[0].uid });
            });
    }
});

var counter = 0;
c1.on("cardPlayed", function (data) {
    if (!data.u) {
        return;
    }

    counter++;

    if (counter === 2) {
        counter = 0;
        updateBoard()
            .then(function () {
                c1.emit("passRequest", {});
            });
    } else {
        c1.emit("cardPlayRequest", { uid: activeBoard.hand[1].uid });
    }
});

c1.on("battlePhase", function (data) {
});

c1.on("newBattle", function (data) {
    if (!data.u) {
        return;
    }

    updateBoard()
        .then(function () {
            c1.emit("attackerDeclareRequest", { uid: activeBoard.battlefield[0].uid });
        });
});

c1.on("attackerDeclared", function (data) {
    if (!data.u) {
        return;
    }

    updateBoard()
        .then(function () {
            c1.emit("attackDeclareRequest", { uid: opponentBoard.buildings[1].uid });
        });
});

c1.on("attackDeclared", function (data) {
    if (data.u) {
        return;
    }

    updateBoard()
        .then(function () {
            // opponentSocket.emit("defenderDeclareRequest", { uid: opponentBoard.battlefield[0].uid });
            c1.emit("passRequest", {});
        });
});

c1.on("defenderDeclared", function (data) {
    if (!data.u) {
        return;
    }

    updateBoard()
        .then(function () {
            activeSocket.emit("passRequest", {});
        });
});

c1.on("endBattle", function (data) {
});

c1.on("actionRequired", function (data) {
    if (data.u && data.a === "killOnBoard") {
        updateBoard()
            .then(function () {
                c1.emit("actionResponseRequest", { a: "killOnBoard", p: [c1Board.battlefield[0].uid] });
            });
    }
});