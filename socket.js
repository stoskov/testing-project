var io = require('socket.io-client');

var c1 = io("http://localhost:3002", { 'force new connection': true });
var c2 = io('http://localhost:3002', { 'force new connection': true });

c1.emit("findOpponent", { 'force new connection': true })
c2.emit("findOpponent", { 'force new connection': true })

var activeBoard;
var opponentBoard;

var activeSocket;
var opponentSocket;

var gameData = {};

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
});

c2.on("opponentFound", function (data) {
    gameData = data;
    c1.emit("preloadingCompleted");
    c2.emit("preloadingCompleted");
});

c1.on("startGame", function (data) {
});

c2.on("startGame", function (data) {
});

c1.on("activePlayerChanged", function (data) {
    if (data.u) {
        activeBoard = gameData.gameBoard.players[0];
        opponentBoard = gameData.gameBoard.players[1];

        activeSocket = c1;
        opponentSocket = c2;
    } else {
        activeBoard = gameData.gameBoard.players[1];
        opponentBoard = gameData.gameBoard.players[0];

        activeSocket = c2;
        opponentSocket = c1;
    }
});

c2.on("activePlayerChanged", function (data) {
});

c1.on("newRound", function (data) {
});

c2.on("newRound", function (data) {
});

c1.on("action", function (data) {
    if (data.a === "drawCard") {
        activeSocket.emit("cardPlayRequest", { uid: activeBoard.hand[0].uid });
    }
});

c2.on("action", function (data) {
});

c1.on("cardPlayed", function (data) {
    activeSocket.emit("passRequest", {});
});

c2.on("cardPlayed", function (data) {
});

c1.on("battlePhase", function (data) {
});

c2.on("battlePhase", function (data) {
});

c1.on("newBattle", function (data) {
});

c2.on("newBattle", function (data) {
});

c1.on("attackerDeclared", function (data) {
    if (data.u) {
        // opponentSocket.emit("defenderDeclareRequest", { uid: opponentBoard.hand[0].uid });
        activeSocket.emit("buildingAttackDeclareRequest", { uid: opponentBoard.buildings[0].uid });
    }
});

c2.on("attackerDeclared", function (data) {
});

c1.on("defenderDeclared", function (data) {
});

c2.on("defenderDeclared", function (data) {
    if (data.u) {
        activeSocket.emit("buildingAttackDeclareRequest", { uid: opponentBoard.buildings[0].uid });
    }
});

c1.on("attackDeclared", function (data) {
});

c2.on("attackDeclared", function (data) {
});

c1.on("action", function (data) {
});

c2.on("action", function (data) {
});

c1.on("actionRequired", function (data) {
});

c2.on("actionRequired", function (data) {
});