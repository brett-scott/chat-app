const socket = io();

const dateTimeFormat = '(DD/MM/YY) h:mm A'

//  Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#geo-button');
const $messages = document.querySelector('#messages');

//  Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//  Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //  New message element
    const $newMessage = $messages.lastElementChild

    //  Height of new message
    const newMesssageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMesssageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    //  Visible height
    const visibleHeight = $messages.offsetHeight;

    //  Height of messages container
    const containerHeight = $messages.scrollHeight;

    //  How far have they scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socket.on('message', (message) => {
    //  Store the final HTML to be rendered
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format(dateTimeFormat)
    })
    //  beforeend adds before the end of the messages div
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('locationMessage', (message) => {
    //  Store the final HTML to be rendered
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        message,
        createdAt: moment(message.createdAt).format(dateTimeFormat)
    })
    //  beforeend adds before the end of the messages div
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();     //  Prevents page auto-reloading

    //  Disable button to prevent double send
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.chatInput.value

    socket.emit('sendMessage', message, (error) => {
        //  Re-enable button and reset input
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message delivered')
    });
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Your browser does not support this feature.")
    }

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        }, () => {
            console.log('Location Shared!')
            $locationButton.removeAttribute('disabled');
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
});