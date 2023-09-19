"use strict";


const $username = $("#username");
const $first_name = $("#first_name");
const $password = $("#password");
const $last_name = $("#last_name");
const $phone = $("#phone");
const $btn = $("#btn");


function getUserInputs() {
  let username = $username.val();
  let password = $password.val()
  let first_name = $first_name.val();
  let last_name = $last_name.val();
  let phone = $phone.val();

  return { username, password, first_name, last_name, phone };
}


async function createUser(userParams) {
  const response = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userParams)
  });

  return response.json();
}

async function getAndRegisterUser(event) {
  event.preventDefault();

  const data = await createUser(getUserInputs());
  console.log(await data.json())
}


$btn.on("click", getAndRegisterUser)
