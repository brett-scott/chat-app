const users = [];

const addUser = ({ id, username, room }) => {
    //  Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //  Validate data
    if(!username || !room) {
        return {
            error: 'Username and room and required.'
        }
    }

    //  Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //  Validate username
    if(existingUser){
        return {
            error: 'A user with that name already exists.'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    //  -1 equals no match
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

//  getUser
const getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    });
}

//  getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}