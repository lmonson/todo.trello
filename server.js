var httpRequest = require('request');
var http = require("http");
var config = require("./config");
var _ = require("lodash");

GetBoards(function(allBoardIDs){
    GetLists(allBoardIDs,function(allLists){
        var result = _(allLists).flatten().map('cards').flatten().value();
        console.log(result);
    });
});

function GetBoards(completeCallback)
{
    console.log("@Boards");
    httpRequest('https://api.trello.com/1/members/me/boards?key='+config.api_key+'&token='+config.api_token, function (error, response, body) {

        if (!error) {

            var boardEntities = JSON.parse(body);
            var boardIds=[];
            var boardNames=[];
            for (var i=0; i<boardEntities.length;i++)
            {
                boardIds.push(boardEntities[i].id);
                boardNames.push(boardEntities[i].name);
            }

            completeCallback(boardIds, boardNames);
            // console.log(boardIds,boardNames);
        }
        else {
            console.error("@GetBoards  ", error);
            completeCallback(false, error);
        }
    });
};

function GetLists(boardIDs, completeCallback)
{
    console.log("@GetLists")
    var responses=[];
    var completed_requests=0;
    var urls=[];

    for (var i=0;i<boardIDs.length;i++) { //Making batch of urls to make async request
        urls.push('https://api.trello.com/1/boards/' + boardIDs[i] + '/lists?cards=open&fields=name,idBoard&key=' + config.api_key+'&token='+config.api_token);
    }
    
    for (var j =0; j<urls.length;j++) //looping in url list to make requests
    {
        httpRequest(urls[j], function (error, response, body) {
            if (!error) {

                responses.push(JSON.parse(body));
                completed_requests++; 

                if (completed_requests==urls.length) //waiting for completed requests to match with total url length so we can complete this function and go to the upper level.
                    completeCallback(responses);
            }
            else
         {
             console.error("@GetLists ", error);
                completeCallback(false);
         }
        });
    }
};


// var server = http.createServer(function (request, response) {
//     var _t = new Trello('f4c90cd53938d3ec53f75abdc8d9f474','dc28e359b45291db5268feea3c955c5bc1c81e65687262f8d6a978aa5b40a04d');
//     var AData={};
//     AData.Boards=[];
	
// 	_t.GetBoards(function (boardIds, boardNames) {
//         if (boardIds)
//         {
//             for (var i=0;i<boardNames.length;i++)
//             {
//                 AData.Boards.push(
//                     {
//                         Name:boardNames[i]
//                     });
//             }
//             console.log(AData);
//             _t.GetLists(boardIds,function (listEntity) {
			
// 			if (listEntity)
// 			{
// 				for (var i=0; i<listEntity.length;i++)
// 				{
// 					var boardIndex=boardIds.indexOf(listEntity[i][0].idBoard);

// 					for (var j=0; j<listEntity[i].length;j++)
// 					{
// 						if (listEntity[i][j].name==="Done")
// 							removeByIndex(listEntity[i],j);
// 					}
					
// 					AData.Boards[boardIndex].Lists=listEntity[i];
// 				}
// 				response.writeHead(200,{"Content-Type": "application/json"});
// 				response.write(JSON.stringify(AData));
// 				response.end();
				
// 			}
// 			else
// 			{
// 				response.writeHead(400,{"Content-Type": "text/plain"});
// 				response.write("Error getting list info.");
// 				response.end();
// 			}
// 		});
//         }
//         else
// 		{
// 			response.writeHead(400,{"Content-Type": "text/plain"});
//             response.write("Error getting board list.");
//             response.end();
// 		}

//     });
// });
// server.listen(8080);

// //////////////// CONSTRUCTOR FUNCTION ///////////////////////////

// function Trello(apiKey, apiToken)
// {
//     this.apiKey=apiKey;
//     this.apiToken=apiToken;
// }

// //////////////////// API CALLS  //////////////////////////////

// Trello.prototype.GetBoards = function(completeCallback)
// {
//     console.log("@Boards");
//     httpRequest('https://api.trello.com/1/members/me/boards?key='+this.apiKey+'&token='+this.apiToken, function (error, response, body) {

//         if (!error) {

//             var boardEntities = JSON.parse(body);
//             var boardIds=[];
//             var boardNames=[];
//             for (var i=0; i<boardEntities.length;i++)
//             {
//                 boardIds.push(boardEntities[i].id);
//                 boardNames.push(boardEntities[i].name);
//             }

//             completeCallback(boardIds, boardNames);
//         }
//         else {
//             console.error("@GetBoards  ", error);
//             completeCallback(false, error);
//         }
//     });
// };

// Trello.prototype.GetLists = function(boardId, completeCallback)
// {
// 	console.log("@GetLists")
//     var responses=[];
//     var completed_requests=0;
//     var urls=[];

// 	//Trello API do not have a batch request module so this section makes requests asynchronously and waiting responses to complete callback.
	
//     for (var i=0;i<boardId.length;i++) { //Making batch of urls to make async request
//         urls.push('https://api.trello.com/1/boards/' + boardId[i] + '/lists?cards=open&fields=name,idBoard&key=' + this.apiKey + '&token=' + this.apiToken);
//     }
	
//     for (var j =0; j<urls.length;j++) //looping in url list to make requests
//     {
//         httpRequest(urls[j], function (error, response, body) {
//             if (!error) {

//                 responses.push(JSON.parse(body));
//                 completed_requests++; 

//                 if (completed_requests==urls.length) //waiting for completed requests to match with total url length so we can complete this function and go to the upper level.
//                     completeCallback(responses);
//             }
//             else
// 			{
// 				console.error("@GetLists ", error);
//                 completeCallback(false);
// 			}
//         });
//     }
// };

// /////////// UTILITY FUNCTIONS //////////

// function removeByIndex(arr, index) {
//     arr.splice(index, 1);
// }
