var timeOfLastFrame = Date.now();
const X = 0;
const Y = 1;
let gameOverCounter = 0;
let gameOverBuildUp = 0;
setTimeout(preStart,1990);
setTimeout(showInfo,1665);
function showInfo() {
	let information = document.getElementsByClassName("info");
	var looper = information.length;
	while(looper > 0) {
		--looper;
		information[looper].style.display = "inline";
	}
}
var gameIsLive = true;
let levels = document.getElementsByClassName("level");
let inputFrameUsed = false;
var html = document.getElementsByTagName("html")[0];
var playerContainer = document.getElementById("player");
let playerStyle = window.getComputedStyle(playerContainer);
let body = document.getElementsByTagName("body")[0];
let bodyStyle = window.getComputedStyle(body);
let veryDangerous = [];
let dangerType = new Map();
dangerType.set(false,[]);
dangerType.set(true,[]);
let directionType = new Map();
directionType.set(false,"top");
directionType.set(true,"left");
let dimensionType = new Map();
dimensionType.set(true,"width");
dimensionType.set(false,"height");
let currentLevel = 0;
function preStart() {
	html.addEventListener("keydown",pressStart,{once: true});
}
var dangerous = defineDangers();
function defineDangers() {
	try {
		var risky = Array.from(levels[currentLevel].getElementsByClassName("dangerous"));
	} catch(err) {
		var risky = [];
		let from = levels[currentLevel].getElementsByClassName("dangerous").length;
		var index = from.length;
		while(index > 0) {
			--index;
			risky.unshift(from[index]);
		}
	} finally {
		return risky;
	}
}
var playerMovementFrame = [0,0];
var playerAttributes = ["left","top","width","height"];
const LEFT = X;
const TOP = Y;
var timeBetweenFrames;
var playerMovementRate = window.innerWidth / 5500;
function keypress(key) {
	switch(key["key"]) {
		case "ArrowDown":
			playerMovementFrame[Y] = playerMovementRate;
			break;
		case "ArrowUp":
			playerMovementFrame[Y] = playerMovementRate * -1;
			break;
		case "ArrowRight":
			playerMovementFrame[X] = playerMovementRate;
			break;
		case "ArrowLeft":
			playerMovementFrame[X] = playerMovementRate * -1;
			break;
	}	
}
function showArrow() {
	let arrowStyle = document.getElementById("arrow").style;
	arrowStyle.display = "block";
	arrowStyle.animationName = "blink";
}
function pressStart(key) {
	if(key["key"] == "Enter") {
		document.getElementsByTagName("h1")[0].hidden = true;
		document.getElementById("startPrompt").hidden = true;
		setTimeout(showArrow,1250);
		start();
	} else {
		document.addEventListener("keydown",pressStart,{once: true});
	}
}
function keyrelease(key) {
	switch(key["key"]) {
		case "ArrowDown": 
			if(playerMovementFrame[Y] > 0) {
				playerMovementFrame[Y] = 0;
			}
			break;
		case "ArrowUp":
			if(playerMovementFrame[Y] < 0) {
				playerMovementFrame[Y] = 0;
			}
			break;
		case "ArrowRight":
			if(playerMovementFrame[X] > 0) {
				playerMovementFrame[X] = 0;
			}
			break;
		case "ArrowLeft":
			if(playerMovementFrame[X] < 0) {
				playerMovementFrame[X] = 0;
			}
			break;
	}
}
function start() {
	window.requestAnimationFrame(movementThisFrame);
	html.addEventListener("keydown",keypress);
	html.addEventListener("keyup",keyrelease);
}
function stopGame() {
	gameIsLive = false;
	window.requestAnimationFrame(gameOver);
}
function gameOver() {
	setTimeout(restart,750);
	alert("Game Over!");
	gameIsLive = false;
	gameOverCounter++;
}
function restart() {
	location.reload();
}
function getDimensions(element,dimension) {
	let dimensions = [getProperty(element,directionType.get(dimension))];
	dimensions.push(dimensions[0] + getProperty(element,dimensionType.get(dimension)));
	return dimensions;
}
function specialWindow(dimension) {
	if(dimension == 0) {
		return window.innerWidth;
	} else {
		return window.innerHeight;
	}
}
let baseOverLimit = [0,0];
let baseUnderLimit = [0,0];
let unfinished = true;
let bodyAttributes = ["margin-left","margin-top"];
function movePlayer(movement,dimension) {
	let playerPosition = parseFloat(playerStyle.getPropertyValue(playerAttributes[dimension]));
	let playerWants = playerPosition + movement;
	if(playerWants < 0) {
		body.style.setProperty(bodyAttributes[dimension],Math.min(0,parseFloat(bodyStyle.getPropertyValue(bodyAttributes[dimension])) - playerWants) + "px");
		player.style.setProperty(playerAttributes[dimension],Math.max(0,playerWants) + "px");
	} else {
		let over = specialWindow(dimension) - parseFloat(playerStyle.getPropertyValue(playerAttributes[dimension + 2]));
		if(playerWants > over) {
			let levelMax = getProperty(levels[currentLevel],playerAttributes[dimension + 2])
			body.style.setProperty(bodyAttributes[dimension],Math.max(over - levelMax,parseFloat(bodyStyle.getPropertyValue(bodyAttributes[dimension])) + (over - playerWants)) + "px")
			player.style.setProperty(playerAttributes[dimension],Math.min(levelMax,over) + "px");
		} else {
			player.style.setProperty(playerAttributes[dimension],playerWants + "px");
		}
	}
}
function newLevel() {
	playerContainer.style.left = "3vw";
	playerContainer.style.top = "2.5em";
	body.style.marginLeft = "";
	body.style.marginTop = "";
	levels[currentLevel - 1].style.display = "none";
	levels[currentLevel].style.display = "block";
	dangerous = defineDangers();	
	window.requestAnimationFrame(resetUnfinished);
	makeList(false);
	makeList(true);
}
function resetUnfinished() {
	unfinished = true;
}
function movementThisFrame() {
	timeBetweenFrames = Date.now() - timeOfLastFrame;
	if(gameIsLive) {
		if(playerMovementFrame[X] != 0 || playerMovementFrame[Y] != 0) {
			for(var looper = 1 ; looper >= 0 ; looper--) {
				playerMovementFrame[looper] *= timeBetweenFrames;
				movePlayer(playerMovementFrame[looper],looper);
				playerMovementFrame[looper] /= timeBetweenFrames;
			}
		}
		checkAllDanger();
		window.requestAnimationFrame(movementThisFrame);
		timeOfLastFrame = Date.now();
	}
}
function getProperty(element,value) {
	return parseFloat(window.getComputedStyle(element).getPropertyValue(value));
}
function getWidth(dimensions) {
	dimensions.push(dimensions[1] - dimensions[0]);
}
function stopSignHitBox(sign,dimensions,direction,kind,caller) {
	let signOpposite = getDimensions(sign,!kind);
	let signDimension = getDimensions(sign,kind);
	getWidth(signOpposite);
	getWidth(signDimension);
	let signUnit = signOpposite[2] / (Math.SQRT2 + 2);
	let room = (signOpposite[0] + signUnit * (Math.SQRT2 * (!direction[1] * 1) + 1)) * boolToSign(direction[1]) + dimensions[1] * boolToSign(!direction[1]);
	let ratio = signOpposite[2] / signDimension[2];
	let test = (signDimension[!direction[0] * 1] + room * boolToSign(direction[0]) * ratio) * boolToSign(direction[0]) + dimensions[0] * boolToSign(!direction[0]);
	if(test < 0 && gameIsLive) {
		stopGame();
	}
}
function smartCheck(danger,playerDimension,direction,kind,caller) {
	for(var l = danger.classList.length ; l > 0 ; --l) {
		switch(danger.classList[l]) {
			case "stopSign":
				stopSignHitBox(danger,playerDimension,direction,kind,caller);
				break;
			case "finish":
				if(unfinished) {
					unfinished = false;
					currentLevel++;
					if(currentLevel == levels.length) {
						alert("You win! \nTo learn how to make your own web game like this, join Computer Science Club");
						location.reload();
					} else {
						newLevel();
					}
				}
				break;
			default:
				if(l == 0) {
					stopGame();
				}
		}
	}
}
function boolToSign(bool) {
	if(bool) {
		return 1;
	} else {
		return -1;
	}
}
function getRadius(circle) {
	return getProperty(circle,"width") / 2;
}
function fourtyFive(radius,position,direction) {
	return position + radius + (radius * Math.SQRT1_2) * boolToSign(direction);
}
function checkHighDanger(check,kind,direction,given) {
	let playerOpposite = [parseFloat(playerStyle.getPropertyValue(directionType.get(!kind))) - parseFloat(bodyStyle.getPropertyValue(marginType.get(!kind)))];
	playerOpposite.push(playerOpposite[0] + parseFloat(playerStyle.getPropertyValue(dimensionType.get(!kind))));
	let dangerOpposite = getDimensions(check,!kind);
	let oppositeDirection = (playerOpposite[1] - dangerOpposite[0]) < (dangerOpposite[1] - playerOpposite[0]);
	let radius = getRadius(playerContainer);
	smartCheck(check,[(given[0] + radius),playerOpposite[1]],[direction,oppositeDirection],kind,"lin1");
	smartCheck(check,[(playerOpposite[0] + radius),given[1]],[oppositeDirection,direction],!kind,"lin2");
	smartCheck(check,[fourtyFive(radius,given[0],direction),fourtyFive(radius,playerOpposite[0],oppositeDirection)],[direction,oppositeDirection],kind,"rad");
}
let dangerList = new Map();
function makeList(direction) {
	dangerList.set(direction,[]);
	for(var l = 0 ; l < dangerous.length ; l++) {
		if(getStringAttribute(dangerous[l],"transition-property").includes(directionType.get(direction))) {
			dangerList.get(direction).push(dangerous[l]);
		}
	}
}
let marginType = new Map();
marginType.set(true,"margin-left");
marginType.set(false,"margin-top");
makeList(false);
makeList(true);
function getStringAttribute(element,attribute) {
	return window.getComputedStyle(element).getPropertyValue(attribute);
}
function checkAllDanger() {
	if(playerMovementFrame[Y] != 0) {
		checkGivenDanger(false,dangerous);
	} else {
		checkGivenDanger(false,dangerList.get(false));
	}
	if(playerMovementFrame[X] != 0) {
		checkGivenDanger(true,dangerous);
	} else {
		checkGivenDanger(true,dangerList.get(true));
	}
}
function checkGivenDanger(dimension,dangers) {
	let playerDimension = [parseFloat(playerStyle.getPropertyValue(directionType.get(dimension))) - parseFloat(bodyStyle.getPropertyValue(marginType.get(dimension)))];
	playerDimension.push(playerDimension[0] + parseFloat(playerStyle.getPropertyValue(dimensionType.get(dimension))));
	for(var dangLooper = dangers.length - 1; dangLooper >= 0 ; dangLooper--) {
		let dangDimension = getDimensions(dangers[dangLooper],dimension);
		let checks = [playerDimension[1] - dangDimension[0],dangDimension[1] - playerDimension[0]];
		let localDanger = dangerType.get(dimension);
		let dangIncludes = localDanger.includes(dangers[dangLooper]);
		if(checks[0] > 0 && checks[1] > 0) {
			if(dangerType.get(!dimension).includes(dangers[dangLooper])) {
				checkHighDanger(dangers[dangLooper],dimension,checks[1] > checks[0],playerDimension);
			}
			if(!dangIncludes) {
				localDanger.push(dangers[dangLooper]);
			}
		} else if(dangIncludes) {
			localDanger.splice(localDanger.indexOf(dangers[dangLooper]),1);
		}
	}
}