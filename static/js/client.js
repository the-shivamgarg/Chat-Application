const socket = io('http://192.168.0.102:8000');

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
const username = prompt('Enter Your Name To Join The Chat').capitalize();


const messagecontainer = document.querySelector("#chat-box");
const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageinp");
const onlinelist = document.querySelector("#online-members");
messageInput.focus();

function deletenames() {
    onlinelist.innerHTML = "";
};

function updatescroll() {
    var objDiv = document.getElementById("chat-box");
    objDiv.scrollTop = objDiv.scrollHeight;
};

function profilepic(firstname) {
    var initials = firstname.charAt(0);
    let profilepic = document.createElement("div");
    let profilename = document.createElement("div");
    profilename.innerHTML = initials;
    profilename.classList.add("profile-name");
    profilepic.classList.add("profile-pic");
    profilepic.append(profilename);
    return profilepic;
};

function showname(nameofuser) {
    let onlineuser = document.createElement('div');
    onlineuser.classList.add("online-user");
    onlinelist.append(onlineuser);

    onlineuser.append(profilepic(nameofuser));

    let onlineusername = document.createElement('div');
    onlineusername.classList.add("online-user-name");
    onlineuser.append(onlineusername);
    onlineusername.innerText = nameofuser;
};

const receiveaudio = new Audio("../sounds/receive.mp3");
const useraudio = new Audio("../sounds/joined-left.mp3");

socket.on("connect", () => {
    showname(username);
    let jsonobj = JSON.parse(paramname);
    jsonobj.forEach(element => {
        showname(element.name);
    });
    socket.emit("new-user-joined", username);
});

socket.on("user-joined", namedocument => {
    let nametobeappend = namedocument[namedocument.length - 1].name;

    let joinedmessage = document.createElement("div");
    let joinedelement = document.createElement("div");

    joinedelement.classList.add("joined-the-chat");
    joinedmessage.innerText = `${nametobeappend} has joined the chat`;

    joinedelement.append(joinedmessage);
    messagecontainer.append(joinedelement);

    deletenames();
    updatescroll();
    namedocument.forEach(element => {
        showname(element.name);
    });
    useraudio.play();
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let message = messageInput.value;
    socket.emit('send', message);

    var messagediv = document.createElement("div");
    messagediv.innerText = message;

    var usermessageright = document.createElement('div');
    usermessageright.classList.add("user-messageright");
    usermessageright.append(messagediv);

    var rightmessage = document.createElement("div");
    rightmessage.classList.add("right-message");
    rightmessage.append(usermessageright);

    messagecontainer.append(rightmessage);
    messageInput.value = "";
    updatescroll();
    messageInput.focus();
});

socket.on("receive", data => {
    let messageleft = document.createElement("div");
    messageleft.classList.add("left-message");

    var initials = data.name.charAt(0);

    messageleft.innerHTML = `<div class="profile">
    <div class="profile-pic-chats">
        <div class="profile-name-chats">${initials}</div>
    </div>
    <div class="nameofprofile">${data.name}</div>
    </div>
    <div class="user-messageleft">
    <div> ${data.message}</div>
    </div>`;

    messagecontainer.append(messageleft);
    updatescroll();
    receiveaudio.play();
});

socket.on("user-left", newlist => {
    let leftelement = document.createElement("div");
    let leftmessage = document.createElement("div");

    leftelement.classList.add("left-the-chat");
    leftmessage.innerText = `${newlist.name} has left the chat`;

    leftelement.append(leftmessage);
    messagecontainer.append(leftelement);

    deletenames();
    newlist.onlinelist.forEach(element => {
        showname(element.name);
    });
    updatescroll();
    useraudio.play();
});