// when page load, fetch all the habits
addEventListener('load', getAllHabits())


const logOut = document.querySelector('#logout');
const habitButtton = document.querySelector('#addHabit');
filterHabit;
getDate();
renderUser();

logOut.addEventListener('click', () => {
    localStorage.clear();
})

async function getAllHabits(){
    try {
        const options = { headers: new Headers({'Authorization': localStorage.getItem('token')}) }
        await fetch(`https://lap2-project-achieved.herokuapp.com/habits/user/${localStorage.getItem('user_id')}`, options)
        .then(res => res.json())
        .then(renderAllHabits)
        
    } catch (err) {
        console.warn(err);
    }
}

function getDate() {
    let date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    document.querySelector('#date').innerHTML = `${date.getDate()} ${month} ${date.getFullYear()}`;
}

function renderUser() {
    document.querySelector('#user').textContent = `${localStorage.getItem('username')}`;
}

function renderAllHabits(data){
    


    
        let lis = [];
        console.log(data);
        data.forEach(element => {
            console.log('loading to do list...')
            const li = document.createElement('li')
            const a = document.createElement('a')
            const img = document.createElement('img')
            a.textContent = element.description
            a.setAttribute('href', '#calender-div')
            
            a.setAttribute('class', 'habit')
            a.setAttribute('id', element.id)
            a.addEventListener('click', renderCalendar)
            li.append(a)
            li.setAttribute('id', `li_${element.id}`)
            li.setAttribute('class', element.frequency) // element.frequency
            img.setAttribute('src', '../images/delete.png')
            img.setAttribute('id', 'delete')
            img.addEventListener('click', deleteHabit.bind(this, a.getAttribute('id'), element.description))
            
            li.append(a)
            li.append(img)
            lis.push(li)
        });
    
        lis.forEach(li => {
            const ul = document.querySelector('#user-tasks')
            ul.append(li)
        })

        const tasks = document.querySelectorAll('li>a');

    tasks.forEach(task => {
        const id = task.getAttribute('id')
        const options = { headers: new Headers({'Authorization': localStorage.getItem('token')}) }
        fetch(`https://lap2-project-achieved.herokuapp.com/completion_dates/${id}`,options)
        .then(res => res.json())
        .then(crossCheckDates)
        
        function crossCheckDates(dates){
            
            let date = new Date();
            const month = date.toLocaleString('default', { month: '2-digit' });
            const todaysDate = `${date.getDate()}_${month}_22`
            
            if(dates.err === 'Completion dates not found for this habit'){
                console.log('no date')
            } else{
                
                console.log(dates)
                dates.forEach( date => {
                    console.log(date.date)
                    if(date.date === todaysDate ){
                        task.setAttribute('class', 'habit_Completed')
                    }
                })
                
            }
            
        }
    })

    
}

// TASK POSTING
const checklistButton = document.querySelector('#checklistButton')
const hideChecklistButton = document.querySelector('#hideChecklist')
checklistButton.addEventListener('click', renderCheckList)
hideChecklistButton.addEventListener('click', removeChecklist)
// render the checklist
function renderCheckList() {
    let divs =[];
    const tasks = document.querySelectorAll('li>a');

    tasks.forEach(task => {
        const id = task.getAttribute('id')
        const options = { headers: new Headers({'Authorization': localStorage.getItem('token')}) }
        fetch(`https://lap2-project-achieved.herokuapp.com/completion_dates/${id}`,options)
        .then(res => res.json())
        .then(renderHabitChecklist)
        
        function renderHabitChecklist(data){
            let date = new Date();
            const month = date.toLocaleString('default', { month: '2-digit' });
            const todaysDate = `${date.getDate()}_${month}_22`
            let count = 0;

            if(data.err === 'Completion dates not found for this habit'){
                console.log('no date')
            } else{
                data.forEach( date => {
                    console.log(date.date)
                    if(date.date === todaysDate ){
                        count = 1;
                    }
                })
            }
            if(data.err === 'Completion dates not found for this habit' || count === 0){
                
                if(task.getAttribute('class') === 'habit'){
                    const div = document.createElement('div')
                    div.setAttribute('class',`confirm ${task.getAttribute('id')}`)
                    div.setAttribute('id',`checkbox_${task.getAttribute('id')}`)
                    const p = document.createElement('p')
                    p.textContent = `Did you complete ${task.textContent} today?`
                    const yesInput = document.createElement('input')
                    yesInput.setAttribute('class','yesButton')
                    yesInput.setAttribute('id',`yesButton_${task.getAttribute('id')}`)
                    yesInput.setAttribute('type','checkbox')
                    yesInput.setAttribute('name',`confirm_${task.getAttribute('id')}`)
                    yesInput.setAttribute('value','yes')
                    div.append(p)  
                    div.append(yesInput)
                    // 
                    const checklistDiv = document.querySelector('.taskForm')
                    checklistDiv.prepend(div)


                } else {
                    console.log('completing tasks....')
                    task.setAttribute('class', 'habbit_completed')
                }
            

            }
        }
    })

    const checklistDiv = document.querySelector('.taskForm')

    const submitChecklist = document.createElement('button')
    submitChecklist.setAttribute('id', 'checklistSubmit')
    submitChecklist.textContent = 'Submit Checklist'
    submitChecklist.addEventListener('click', postChecklist)
    checklistDiv.append(submitChecklist)



    checklistButton.setAttribute('hidden', 'hidden')
    hideChecklistButton.removeAttribute('hidden')
}




function removeChecklist(){
    const divs = document.querySelectorAll('.confirm')
    divs.forEach(div => {
        div.remove();
    })

    hideChecklistButton.setAttribute('hidden', 'hidden')
    checklistButton.removeAttribute('hidden')
    const submitChecklist = document.querySelector('#checklistSubmit')
    submitChecklist.remove()
}

function postChecklist() {
    const yesButtons = document.querySelectorAll('.yesButton')
    
    checkedyesButtons = Array.from(yesButtons).filter(yesButton =>{
        return yesButton.checked === true
    })
   
    let date = new Date();
    const month = date.toLocaleString('default', { month: '2-digit' });
    const todaysDate = `${date.getDate()}_${month}_22`
    console.log(todaysDate);
    checkedyesButtons.forEach(yesButton => {
        try {
            const entryData = {
                habit_id: parseInt(yesButton.getAttribute('id').split('_')[1]),
                date: todaysDate
            
            }
            console.log(entryData)
            const options = {
                method : "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(entryData)
            }
            fetch(`https://lap2-project-achieved.herokuapp.com/completion_dates`, options)
            .then(reloadPage)
        } catch (err) {
            console.warn(err);
        }
        const yesdiv = document.querySelector(`#checkbox_${yesButton.getAttribute('id').split('_')[1]}`)
        yesdiv.remove()
        const task = document.getElementById(`${yesButton.getAttribute('id').split('_')[1]}`)
        task.setAttribute('class', 'habbit_completed')
    })
   
}
    

// getting calender modals to pop up


async function renderCalendar(e){
    try {
        const id = e.srcElement.getAttribute('id')
        console.log(e.srcElement.getAttribute('id'))
        const options = { headers: new Headers({'Authorization': localStorage.getItem('token')}) }
        await fetch(`https://lap2-project-achieved.herokuapp.com/completion_dates/${id}`,options)
        .then(res => res.json())
        .then(updateCalendar)
    } catch (err) {
        console.warn(err);
    }
    console.log(e.srcElement.textContent)
    const calenderHeader = document.querySelector('#calender-header')
    calenderHeader.textContent = `Habit: ${e.srcElement.textContent}`
}

function updateCalendar(data){
    console.log(data)

    if(data.err === 'Completion dates not found for this habit'){
        console.log('do nothing')
    } else {
        const dates = document.querySelectorAll('td')
        data.forEach(element => {
            console.log(element.habitId)
            const list = document.getElementById(`li_${element.habitId}`)
       
            if(list.getAttribute('class') === 'Monthly'){
                    
                    dates.forEach(date => {
                        if(date.textContent){
                        date.setAttribute('class', 'completed')
                        }
                    })
            
                        
                        
            } else if(list.getAttribute('class') === 'Weekly'){
                
                
                    const dateSplit = element.date.split('_')
                    let days = []
                    days.push(dateSplit[0]);
                    console.log(days)
                    for(let i = 0 ; i < 6; i++){
                        days.push((parseInt(days[i]) + 1).toString())
                    }
                    days.forEach(day => {
                        dates.forEach(date => {
                            if(date.textContent === day){
                                date.setAttribute('class', 'completed')
                            } 
                        })

                    })
                    

            } else {
                
                    console.log(element.date)
                    
                    const dateSplit = element.date.split('_')
                    const day = dateSplit[0];
                    
                    dates.forEach(date => {
                        if(date.textContent === day){
                            date.setAttribute('class', 'completed')
                        }
                    })
                    
                
            }
        })
    }
)}


function logout() {
    localStorage.clear();
}
// add filter for complete, incomplete , none
// function filterTasks() {
//     const tasks = document.querySelectorAll(li > a)
//     const completedTasks = tasks.filter(task => {
//         task.getAttribute('class') = 'habbit_completed'
//     })

//     completedTasks.forEach(task => {
//          const ul = document.querySelector('#user-tasks')
         
//     })
// }

// Add the post habit function

function filterHabit() {
    const completedTasks = tasks.filter(task => {
            task.getAttribute('class') = 'habbit_completed'
    })
    console.log(completedTasks);
}

const habitForm = document.querySelector('#createHabitForm');
habitForm.addEventListener('submit', (e) => {
    addNewHabit(e);
    getHabitData(e.target.habitDescription.value);
})

function renderNewHabit(filtered){
    let entryData;
    let entryId;
    for (let entry of filtered) { 
        entryData = {
            description: entry.description,
            frequency: entry.frequency,
            user_id: localStorage.getItem('user_id')
        }
        entryId = entry.id;
    }
    console.log(entryData);
    const li = document.createElement('li')
    const a = document.createElement('a')
    const img = document.createElement('img')
    a.textContent = entryData.description
    a.setAttribute('href', '#calendar-div')
    a.setAttribute('class', 'habit')
    a.setAttribute('id', entryData.id)
    a.addEventListener('click', renderCalendar(a.getAttribute('id')))
    img.setAttribute('src', '../images/delete.png')
    img.setAttribute('id', 'delete')
    img.addEventListener('click', deleteHabit.bind(this, entryId, entryData.description))
    li.append(a)
    li.append(img)
    li.setAttribute('class', 'habit-style')
    li.setAttribute('class', entryData.frequency) // element.frequency
    {
        const ul = document.querySelector('#user-tasks')
        ul.append(li)
    }
}

async function getHabitData(habit) {
    try {
        let filtered;
        const options = { headers: new Headers({'Authorization': localStorage.getItem('token')}) }
        await fetch(`https://lap2-project-achieved.herokuapp.com/habits/user/${localStorage.getItem('user_id')}`, options)
        .then(res => res.json())
        .then(data =>  {
                filtered = data.filter(match => match.description === habit)
            }
        )
        renderNewHabit(filtered)
    } catch (err) {
        console.log(err);
    }
}

async function addNewHabit(e) {
    e.preventDefault();
    try {
        const entryData = {
            description: e.target.habitDescription.value,
            frequency:e.target.frequency.value,
            user_id: localStorage.getItem('user_id')
        }
        console.log(entryData)
        const options = {
            method : "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(entryData)
        }
        fetch(`https://lap2-project-achieved.herokuapp.com/habits`, options)
        .then(reloadPage);
    } catch (err) {
        console.warn(err);
    }
}

function reloadPage() {
    location.reload();
}

async function deleteHabit(habit_id, description) {
    const options = {
        method : "DELETE",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({"id": habit_id})
    }
    if (confirm(`Delete entry "${description}"?`)) {
        fetch(`https://lap2-project-achieved.herokuapp.com/habits/${habit_id}`, options)
        .then(data => {
            location.reload();
        })
    } else {
        return;
    }
}
