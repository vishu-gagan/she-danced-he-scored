(function(){
  // Goa RSVP form: same validation and messages as the combined invite's Goa form.
  var RSVP_ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycby_Q3EmX3-aSc56OrrTgLwxKPJYEctlQfGdDlPr22jNPTuTJBKj_KX4BxX4CBvWJSjNZg/exec';

  var rsvpGoaForm = document.getElementById('rsvpGoaForm');
  var rsvpGoaStatus = document.getElementById('rsvpGoaStatus');
  var rsvpGoaSubmit = document.getElementById('rsvpGoaSubmit');

  var rsvpGoaGuestsField = document.getElementById('rsvpGoaGuestsField');
  var rsvpGoaGuestsInput = rsvpGoaGuestsField.querySelector('input[name="numGuests"]');

  function validatePhoneNumber(phone){
    // Remove all non-digit characters
    var digitsOnly = phone.replace(/[^\d]/g, '');
    // Check if at least 10 digits remain
    return digitsOnly.length >= 10;
  }

  function updateGoaGuestsFieldVisibility(){
    var checked = rsvpGoaForm.querySelector('input[name="response"]:checked');
    var isYes = checked && checked.value === 'Yes';
    rsvpGoaGuestsField.style.display = isYes ? '' : 'none';
    rsvpGoaGuestsInput.disabled = !isYes;
    if(!isYes){
      rsvpGoaGuestsInput.value = '';
    }
  }

  function updateFormButton(form, submitBtn){
    // Check if all required fields are filled and valid
    var nameInput = form.querySelector('input[name="name"]');
    var contactInput = form.querySelector('input[name="contact"]');
    var responseInput = form.querySelector('input[name="response"]:checked');

    var isNameValid = nameInput && nameInput.value && nameInput.value.trim().length > 0;
    var isContactValid = contactInput && contactInput.value && validatePhoneNumber(contactInput.value);
    var isResponseValid = responseInput && responseInput.value;

    var isConditionalValid = true;
    if(isResponseValid && responseInput.value === 'Yes'){
      var numGuestsInput = form.querySelector('input[name="numGuests"]');
      if(numGuestsInput) isConditionalValid = isConditionalValid && (numGuestsInput.value && numGuestsInput.value.length > 0);
    }

    submitBtn.disabled = !(isNameValid && isContactValid && isResponseValid && isConditionalValid);
  }

  // Set initial button state
  updateFormButton(rsvpGoaForm, rsvpGoaSubmit);

  Array.prototype.forEach.call(rsvpGoaForm.querySelectorAll('input[name="response"]'), function(radio){
    radio.addEventListener('change', updateGoaGuestsFieldVisibility);
  });

  // Update button state on any input change
  Array.prototype.forEach.call(rsvpGoaForm.querySelectorAll('input[name="name"], input[name="contact"], input[name="numGuests"], input[name="response"]'), function(input){
    input.addEventListener('input', function(){ updateFormButton(rsvpGoaForm, rsvpGoaSubmit); });
    input.addEventListener('change', function(){ updateFormButton(rsvpGoaForm, rsvpGoaSubmit); updateGoaGuestsFieldVisibility(); });
  });

  rsvpGoaForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(!rsvpGoaForm.checkValidity()){
      rsvpGoaForm.reportValidity();
      return;
    }
    var contactInput = rsvpGoaForm.querySelector('input[name="contact"]');
    if(!validatePhoneNumber(contactInput.value)){
      alert('Please enter a valid contact number (at least 10 digits)');
      return;
    }
    var responseInput = rsvpGoaForm.querySelector('input[name="response"]:checked');
    if(responseInput && responseInput.value === 'Yes'){
      if(!rsvpGoaGuestsInput.value || rsvpGoaGuestsInput.value < 1){
        alert('Please enter the number of guests');
        return;
      }
    }

    var fd = new FormData(rsvpGoaForm);
    var data = {};
    fd.forEach(function(value, key){ data[key] = value; });
    data.submittedAt = new Date().toISOString();
    data.sheet = 'Goa';

    rsvpGoaSubmit.disabled = true;
    rsvpGoaStatus.textContent = 'Sending your RSVP…';
    rsvpGoaStatus.className = 'form-status';

    fetch(RSVP_ENDPOINT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(data)
    }).then(function(){
      rsvpGoaStatus.textContent = 'Thank you! Your RSVP has been received.';
      rsvpGoaStatus.className = 'form-status success';
      rsvpGoaForm.reset();
      rsvpGoaSubmit.disabled = false;
    }).catch(function(){
      rsvpGoaStatus.textContent = 'Something went wrong sending your RSVP. Please check your connection and try again.';
      rsvpGoaStatus.className = 'form-status error';
      rsvpGoaSubmit.disabled = false;
    });
  });
})();
