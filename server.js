var httpRequest = require('request');
var http = require("http");
var config = require("./config");
var _ = require("lodash");
var argv = require('yargs').argv;
var print = require('pretty-print');
var moment = require('moment');

var printOptions = {
    leftPadding: 2,
    rightPadding: 3,
    key: 'boardName',
    value: 'name'
};

var printOptions2 = {
    leftPadding: 2,
    rightPadding: 3,
    key: 'boardNameDate',
    value: 'name'
};


//printAllDoingCards();
printAllCardsWithDueDate();

function printAllDoingCards() {
    GetBoards(function(allBoards){
        GetLists(allBoards,function(allLists){//        console.log(_.map(allLists,'name'));
            getCards(_.filter(allLists,{name:'Doing'}),function(cards){//            cards = _.groupBy(cards,'boardName');
                print(cards,printOptions);
            });
        });
    });
}

function printAllCardsWithDueDate() {
    GetBoards(function(allBoards){
        GetLists(allBoards,function(allLists){//        console.log(_.map(allLists,'name'));
            getCards(allLists,function(cards){//            cards = _.groupBy(cards,'boardName');
                var dates = _(cards).filter('due').sortBy('due').map('due').uniq().value();
                var groupedCards = _(cards).filter('due').groupBy('due').value();
                _.forEach(dates,function(date){
                    console.log(moment(date,'YYYY-MM-DD').format('MMMM Do YYYY'));
                    var dateCards = groupedCards[date];
                    print(dateCards,printOptions);                    
                });
            });
        });
    });

}

function GetBoards(completeCallback)
{
    console.log("@Boards");
    httpRequest('https://api.trello.com/1/members/me/boards?key='+config.api_key+'&token='+config.api_token, function (error, response, body) {

        if (!error) {
            completeCallback(JSON.parse(body));
        }
        else {
            console.error("@GetBoards  ", error);
            completeCallback(false, error);
        }
    });
};

function GetLists(boards, completeCallback)
{
    var completedRequestCount = 0;
    var completedRequests = [];

    function board2Url(board) {
        return 'https://api.trello.com/1/boards/' + board.id + '/lists?cards=open&fields=name,idBoard&key=' + config.api_key+'&token='+config.api_token;    
    }

    function readListsFromOneBoard(board) {
        httpRequest(board2Url(board), function(error,response,body) {
            if (!error) {
                var lists = JSON.parse(body);
                _.forEach(lists,function(list) { list.boardName = board.name; });
                completedRequests.push(lists);
                completedRequestCount++;
                if (completedRequestCount==boards.length) {
                    completeCallback(_.flatten(completedRequests));
                }
            }
            else
            {
                console.error("@GetLists ", error);
                completeCallback(false);
            }        
        }); 
    }



    console.log("@GetLists")
    _.forEach(boards,readListsFromOneBoard);
};

function getCards(lists, completeCallback) {
    _.forEach(lists,function(list){
        _.forEach(list.cards,function(card){
            card.listName = list.name;
            card.boardName = list.boardName;
        })
    });
    completeCallback( _(lists).map('cards').flatten().value() );
}
