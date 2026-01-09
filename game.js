// SAVE SYSTEM
let night = Number(localStorage.getItem("night")) || 1;

// TIME & POWER
let hour = 12;
let power = 100;
let powerOut = false;

// SYSTEM STATES
let leftDoor = false;
let rightDoor = false;
let ventClosed = false;
let lightOn = false;

// CAMERA
const cameras = ["Lobby", "Hallway", "Storage", "Vent"];
let camIndex = 0;

// AUDIO
const scream = document.getElementById("scream");
const footsteps = new Audio("assets/footsteps.mp3");
const doorbang = new Audio("assets/doorbang.mp3");

// ENEMIES
let enemies = {
  watcher: { pos: 0, aggro: 1 + night * 0.4 },
  crawler: { pos: 0, aggro: 1.5 + night * 0.5 },
  ventlurker: { pos: 0, aggro: 1 + night * 0.6 }
};

function toggleLeftDoor() { if (!powerOut) leftDoor = !leftDoor; }
function toggleRightDoor() { if (!powerOut) rightDoor = !rightDoor; }
function toggleVent() { if (!powerOut) ventClosed = !ventClosed; }
function toggleLight() { if (!powerOut) lightOn = !lightOn; }

function switchCam(dir) {
  camIndex = (camIndex + dir + cameras.length) % cameras.length;
  document.getElementById("currentCam").innerText =
    "CAM: " + cameras[camIndex];
}

// POWER
function drainPower() {
  if (powerOut) return;

  let drain = night * 0.3;
  if (leftDoor) drain += 1;
  if (rightDoor) drain += 1;
  if (ventClosed) drain += 1.5;
  if (lightOn) drain += 0.5;

  power -= drain;
  document.getElementById("power").innerText =
    "Power: " + Math.floor(power) + "%";

  if (power <= 0) triggerPowerOut();
}

function triggerPowerOut() {
  powerOut = true;
  leftDoor = rightDoor = ventClosed = lightOn = false;
  document.body.style.background = "#000";
  setTimeout(() => triggerJumpscare(), 3000);
}

// AI
function moveEnemy(enemy, maxPos) {
  if (Math.random() < 0.2 * enemy.aggro) enemy.pos++;
  if (enemy.pos > maxPos) enemy.pos = maxPos;
}

function updateEnemies() {
  moveEnemy(enemies.watcher, 3);
  moveEnemy(enemies.crawler, 3);
  moveEnemy(enemies.ventlurker, 2);

  // AUDIO WARNINGS (REAL)
  if (enemies.watcher.pos === 2 && !leftDoor) footsteps.play();
  if (enemies.crawler.pos === 2 && !rightDoor) footsteps.play();
  if (enemies.ventlurker.pos === 1 && !ventClosed) footsteps.play();
}

// ATTACK LOGIC (NO FAKES)
function checkAttacks() {
  if (enemies.watcher.pos >= 3 && !leftDoor) warningThenDeath();
  if (enemies.crawler.pos >= 3 && !rightDoor) warningThenDeath();
  if (enemies.ventlurker.pos >= 2 && !ventClosed) warningThenDeath();
}

function warningThenDeath() {
  doorbang.play();
  setTimeout(() => triggerJumpscare(), 1000);
}

// JUMPSCARE (REAL ONLY)
function triggerJumpscare() {
  document.getElementById("jumpscare").style.display = "block";
  scream.play();
  setTimeout(() => location.reload(), 2000);
}

// TIME & NIGHT
function advanceTime() {
  hour++;
  document.getElementById("time").innerText = hour + ":00 AM";

  if (hour >= 6) {
    night++;
    localStorage.setItem("night", night);
    alert("Night Complete");
    location.reload();
  }
}

// GAME LOOP
setInterval(() => {
  drainPower();
  updateEnemies();
  checkAttacks();
}, 1000);

setInterval(advanceTime, 10000);
