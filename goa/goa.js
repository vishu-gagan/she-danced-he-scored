(function(){
  var form = document.getElementById('rsvpGoaForm');
  var status = document.getElementById('rsvpGoaStatus');
  var submit = document.getElementById('rsvpGoaSubmit');
  var guestsField = document.getElementById('rsvpGoaGuestsField');
  var guestsInput = guestsField.querySelector('input[name="numGuests"]');
  var endpoint = 'https://script.google.com/macros/s/AKfycby_Q3EmX3-aSc56OrrTgLwxKPJYEctlQfGdDlPr22jNPTuTJBKj_KX4BxX4CBvWJSjNZg/exec';

  function validPhone(value){
    return value.replace(/[^\d]/g, '').length >= 10;
  }

  function updateForm(){
    var response = form.querySelector('input[name="response"]:checked');
    var attending = response && response.value === 'Yes';
    guestsField.hidden = !attending;
    guestsInput.disabled = !attending;
    if(!attending) guestsInput.value = '';

    var name = form.querySelector('input[name="name"]').value.trim();
    var contact = form.querySelector('input[name="contact"]').value;
    var guestsValid = !attending || Number(guestsInput.value) >= 1;
    submit.disabled = !(name && validPhone(contact) && response && guestsValid);
  }

  form.addEventListener('input', updateForm);
  form.addEventListener('change', updateForm);
  form.addEventListener('submit', function(event){
    event.preventDefault();
    updateForm();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    var contact = form.querySelector('input[name="contact"]').value;
    if(!validPhone(contact)){
      status.textContent = 'Please enter a valid contact number with at least 10 digits.';
      status.className = 'form-status error';
      return;
    }

    var data = {};
    new FormData(form).forEach(function(value, key){ data[key] = value; });
    data.submittedAt = new Date().toISOString();
    data.sheet = 'Goa';
    submit.disabled = true;
    status.textContent = 'Sending your RSVP…';
    status.className = 'form-status';

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(data)
    }).then(function(){
      status.textContent = 'Thank you. Your Goa RSVP has been received.';
      status.className = 'form-status success';
      form.reset();
      updateForm();
    }).catch(function(){
      status.textContent = 'Unable to send your RSVP. Check your connection and try again.';
      status.className = 'form-status error';
      updateForm();
    });
  });
})();