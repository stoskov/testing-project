var request = require("superagent");
var host = "http://api.world-of-myths.com";
var game;
var player;
var opponent;
var events = [];
var es = "";

function createGame() {
    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/create")
            .send({
                "players": [
                    { "anonymous": true },
                    { "anonymous": true }
                ]
            })
            .end(function (err, res) {
                game = JSON.parse(res.text);
                updatePLayerslayer();

                resolve(game);
            });
    });
}

function startGame() {
    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/start")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function updateBoard() {
    return new Promise(function (resolve, reject) {
        request
            .get(host + `/game/${game.gameId}/game-board`)
            .set("Authorization", `Bearer ${game.accessToken}`)
            .end(function (err, res) {
                var board = JSON.parse(res.text);

                game.gameBoard = board;
                updatePLayerslayer()

                resolve(board);
            });
    });
}

function updatePLayerslayer() {
    if (game.gameBoard.players[0].isActive) {
        player = game.gameBoard.players[0];
        opponent = game.gameBoard.players[1];
    } else {
        player = game.gameBoard.players[1];
        opponent = game.gameBoard.players[0]
    }
}

function playCard(player, cardsCount) {
    var cards = [];

    for (var i = 0; i < cardsCount; i++) {
        cards.push({ uid: player.hand[i].uid });
    }

    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/play-cards")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
                "cards": cards
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function pass(player) {
    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/pass")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                }
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function declareAttackers(player, index) {
    var cards = [];

    cards.push({ uid: player.battlefield[index].uid });

    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/declare-attackers")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
                "cards": cards
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function declareDefender(player, index) {
    var cards = [];

    cards.push({ uid: player.battlefield[index].uid });

    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/declare-defenders")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
                "cards": cards
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function declareTarget(player, index) {
    var cards = [];

    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/declare-target")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
                "target": {
                    uid: opponent.buildings[index].uid
                }
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function attack() {
    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/attack")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function killOnBoard(player, index) {
    var cards = [];

    cards.push({ uid: player.battlefield[index].uid });

    return new Promise(function (resolve, reject) {
        request
            .post(host + "/game/kill-on-board")
            .set("Authorization", `Bearer ${game.accessToken}`)
            .send({
                "gameId": game.gameId,
                "player": {
                    "username": player.username,
                    "anonymous": true
                },
                "cards": cards
            })
            .end(function (err, res) {
                resolve(JSON.parse(res.text));
            });
    });
}

function doAction(promise) {
    return promise.then(function (res) {
        return updateBoard()
            .then(function (board) {
                for (var index = 0; index < res.length; index++) {
                    events.push(res[index]);
                }

                es = JSON.stringify(events);

                return {
                    res: res,
                    board: board
                };
            })
    })
}

createGame()
    .then(function (data) {
        return doAction(startGame());
    })
    .then(function (data) {
        return doAction(playCard(player, 2));
    })
    .then(function (data) {
        return doAction(pass(player));
    })
    .then(function (data) {
        return doAction(playCard(player, 2));
    })
    .then(function (data) {
        return doAction(pass(player));
    })
    .then(function (data) {
        return doAction(declareAttackers(player, 0));
    })
    .then(function (data) {
        return doAction(declareAttackers(player, 1));
    })
    .then(function (data) {
        return doAction(declareTarget(player, 0));
    })
    .then(function (data) {
        return doAction(declareDefender(player, 1));
    })
    .then(function (data) {
        return doAction(pass(player));
    })
    .then(function (data) {
        return doAction(killOnBoard(player, 0));
    })
    .then(function (data) {

    })
    .catch(function () { });
    
