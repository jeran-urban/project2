$(document).ready(function() {
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var userNameInput = $("input#userName-input");
  var passwordInput = $("input#password-input");
  var nameInput = $("input#name-input");

  // When the signup button is clicked, we validate the userName and password are not blank
  signUpForm.on("submit", function(event) {
    event.preventDefault();
    var userData = {
      userName: userNameInput.val().trim(),
      password: passwordInput.val().trim(),
      name: nameInput.val().trim()
    };

    if (!userData.userName || !userData.password || !userData.name) {
      return;
    }
    // If we have an userName and password, run the signUpUser function
    signUpUser(userData.userName, userData.password, userData.name);
    userNameInput.val("");
    passwordInput.val("");
    nameInput.val("");
  });

  // Does a post to the signup route. If succesful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userName, password, name) {
    $.post("/api/signup", {
      userName: userName,
      password: password,
      name: name
    }).then(function(data) {
      console.log("data ", data);
      window.location.replace(data);
      // If there's an error, log the error
    }).catch(function(err) {
      console.log(err);
    });
  }

});
