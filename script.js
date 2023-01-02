let addbtn = document.querySelector(".add-btn");
let removebtn = document.querySelector(".remove-btn");
let modalcont = document.querySelector(".modal");
let maincont = document.querySelector(".main-cont");
let textareacont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolboxColor = document.querySelectorAll(".color");

let colors = ["lightpink","lightblue","lightgreen","black"];
let modalPriorityColor = colors[colors.length-1];
let addflag = false;
let removeFlag  = false;
let lockclass = "fa-lock";
let unlockclass = "fa-lock-open";

let ticketArr = [];

if(localStorage.getItem("jira_tickets")){
    ///retrieve and display tickets
    ticketArr =JSON.parse(localStorage.getItem("jira_tickets"));

    ticketArr.forEach((ticketObj) =>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketId);
    })

}
for(let i =0;i<toolboxColor.length;i++){
     toolboxColor[i].addEventListener("click",(e) =>{
        let currentToolBoxColor = toolboxColor[i].classList[0];
       
       let filteredTickets =  ticketArr.filter((ticketObj,idx)=>{
                  return currentToolBoxColor === ticketObj.ticketColor;
        })
   
        ///remove previous ticket
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0;i<allTicketsCont.length;i++){
            allTicketsCont[i].remove();
        }
     /////display new filtered tickets
     filteredTickets.forEach((ticketObj,idx)=>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketId);
      })

     })


    ////double click to show all tickets
    toolboxColor[i].addEventListener("dblclick",(e) =>{
        ///remove previous ticket
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0;i<allTicketsCont.length;i++){
            allTicketsCont[i].remove();
        }
       /////DISPLAY all tickets
       ticketArr.forEach((ticketObj,idx) =>{
              createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketId)
       })
    })
}

////listener for modal priority color
allPriorityColors.forEach((colorElem,idx)  =>{
      colorElem.addEventListener("click",(e)=>{
        allPriorityColors.forEach((priorityColorElem,idx)=>{
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
      })
})


addbtn.addEventListener("click",(e)=>{
    ////display modal
    ////generate ticket
    ////add flag is true - > dispaly modal
    //////add flag is false - > modal none

    addflag = !addflag;
    if(addflag){
        modalcont.style.display = "flex";
     
    }else{
        modalcont.style.display = "none";  
    } 
  
})

removebtn.addEventListener("click", (e)=>{
    removeFlag = !removeFlag;
})

modalcont.addEventListener("keydown",(e)=>{
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColor,textareacont.value);
          defaultModal();
        addflag = false;
       

    }
})

function defaultModal(){
    textareacont.value = "";
    modalcont.style.display = "none"; 
    allPriorityColors.forEach((priorityColorElem,idx)=>{
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");
    modalPriorityColor = colors[colors.length-1];
    
}


function createTicket(ticketColor, ticketTask, ticketId){
    let id = ticketId||shortid();
    let ticketcont  = document.createElement("div");
    ticketcont.setAttribute("class","ticket-cont");
    ticketcont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class ="ticket-lock">
            <i class="fa-solid fa-lock"></i>
     </div>
`;
maincont.appendChild(ticketcont)
////create object of ticket and add to arr

if(!ticketId){
    ticketArr.push({ticketColor,ticketTask,ticketId:id});
    localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
}

handleRemoval(ticketcont);
handlelock(ticketcont,id);
handleColor(ticketcont, id);
}

function handleRemoval(ticket,id){
  ////remove flag = true - > remove
  ticket.addEventListener("click",(e) =>{
    let TicketIdx = getTicketIdx(id);
    if(removeFlag) {
        ///UI removal
        ticket.remove();
        ///////db removal
        ticketArr.splice(TicketIdx,1);
        localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
    } 
  })
  
}

function handlelock(ticket,id){
    let ticketlockElem = ticket.querySelector(".ticket-lock");
    let ticketTaskArea = ticket.querySelector(".task-area");
    let ticketlock = ticketlockElem.children[0];

    ticketlock.addEventListener("click",(e)=>{

        let TicketIdx = getTicketIdx(id);

       if(ticketlock.classList.contains(lockclass)){
            ticketlock.classList.remove(lockclass);
            ticketlock.classList.add(unlockclass);
            ticketTaskArea.setAttribute("contenteditable","true");
       }else{
        ticketlock.classList.remove(unlockclass);
        ticketlock.classList.add(lockclass);
        ticketTaskArea.setAttribute("contenteditable","false");
       }

       //////modify data in local storage (ticket task)
       ticketArr[TicketIdx].ticketTask =  ticketTaskArea.innerText;
       localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
    });
}


function handleColor(ticket, id){
    let ticketcolor = ticket.querySelector(".ticket-color");

    ////get ticketIdx from the ticket array
    let ticketIdx = getTicketIdx(id);

   ticketcolor.addEventListener("click", (e) =>{
    let currentTicketColor = ticketcolor.classList[1];
    ////get ticket color index
    let currentTicketColorIdx = colors.findIndex((color) =>{
        return (currentTicketColor === color)      
    })
    currentTicketColorIdx++;
    newTicketColorIdx = currentTicketColorIdx%colors.length;
    let newTicketColor = colors[newTicketColorIdx];
    ticketcolor.classList.remove(currentTicketColor);
    ticketcolor.classList.add(newTicketColor);

    ////modify data in local storage (PRIORITY COLOR CHANGE)
    ticketArr[ticketIdx].ticketColor = newTicketColor;
    localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
})
    
}


function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketObj,idx) =>{
        return ticketObj.ticketId === id;
    })
    return ticketIdx;
}

