var io = require('socket.io-client');
var request = require("superagent");
var host = "http://players.world-of-myths.com";

var c1 = io("http://players.world-of-myths.com", { 'force new connection': true });
var c2 = io('http://players.world-of-myths.com', { 'force new connection': true });

c1.emit("findOpponent", { 'force new connection': true })
c2.emit("findOpponent", { 'force new connection': true })

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

function updateActive(data) {
    if (data.u) {
        activeBoard = c1Board;
        opponentBoard = c2Board;

        activeSocket = c1;
        opponentSocket = c2;
    } else {
        activeBoard = c2Board;
        opponentBoard = c1Board;

        activeSocket = c2;
        opponentSocket = c1;
    }
}

c1.on("connect", function (data) {
});

c2.on("connect", function (data) {
});

c1.on("connected", function (data) {
});

c2.on("connected", function (data) {
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
    c2.emit("preloadingCompleted");
});

c2.on("opponentFound", function (data) {
});

c1.on("startGame", function (data) {
});

c2.on("startGame", function (data) {
});

c1.on("activePlayerChanged", function (data) {
    updateActive(data);
});

c2.on("activePlayerChanged", function (data) {
});

c1.on("newRound", function (data) {
});

c2.on("newRound", function (data) {
});

var played = {};
var playedList = [];

var pending = 0;
c1.on("action", function (data) {
    updateBoard()
        .then(function () {
            if (data.a === "drawCard") {
                updateBoard()
                    .then(function () {
                        updateActive(data);
                        pending++;

                        // if (played[activeBoard.hand[0].uid]) {
                        //     return;
                        // }

                        // played[activeBoard.hand[0].uid] = activeBoard.username;
                        // playedList.push({
                        //     uid: activeBoard.hand[0].uid,
                        //     username: activeBoard.username,
                        //     state: gameData.gameBoard.state
                        // });

                        // for (var index = 0; index < data.p.length; index++) {
                        //     var element = data.p[index];

                        //     c1.emit("cardPlayRequest", { uid: element.uid });
                        // }


                        if (activeBoard.hand.length > 0) {
                            activeSocket.emit("cardPlayRequest", { uid: activeBoard.hand[0].uid });
                        } else {
                            activeSocket.emit("passRequest", {});
                        }
                    });
            }
        });
});

c2.on("action", function (data) {
    // if (data.a === "drawCard" && data.u) {
    //     updateBoard()
    //         .then(function () {
    //             updateActive(data);
    //             pending++;

    //             for (var index = 0; index < data.p.length; index++) {
    //                 var element = data.p[index];

    //                 c2.emit("cardPlayRequest", { uid: element.uid });
    //             }
    //         });
    // }
});

var counter = 0;
c1.on("cardPlayed", function (data) {
    counter++
    pending--;;

    if (counter >= 1) {
        counter = 0;
        updateBoard()
            .then(function () {
                updateActive(data);
                // if (activeSocket === c2) {
                    // activeSocket.emit("summonGodRequest", {});
                // } else {
                    activeSocket.emit("passRequest", {});
                // }
            });
    } else {
        updateActive(data);
        activeSocket.emit("cardPlayRequest", { uid: activeBoard.hand[counter].uid });
    }
});

c1.on("summonGod", function (data) {
    activeSocket.emit("passRequest", {});
});

c2.on("summonGod", function (data) {
    activeSocket.emit("passRequest", {});
});

c2.on("cardPlayed", function (data) {
});

c1.on("battlePhase", function (data) {
});

c2.on("battlePhase", function (data) {
});

c1.on("newBattle", function (data) {
    updateBoard()
        .then(function () {
            updateActive(data);

            activeSocket.emit("attackerDeclareRequest", { uid: activeBoard.battlefield[0].uid });
            return;
            if (c1 === activeSocket) {
                activeSocket.emit("passRequest", {});
            } else {
                activeSocket.emit("attackerDeclareRequest", { uid: activeBoard.battlefield[0].uid });
            }

        });
});

c2.on("newBattle", function (data) {
});

var buildingCounter = -1;
c1.on("attackerDeclared", function (data) {
    updateBoard()
        .then(function () {
            updateActive(data);

            buildingCounter++;

            if (buildingCounter === 3) {
                buildingCounter = 0;
            }

            activeSocket.emit("attackDeclareRequest", { uid: opponentBoard.buildings[0].uid });
            // for (var index = 0; index < opponentBoard.buildings.length; index++) {
            //     var element = opponentBoard.buildings[index];

            //     if (element.hp <= 0) {
            //         continue;
            //     }

            //     activeSocket.emit("attackDeclareRequest", { uid: element.uid });

            //     break;
            // }
        });
});

c2.on("attackerDeclared", function (data) {
});

c1.on("attackDeclared", function (data) {
    updateBoard()
        .then(function () {
            updateActive(data);
            // opponentSocket.emit("defenderDeclareRequest", { uid: opponentBoard.battlefield[0].uid });
            activeSocket.emit("passRequest", {});
        });
});

c2.on("attackDeclared", function (data) {
});

c1.on("defenderDeclared", function (data) {
    updateBoard()
        .then(function () {
            updateActive(data);
            activeSocket.emit("passRequest", {});
        });
});

c2.on("defenderDeclared", function (data) {
});

c1.on("endBattle", function (data) {
});

c2.on("endBattle", function (data) {
});

c1.on("actionRequired", function (data) {
    if (data.u && data.a === "killOnBoard") {
        updateBoard()
            .then(function () {
                updateActive(data);
                c1.emit("actionResponseRequest", { a: "killOnBoard", p: [c1Board.battlefield[0].uid] });
            });
    }
});

c2.on("actionRequired", function (data) {
    if (data.u && data.a === "killOnBoard") {
        updateBoard()
            .then(function () {
                updateActive(data);
                c2.emit("actionResponseRequest", { a: "killOnBoard", p: [c2Board.battlefield[0].uid] });
            });
    }
});

c1.on("endGame", function (data) {
});

c2.on("endGame", function (data) {
});