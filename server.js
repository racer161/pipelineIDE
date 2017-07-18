// Copyright 2016 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var socketEvents = require('./socketHandler')(io);

var options = {root: __dirname};
app.use(express.static('public_html'));

app.get('/ot.js', function(req, res){
    res.sendFile('ot.js', options);
});

http.listen(80, function(){
  console.log('Connect your client to http://localhost:3000/');
});
