//const { default: jwtDecode } = require("jwt-decode");

const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const closeButton1 = document.querySelector('#close1');
const closeButton2 = document.querySelector('#close2');

registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    checkUsernameExists(e)
})

loginForm.addEventListener("submit", (e) => {
    requestLogin(e);
})

closeButton1.addEventListener("click", (e) => {
    resetRegistration();
})

closeButton2.addEventListener("click", (e) => {
    resetLogin();   
})

async function checkUsernameExists(e) {
    try {
        let dupe;
        await fetch(`https://lap2-project-achieved.herokuapp.com/users`)
        .then(res => res.json())
        .then(data => {
            data.forEach(user => {
                if (e.target.name.value === user.name) {
                    dupe = true;
                }
            })
        });
        if (dupe) {
            document.querySelector('#name').placeholder = 'Username already in use...'
            resetRegistration();
        } else if ((e.target.password.value).length < 6){
            alert('Passwords need to be 6 characters long.');
            resetRegistration();
        }
        else {
            registerAccount(e);
        }
    }
    catch (err) {
        console.log(err);
    }
}

async function registerAccount(e) {
    e.preventDefault();
    if (e.target.password.value === e.target.confirmpassword.value) { 
        const options = {
            method : "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
        }
        await fetch("https://lap2-project-achieved.herokuapp.com/users", options);
        resetRegistration();
        document.getElementById('close1').click();
    } else {
        alert('Passwords do not match');
    }
    resetRegistration();
}

/*async function accountLogin(e) {
    e.preventDefault();
    const options = {
        method : "POST",
        header: { "Content-Type": "application/json"},
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    }
    await fetch("https://lap2-project-achieved.herokuapp.com/users/login", options)
    .then(res => res.json())
    .then(data => {
        /*let user = data.filter(user => e.target.name.value === user.name);
        if (!user.length) {
            alert('Login failed.');
            resetLogin();
        }
        for (const userDetails of user) {
            console.log(userDetails);
            if (e.target.password.value === userDetails.password) {
                login(userDetails);
                window.location.href = 'user_home_page.html';
                resetLogin();
            }
            else {
                alert('Login failed');
                resetLogin();
            }
        }
    })
}*/

async function requestLogin(e){
    e.preventDefault();
    try {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
        }
        const r = await fetch(`https://lap2-project-achieved.herokuapp.com/users/login`, options)
        const data = await r.json()
        console.log(data);
        if (!data.success) { throw new Error('Login not authorised'); }
        login(data.token);
    } catch (err) {
        console.warn(err);
    }
}

function resetLogin() {
    document.querySelector('#loginForm').reset();
}

function resetRegistration() {
    document.querySelector('#registerForm').reset();
}

function login(token) {
    const decodedToken = jwt_decode(token);
    localStorage.setItem('token', token);
    localStorage.setItem('username', decodedToken.username);
    localStorage.setItem('user_id', decodedToken.user_id);
    window.location.href = 'user_home_page.html';
    resetLogin();
}

function logout(){
    localStorage.clear();
}

