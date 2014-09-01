API.ChatType = {};
API.ChatType.CHAT = 'message';
API.ChatType.MESSAGE = 'message';
API.ChatType.EMOTE = 'emote';
API.ChatType.MENTION = 'mention';
API.ChatType.WELCOME = 'welcome';
API.ChatType.UPDATE = 'update';

API.chatLogDiv = function(div) {
	var chat = $('#chat-messages');
	var a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
	chat.append(div);
	if (a) { chat.scrollTop(chat[0].scrollHeight); }
	if (chat.children().length >= 512) { chat.children.first.remove(); }
	return div;
};

API.genChatDiv = function(chattype, message, from, border, icon, namecolor) {
	var msg = document.createElement('div');
	msg.setAttribute('class', chattype);
	if (border != null) {
		msg.style.borderLeft = border + ' 3px solid';
	}
	if (icon != null) {
		var d = document.createElement('i');
		d.setAttribute('class', 'icon ' + icon);
		msg.appendChild(d);
	}
	var ts = document.createElement('div');
	ts.setAttribute('class', 'timestamp');
	ts.style.display = 'block';
	ts.innerHTML = new Date().toTimeString().substr(0,5);
	msg.appendChild(ts);
	
	if (from != null) {
		var f = document.createElement('span');
		f.className = 'from';
		f.innerHTML = from + ' ';
		if (namecolor != null) {
			f.style.color = namecolor;
		} else {
			f.style.color = '#b0b0b0';
		}
		f.style.fontWeight = '700';
		msg.appendChild(f);
	}
	if (message != null) {
		var m = document.createElement('span');
		m.className = 'text';
		m.innerHTML = '&nbsp;' + message;
		msg.appendChild(m);
	}
	return msg;
}

API.getMediaLength = function() {
    var length = {};
    var total = API.getMedia().duration;
    length.hours = Math.floor(total / 3600);
    length.minutes = Math.floor(total / 60);
    length.seconds = Math.floor(total % 60);
    length.totalseconds = total;
    return length;
};
 
API.getUserByName = function(name) {
    var u = null;
    var l = API.getUsers();
    for (var i = 0; i < l.length; i++) {
        if (l[i].username.toLowerCase() == name.toLowerCase()) {
            u = l[i];
            break;
        }
    }
    return u;
};

API.getLastChat = function() {
    var m = document.getElementById('chat-messages');
    var chat = m.children[m.children.length - 1];
    var obj = {};
    for (var i = 0; i < chat.children.length; i++) {
        if (chat.children[i].className.indexOf('from') > -1) {
            obj.from = chat.children[i].innerHTML.trim();
            obj.user = API.getUserByName(obj.from);
        }
        if (chat.children[i].className.indexOf('text') > -1) {
            obj.message = chat.children[i].innerHTML.trim();
            if (obj.message.indexOf('&nbsp;') == 0) {
                obj.message = obj.message.substring(6);
            }
        }
    }
    return obj;
};

$('#chat-messages').bind('DOMNodeInserted',function(event){ 
    API.dispatch('onChatDiv', event.target);
});

(function(){
    function fullVideo() {
        $('#playback:first, #playback-container:first')

        .css("left", "0px")
        .css("height", "100%")
        .css("width", "100%");
        
        $('#audience:first, #dj-booth:first').css("display", "none");
        
        $('#dj-button:first, #vote:first')
        .css('top', 'inherit')
        .css('bottom', '60px');
    }

    fullVideo();

    window.onresize = fullVideo;

    setInterval(function() {
        if ($('#playback-container')[0].style.width != '100%') {
            fullVideo();
        }
    }, 500);
})();

API.chatLogDiv(API.genChatDiv(API.ChatType.UPDATE, 'Enabled Client by <span class="from clickable" style="color: #2277FF">ImBarney</span> [ <a target="_blank" href="http://expnetworkpt.net/">EXPNPT</a> ]', null, '#AA0077', 'icon-chat-admin', null));

window.chat_index = 0;

function checkDoc(doc) {
    if (typeof(doc.getElementsByClassName('from')[0]) != 'undefined') {
        var name = doc.getElementsByClassName('from')[0].innerHTML.trim();
        var color = getColor(name);
        if (color != false) {
            doc.getElementsByClassName('from')[0].style.color = color[0];
            doc.getElementsByClassName('from')[0].style.fontWeight = 'bold';
            if (color[1]) {
                if (window.chat_index % 2 == 0) {
                    doc.style.backgroundColor = '#112357';
                } else {
                    doc.style.backgroundColor = '#113377';
                }
            }
            //doc.style.boxShadow = 'inset 1px 1px 3px 3px rgba(0,155,255,1.0)';
        }
    }
}

function getLastMessage() {
    var d = $('#chat-messages')[0];
    return d.children[d.children.length - 1];
}

function checkMentions(doc) {
    if (window.chat_index % 2 == 0) {
        doc.style.backgroundColor = 'rgb(124, 0, 0)';
    } else {
        doc.style.backgroundColor = 'rgb(134, 0, 0)';
    }
    doc.style.fontWeight = 'bold';
    doc.style.color = '#FFF';
    doc.style.boxShadow = 'inset #DDBB00 0 -2px 0 0, inset #DDBB00 -2px 0 0 0, inset #DDBB00 0 2px 0 0';
}

function checkModerations(doc) {
    if (window.chat_index % 2 == 0) {
        doc.style.backgroundColor = '#120023';
    } else {
        doc.style.backgroundColor = '#220033';
    }
}

function checkFriends() {
    setTimeout(function() { 
        var docs = [];
        docs.push.apply(docs, document.getElementsByClassName('message'));
        docs.push.apply(docs, document.getElementsByClassName('emote'));
        checkDoc(docs);
        checkMentions();
        var docs2 = [];
        docs2.push.apply(docs2, document.getElementsByClassName('moderation'));
        docs2.push.apply(docs2, document.getElementsByClassName('update'));
        docs2.push.apply(docs2, document.getElementsByClassName('welcome'));
        checkModerations(docs2);
    }, 10);
}

function getColor(name) {
    var uc = API.getUsers();
    for (var j = 0; j < uc.length; j++) {
        if (uc[j].username == name) {
            if (API.getUser().followers[uc[j].id] == true && API.getUser().following[uc[j].id] == true) {
                return [ '#aaddcc', true ];
            }
            if (API.getUser().followers[uc[j].id] == true) {
                return [ '#ddddaa', false ];
            }
            if (API.getUser().following[uc[j].id] == true) {
                return [ '#009cdd', true ];
            }
        }
    }
    return false;
}

function getRankColor(permission) {
    var r = 0; var g = 0; var b = 0;
    if (permission > 0) {
        r = 50, g = 0; b = 50;
    }
    if (permission > 5) {
        r = 10; g = 70; b = 30;
    }
    if (permission > 8) {
        r = 40; g = 40; b = 140;
    }
    
    if (window.chat_index % 2 > 0) {
        if ( r > 0 ) { r += 15; }
        if ( g > 0 ) { g += 15; }
        if ( b > 0 ) { b += 15; }
    }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

$('#chat-messages').css('opacity', '0.0').css('transition', 'opacity 0.5s');
document.styleSheets[0].addRule('.message', 'opacity: 0.0; transition: opacity 0.2s;');

function onDoc(doc) {
    window.chat_index++;
    if (window.chat_index > 1000000) { window.chat_index -= 1000000; }
    if (doc.classList[0] == 'message' || doc.classList[0] == 'emote') { 
        var check = true;
        // check room staff
        var t = API.getUserByName(doc.getElementsByClassName('from')[0].innerHTML.trim()); 
        if (t != null) {
            if (t.permission > 0) {
                doc.style.backgroundColor = getRankColor(t.permission);
                check = false;
            } else if (t.username == API.getUser().username) {
                doc.style.backgroundColor = 'rgb(100, 85, 0)';
                check = false;
            }
        }
        if (check)
            checkDoc(doc);
        // check TastyBot
        if (doc.getElementsByClassName('from')[0].innerHTML.trim() == 'Tastybot') {
            if (window.chat_index % 2 == 0) {
                doc.style.backgroundColor = 'rgb(110, 0, 55)';
            } else {
                doc.style.backgroundColor = 'rgb(120, 0, 60)';
            }
        }
    }
    if (doc.classList[0] == 'moderation' || doc.classList[0] == 'update' || doc.classList[0] == 'welcome') {
        checkModerations(doc);
    }
    if (doc.classList[0] == 'mention') {
        checkMentions(doc);
    }
    for (var i = 0; i < 25; i++) {
        setTimeout(function() {
            var chat = $('#chat-messages'), 
            a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
            if (a) chat.scrollTop(chat[0].scrollHeight);
        }, i*20);
    }
    doc.style.opacity = '1.0';
}

API.on('onChatDiv',onDoc);

API.on('onAPIAddonsLoaded', function() {
    $('#chat-messages').css('opacity', '1.0');
    var d = $('#chat-messages')[0].children;
    for (var i = 0; i < d.length; i++) {
        onDoc(d[i]);
    }
});

$('#chat-popout-button').css('display', '');

setTimeout(function() { API.dispatch('onAPIAddonsLoaded'); }, 1000);
