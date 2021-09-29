document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Submit form
  document.querySelector('#compose-view').addEventListener('submit', submit_form); // can be used with the submit input button, depends on preference - same functionality

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

function submit_form() {
  event.preventDefault(); // K E Y
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
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

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
        <br>
        <h3>${mailboxdata[i]['sender'] + '(' + mailboxdata[i]['timestamp'] + ')'}</h3>
        <br>
        <h3>${mailboxdata[i]['subject']}</h3>
        </div>`
        // document.querySelector(`#mail${i}`).setAttribute('dataid',`${mailboxdata[i]['id']}`) Potential troublemakers
    }
  } else {
      for(let i = 0; i<mailboxdata.length; i++) {
        document.querySelector('#emails-view').innerHTML += `
        <div id='mail${i}' class='list-group-item ${mailbox}'>
        <br>
        <h3>${mailboxdata[i]['recipients'] + '(' + mailboxdata[i]['timestamp'] + ')'}</h3>
        <br>
        <h3>${mailboxdata[i]['subject']}</h3>
        <p class='modelid'>${mailboxdata[i]['id']}</p>
        </div>`
        // document.querySelector(`#mail${i}`).setAttribute('dataid',`${mailboxdata[i]['id']}`) Potential troublemakers
      }
    }
    var mails = document.querySelectorAll(`.${mailbox}`)
    mails.forEach(el => el.addEventListener('click',load_email))
  }

  function load_email(event) {
    var idel = event.currentTarget.id;
    var classel = event.currentTarget.classList;
    var email_id = event.currentTarget.getAttribute('dataid');

    async function getMailbox(mailbox){ 
      const response = await fetch(`emails/${mailbox}`);
      var mailboxdata0 = await response.json(); 
      load_email0(mailboxdata0)
    }

    console.log(idel)
    console.log(classel)
    console.log(email_id)
    getMailbox(classel[1])

    function load_email0(mailboxdata) {
      for(let m = 0; m<mailboxdata.length; m++){
        // if (email_id === mailboxdata[m].id){ // Troublemaker, async email
          document.querySelector('#emails-view').innerHTML = ""
          document.querySelector('#emails-view').innerHTML += `
          <div>
          <h3>${mailboxdata[m].subject}</h3>
          <p>${mailboxdata[m].body}</p>
          </div>
          `
        // }
      }
    }
  }
}




