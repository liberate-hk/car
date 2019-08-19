function onButtonClick() {
  const text = document.getElementById("carplate").value;
  if(!text) return;
  document.getElementById("submit").disabled = true;
  fetch('./carplate.json')
    .then(response => {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(json => {
      console.log(json);
      const find = json.find(item => item.id === text.trim());
      if(!find) {document.getElementById("result").innerHTML = getRandomStatus();}
      else {document.getElementById("result").innerHTML = "凶";}
    })
    .catch(err => {
      console.log('error fetching', err);
    })
    .finally(() => {
      document.getElementById("submit").disabled = false;
    });
}

function getRandomStatus() {
  const statusArr = ["大吉", "小吉", "中吉"];
  const index = Math.floor(Math.random() * 3);
  return statusArr[index];
}

if ("serviceWorker" in navigator) {
  const prefix = window.location.host.startsWith("localhost")? "" : "/car";
  navigator.serviceWorker.register("/service-worker.js", {scope: './'})
      .then(function (registration) {
          console.log("Service Worker registered with scope:", 
                       registration.scope);
      }).catch(function (err) {
      console.log("Service worker registration failed:", err);
  });
}