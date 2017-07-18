var fs = require('fs');
var p = require('path');
    
    //recursively read a directory into a dir tree
    module.exports.recReadDir = function(dir)
    {
        var dir = {};
        fs.readdir(rootDir,function(err,files)
        {
            files.forEach(function(file)
            { 
                if(fs.lstatSync(path.join(rootDir, file)).isDirectory())
                {
                    //console.log("Directory : " + file);
                    dir[file] = module.initRootDir(p.join(rootDir, file));
                }
                else
                {
                    //console.log("File : " + file);
                    dir[file] = p.extname(file);
                    
                }
            });
        });
        return dir;
        
    };
    
    module.exports.readDir = function(path)
    {
        var dir = {};
        fs.readdir(path ,function(err,files)
        {
            if(err){ console.log("Read Dir Error : " + err); }
            
            
            files.forEach(function(file)
            { 
                if(fs.lstatSync(p.join(path, file)).isDirectory())
                {
                    console.log("Line 44: Directory : " + file);
                    dir[file] = "";
                    
                }
                else
                {
                    console.log("Line 50: File : " + file);
                    dir[file] = p.extname(file);
                    console.log(dir[file]);
                }
            });
            console.log(dir);
            
        });
        return dir;
    };