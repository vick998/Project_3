document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');

  // Submit form
  document.querySelector('#compose-view').addEventListener('submit',function(){ 
    submit_form()
    .then(load_mailbox('sent'))
  }); 
  // can be used with the submit input button, depends on preference - same functionality

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

async function submit_form() {
  event.preventDefault(); // K E Y - not returning to inbox
  var compdata = {
    'recipients': document.querySelector('#compose-recipients').value,
    'subject': document.querySelector('#compose-subject').value,
    'body': document.querySelector('#compose-body').value
  }
  var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  var postdata = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
  },
    body: JSON.stringify(compdata)
  }
  fetch(`emails`, postdata)
  .then(response => location.reload()) // K E Y
  .then(compdata => console.log(compdata))

  compose_email()
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 class='bolded'>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load data from provided model
  async function getMailbox(mailbox){
    const response = await fetch(`emails/${mailbox}`);
    var mailboxdata0 = await response.json();
    show_data(mailboxdata0)
  }
  getMailbox(mailbox)

  // Build HTML with data
  function show_data(mailboxdata) {
    if (mailbox === `inbox`) {
      for(let i = 0; i<mailboxdata.length; i++) {
        document.querySelector('#emails-view').innerHTML += `
        <div id='mail${i}' class='list-group-item ${mailbox}'>
        <p><span class='bolded'>${mailboxdata[i].sender}</span> ${mailboxdata[i].subject}</p>
        <p class='timest'>${mailboxdata[i].timestamp}</p>
        </div>`
        document.querySelector(`#mail${i}`).setAttribute('dataid',`${mailboxdata[i].id}`)
    }
  } else {
      for(let i = 0; i<mailboxdata.length; i++) {
        document.querySelector('#emails-view').innerHTML += `
        <div id='mail${i}' class='list-group-item ${mailbox}'>
        <p><span class='bolded'>${mailboxdata[i].recipients}</span> ${mailboxdata[i].subject}</p>
        <p class='timest'>${mailboxdata[i].timestamp}</p>
        </div>`
        document.querySelector(`#mail${i}`).setAttribute('dataid',`${mailboxdata[i].id}`)
      }
    }
    for(let i = 0; i<mailboxdata.length; i++){
      if (mailboxdata[i].read === true){
        document.querySelector(`#mail${i}`).style.backgroundColor='#DCDCDC'
      }
    }
    //Event handler for specific email entry
    var mails = document.querySelectorAll(`.${mailbox}`)
    mails.forEach(el => el.addEventListener('click',load_email))
  }

  //Build email HTML
  function load_email(event) {
    var email_id = event.currentTarget.getAttribute('dataid');

    async function getEmail(email_id) {
      const response = await fetch(`emails/${email_id}`);
      var emaildata = await response.json(); 
      load_email0(emaildata)
    }
    getEmail(email_id)

    function load_email0(emaildata) {
      console.log(emaildata)
      document.querySelector('#emails-view').innerHTML = ""
      document.querySelector('#emails-view').innerHTML += `
      <div>
      <div id='archbut'></div>
      <p><span class='bolded'>From:</span> ${emaildata.sender}</p>
      <p><span class='bolded'>To:</span> ${emaildata.recipients}</p>
      <p><span class='bolded'>Subject:</span> ${emaildata.subject}</p>
      <p><span class='bolded'>Timestamp:</span> ${emaildata.timestamp}</p>
      <button id='reply' class="btn btn-sm btn-outline-primary">Reply</button>
      <hr>
      <p>${emaildata.body}</p>
      </div>
      `
      email_edit('read', true)
      var toarch = document.querySelector('#archbut')
      var bdata
      if(emaildata.archived === false) {
        toarch.innerHTML=`<button id="arch" class="btn btn-sm btn-outline-primary">Archive</button>`
        bdata = true
      } else {
        toarch.innerHTML=`<button id="arch" class="btn btn-sm btn-outline-primary active">Unarchive</button>`
        bdata = false
      }
      //Pass the function, not its result - tricky
      document.querySelector('#arch').addEventListener('click', function() {
        email_edit('archived', bdata)
        .then(load_mailbox('inbox'))
        // async needed for .then
      })
      document.querySelector('#reply').addEventListener('click', reply_form)
    }
    async function email_edit(chr, booly) {
      if(chr === 'archived') {
        var data = {
          'archived' : booly
        }
      } else {
        var data = {
          'read' : booly
        }
      }
      var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      var postdata = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          },
          body: JSON.stringify(data)
        }
        fetch(`emails/${email_id}`,postdata)
      .then(response => console.log(response))      
    }
    async function reply_form() {
      // Getting emaildata
      const response = await fetch(`emails/${email_id}`);
      var emaildata = await response.json();
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      // Prefilling composition fields
      document.querySelector('#compose-recipients').value = `${emaildata.sender}`
      document.querySelector('#compose-subject').value = `Re:${emaildata.subject}`;
      document.querySelector('#compose-body').value = `On ${emaildata.timestamp},${emaildata.sender} wrote: ${emaildata.body}`;
    }
  }
}





