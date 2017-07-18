var ot = require('./ot');
var rootDir = "./rootDir"
var fileHandler = require('./fileHandler');



module.exports = function (io) {
    var module = {};
    
    var baseStates = {}; //string only storage for the beginning context of the docstate 
                         //i.e. the string you start out with when the document is first requested

    //var rootDirTree = fileHandler.initRootDir(rootDir);
    
    var docStates = {};//dictionary for docstate storage
    baseStates["Hello World"] = 'function bubbleSort(a)\r\n{\r\n    var swapped;\r\n    do {\r\n        swapped = false;\r\n        for (var i=0; i < a.length-1; i++) {\r\n            if (a[i] > a[i+1]) {\r\n                var temp = a[i];\r\n                a[i] = a[i+1];\r\n                a[i+1] = temp;\r\n                swapped = true;\r\n            }\r\n        }\r\n    } while (swapped);\r\n}';


    var revs = {};//dictionary of revision numbers
    
    io.on('connection', function(socket){
    
    socket.openDocs = {};// a dictionary of local Peers
    console.log('client connected');
    socket.on('docRequest', function(docID,fn)
    {
        if(baseStates[docID] === undefined)
        {
            baseStates[docID] = "";
            docStates[docID] = new ot.docState("");
            revs[docID] = 0;
            //TODO check if the doc exists in the level DB server
        }
        
        if(docStates[docID] === undefined)
        {
            revs[docID] = 0;
            docStates[docID] = new ot.docState(baseStates[docID]);
        }//if the doc exists but theres no live docstate for it yet
        socket.openDocs[docID] = new ot.Peer();
        
        fn(baseStates[docID],docStates[docID].ops);
        
        //TODO: send errors
    });
        
    socket.on('getRootDir', function(fn)
    {
        
        var resultDir = fileHandler.readDir(rootDir);
        fn(resultDir);
    });
        
    socket.on('readDir', function(dir,fn)
    {
        fn(fileHandler.readDir(dir));
        
        //TODO: send errors
    });
    
    
    socket.on('update', function(opsChunk) {
        Object.keys(opsChunk).forEach(function(docID)
        {
            if(socket.openDocs[docID] != undefined)
            {
                for (var i = 0; i < opsChunk[docID].length; i++) 
                {
                    socket.openDocs[docID].merge_op(docStates[docID], opsChunk[docID][i]);
                    //for all the newly recived ops merge them with the key
                }
                
                if (revs[docID] < docStates[docID].ops.length) 
                {
                    var updateObject = {};
                    updateObject[docID] = docStates[docID].ops.slice(revs[docID]);
                    io.emit('update', updateObject);
                    revs[docID] = docStates[docID].ops.length;
                }
                console.log('update: \n' + JSON.stringify(opsChunk[docID]) + "\n" + docStates[docID].get_str());
            }
            
        });
    });//TODO: add peer mapping

    });

    return module;
};

