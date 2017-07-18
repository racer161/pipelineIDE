class pipeFrame
{
    constructor(docID,docState, pipeFrame)
    {
        this.docID = docID;
        this.docState = docState;
        this.peer = new Peer();
        this.localStyleSheet = new pipeSheet();
        this.pipeFrame = pipeFrame;
        this.newLines = [];
        
        this.nextString = this.docState.get_str();// get the docstate string for the first time
        this.currenString = this.nextString;
        
        this.fontMetrics = new fontMetrics(12,"Inconsolata",this.pipeFrame);
        
        this.cursor = new cursor(this.fontMetrics.lineHeight,this.pipeFrame);
        
        //this is the pre that will be invisible and highlight friendly
        this.highlightPre = document.createElement('pre');
        this.highlightPre.className = "pipeText-frame-highlight";
        this.highlightPre.contentEditable = true;''
        this.pipeFrame.append(this.highlightPre);
        
        
        this.input = new inputListener(this.cursor,this.pipeFrame,this);
        
        this.currentFrame = document.createElement('pre');
        this.pipeFrame.appendChild(this.currentFrame);
        
        var t0 = performance.now();
        this.renderNextFrame();
        this.blit();
        var t1 = performance.now();
        console.log("Call to render took " + (t1 - t0) + " milliseconds.");
    }
    
    renderNextFrame()
    {
        var newFrame = document.createElement('div');
        newFrame.className = "pipeText-frame-visible";
        var newString = this.docState.get_str();
        var match = 0;
        
        this.newLines = []
        this.newLines.push(0);
        while(match < newString.length-1) 
        {
            match = newString.indexOf("\r\n",match) +2;
            this.newLines.push(match);  
        }
        var firstLine = newString.substring(0,this.newLines[1]);
        newString = newString.substring(this.newLines[1]);
        
        var funcHeaderPre = document.createElement('pre');
        funcHeaderPre.className = "pipeText-funcHeader";
        funcHeaderPre.style.fontSize = (this.fontMetrics.fontSize)+ "pt";
        funcHeaderPre.style.fontFamily = this.fontMetrics.fontFamily;
        funcHeaderPre.innerHTML = firstLine;
        newFrame.appendChild(funcHeaderPre);
        
        
        var finalDOM = "";
        var beginningIndex = 0;
        var lastStartIndex = 0;
        var lastEndingIndex = 0;
        while (lastEndingIndex <= this.localStyleSheet.endIndices.length)
        {
            if(this.localStyleSheet.startIndices[lastStartIndex] < this.localStyleSheet.endIndices[lastEndingIndex])
            {
                finalDOM += newString.substring(beginningIndex,this.localStyleSheet.startIndices[lastStartIndex]) 
                + '<span style="' + this.localStyleSheet.styles[lastStartIndex] + '">';
                beginningIndex = this.localStyleSheet.startIndices[lastStartIndex];
                lastStartIndex += 1;
            }//an opening span comes next
            else
            {
                finalDOM += newString.substring(beginningIndex,this.localStyleSheet.endIndices[lastEndingIndex]) + '</span>';
                beginningIndex = this.localStyleSheet.endIndices[lastEndingIndex];
                lastEndingIndex += 1;
            }//a closing span comes next
        }
        
        //visible pre
        var coloredPre = document.createElement('pre');
        coloredPre.className = "pipeText-frame";
        
        //set font
        coloredPre.style.fontSize = this.fontMetrics.fontSize + "pt";
        coloredPre.style.fontFamily = this.fontMetrics.fontFamily;
        
        //fill and append the final pre
        coloredPre.innerHTML = finalDOM;
        newFrame.appendChild(coloredPre);
        newString = firstLine + newString;
        
        //load the next round of variables for blitting
        this.nextString = newString;
        this.nextFrame = newFrame;
    }
    
    blit(){
        //set highlightable font size
        this.highlightPre.style.fontSize = this.fontMetrics.fontSize + "pt";
        this.highlightPre.style.fontFamily = this.fontMetrics.fontFamily;
        this.highlightPre.textContent = this.nextString;
        
        this.pipeFrame.removeChild(this.currentFrame);
        this.currentFrame = this.nextFrame;
        this.currenString = this.nextString;
        this.pipeFrame.appendChild(this.currentFrame); 
    }//blits the nextFrameDiv to the parentDiv
    
    setFont(size,family)
    {
        this.fontMetrics.setFontSize(size);
        this.fontMetrics.setFontFamily(family);
    }
    
    update(ops)
    {
        //TODO: Receive updates from server
        var rev = this.docState.ops.length;
        for (var i = 0; i < ops.length; i++) {
            this.peer.merge_op(this.docState, ops[i]); // for all the new revisions merge them into our docstate
        }

        if (rev < this.docState.ops.length) {
            var updateObject = {};
            updateObject[this.docID] = this.docState.ops.slice(rev);
            socket.emit('update', updateObject);//send revisions we have that others don't
        }
        
        this.renderNextFrame();
        this.blit();
        //docState.get_str();// get the new string and display it 
    }
    
    localUpdate(ops)
    {
        // apply ops locally
        for (var i = 0; i < ops.length; i++) {
            this.docState.add(ops[i]);
        }
        var updateObject = {};
        updateObject[this.docID] = ops;
        socket.emit('update', updateObject);
        console.log('ops:' + JSON.stringify(ops));
        console.log('docstate: ' + this.docState.get_str());
        this.renderNextFrame();
        this.blit();
    }
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
} 