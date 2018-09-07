var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);
aw.state = init;

var level;
var player;
var levelIdx = 9;
var endLevelTime = 0;
var lives = 5;
var hardcoreMode = false;
let levelClassMap =
{
    L01: L01,
    L02: L02,
    L03: L03,
    L04: L04,
    L05: L05,
    L06: L06,
    L07: L07,
    L08: L08,
    L09: L09,
    L10: L10,
    L11: L11,
    L12: L12,
    L13: L13,
    L14: L14,
    L15: L15,
    L16: L16,
    L17: L17,
    L18: L18,
    L19: L19,
    L20: L20,
};

let backgroundSpeedLines = [];

function init()
{
    aw.state = mainMenu;

    aw.ctx.translate(screenWidth*0.5, screenHeight*0.5);
    aw.ctx.scale(1.0, -1.0);
    aw.ctx.shadowBlur = 20;
}

var menuOptions =
[
    {text:"PLAY", width:150},
    {text:"HARDCORE MODE", width:360},
    {text:"CREDITS", width:210}
];

function mainMenu(deltaTime)
{
    renderBackgroundSpeedLines(deltaTime);

    aw.ctx.save();
    aw.ctx.setTransform(1, 0, 0, 1, 0, 0);

    aw.ctx.shadowColor = "#08F";
    aw.drawText({text:"OFF THE LINE", x:15, y:10, fontSize:70, fontStyle:"bold italic", color:"#08F", textAlign:"left", textBaseline:"top"});

    let yMenu = 350;
    let yMenuStep = 40;
    let selectedOption = -1;
    for (let i = 0; i < menuOptions.length; i++)
    {
        let isHighlighted = aw.mousePos.y >= yMenu + yMenuStep*i && aw.mousePos.y < yMenu + yMenuStep*(i + 1) && aw.mousePos.x < menuOptions[i].width;
        let optionColor = isHighlighted ? "#FF0" : "#FFF";
        if (isHighlighted)
        {
            selectedOption = i;
        }
        aw.ctx.shadowColor = optionColor;
        aw.drawText({text:menuOptions[i].text, x:15, y:yMenu + yMenuStep*i, fontSize:35, fontStyle:"bold italic", color:optionColor, textAlign:"left", textBaseline:"top"}); 
    }
    
    if (aw.mouseLeftButtonJustPressed)
    {
        if (selectedOption === 0 || selectedOption === 1)
        {
            lives = 5;
            levelIdx = 0;
            initLevel(levelIdx);
            aw.mouseLeftButtonJustPressed = false;
            hardcoreMode = selectedOption == 1;
            aw.ctx.shadowBlur = 0;
            aw.state = playing;
            aw.statePost = drawUI;
        }
    }

    aw.ctx.restore();
}

function playing(deltaTime)
{
    aw.ctx.shadowBlur = 10;
    renderBackgroundSpeedLines(deltaTime);

    if (aw.keysJustPressed.right)
    {
        levelIdx = (levelIdx + 1) % Object.keys(levelClassMap).length;
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.left)
    {
        levelIdx--;
        if (levelIdx < 0)
        {
            levelIdx = Object.keys(levelClassMap).length - 1;
        }
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.r)
    {
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.h)
    {
        hardcoreMode = !hardcoreMode;
        if (hardcoreMode)
        {
            level.timer = level.levelTime;
        }
    }

    if (player.isDead || level.isComplete())
    {
        endLevelTime -= deltaTime;
        if (endLevelTime <= 0.0)
        {
            if (lives === 0)
            {
                aw.state = gameOver;
            }
            else if (player.isDead)
            {
                initLevel(levelIdx);
            }
            else
            {
                levelIdx = (levelIdx + 1) % Object.keys(levelClassMap).length;

                // Give extra life on 10/20/30/etc.
                if ((levelIdx % 10) === 0)
                {
                    lives = Math.min(lives + 1, 5);
                }
                initLevel(levelIdx);
            }
        }
    }
}

function initLevel(idx)
{
    aw.clearAllEntities();

    //idx += 1;
    // let levelClassName = `L${idx < 10 ? "0" + idx : idx}`;
    // level = new levelClassMap[levelClassName]();

    // TEMP TO WORK AROUND CLOSURE COMPILER ISSUES
    if (idx == 0) { level = new L01() }
    else if (idx == 1) { level = new L02() }
    else if (idx == 2) { level = new L03() }
    else if (idx == 3) { level = new L04() }
    else if (idx == 4) { level = new L05() }
    else if (idx == 5) { level = new L06() }
    else if (idx == 6) { level = new L07() }
    else if (idx == 7) { level = new L08() }
    else if (idx == 8) { level = new L09() }
    else if (idx == 9) { level = new L10() }
    else if (idx == 10) { level = new L11() }
    else if (idx == 11) { level = new L12() }
    else if (idx == 12) { level = new L13() }
    else if (idx == 13) { level = new L14() }
    else if (idx == 14) { level = new L15() }
    else if (idx == 15) { level = new L16() }
    else if (idx == 16) { level = new L17() }
    else if (idx == 17) { level = new L18() }
    else if (idx == 18) { level = new L19() }
    else if (idx == 19) { level = new L20() }
    aw.addEntity(level);

    player = new Player();
    aw.addEntity(player);

    endLevelTime = 1.0;
}

function drawUI(deltaTime)
{
    particleUpdate(deltaTime);

    aw.ctx.save();
    aw.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Timer
    if (hardcoreMode)
    {
        let xStart = 10;
        let yStart = screenHeight - 30;
        aw.ctx.fillStyle = "#FFF";
        aw.ctx.fillRect(xStart, yStart, (level.timer / level.levelTime)*(screenWidth - 20), 20);
    }

    // Level #
    aw.ctx.shadowColor = "#FFF";
    aw.drawText({text:`Level ${(levelIdx + 1)}`, x:10, y:30, fontSize:24, fontStyle:"bold"});

    // Lives
    for (let i = 0; i < 5; i++)
    {
        if (i < lives)
        {
            aw.ctx.lineWidth = 3;
            aw.ctx.strokeStyle = "#08F";
            aw.ctx.shadowColor = "#08F";
            aw.ctx.save();
            aw.ctx.translate(540 + i*20, 18);
            aw.ctx.beginPath();
            let boxSize = 10;
            aw.ctx.rect(-boxSize*0.5, -boxSize*0.5, boxSize, boxSize);
            aw.ctx.stroke();
            aw.ctx.restore();
        }
        else
        {
            aw.ctx.shadowColor = "#F00";
            aw.drawText({text:"x", x:536 + i*19.5, y:30, fontSize:24, fontStyle:"bold", color:"#F00"});
        }
    }

    // Game over
    if (aw.state === gameOver)
    {
        aw.ctx.shadowColor = "#111";
        aw.ctx.fillStyle = "#111";
        aw.ctx.fillRect(0, 52, screenWidth, 50);

        aw.ctx.shadowColor = "#F00";
        aw.drawText({text:"GAME OVER", x:screenWidth*0.5, y:100, fontSize:40, fontStyle:"bold", color:"#F00", textAlign:"center"});
    }

    aw.ctx.restore();
}

function gameOver(deltaTime)
{
    renderBackgroundSpeedLines(deltaTime);

    if (aw.mouseLeftButtonJustPressed)
    {
        aw.clearAllEntities();
        aw.mouseLeftButtonJustPressed = false;
        aw.ctx.shadowBlur = 20;
        aw.state = mainMenu;
        aw.statePost = undefined;
    }
}

var speedLineSize = 400;
var speedLineSpeed = 4000;
var numSpeedLinesPerFrame = 2;
function renderBackgroundSpeedLines(deltaTime)
{
    aw.ctx.save();
    aw.ctx.setTransform(1, 0, 0, 1, 0, 0);

    for (let i = 0; i < numSpeedLinesPerFrame; i++)
    {
        backgroundSpeedLines.push({x:screenWidth, y:Math.random()*screenHeight, _remove:false});
    }

    aw.ctx.lineWidth = 2;
    aw.ctx.strokeStyle = aw.state === mainMenu ? "#111" : "#090909";
    let shadowBlurSave = aw.ctx.shadowBlur;
    aw.ctx.shadowBlur = 0;
    
    backgroundSpeedLines.forEach(speedLine =>
    {
        speedLine.x -= speedLineSpeed*deltaTime;
        if (speedLine.x < -speedLineSize)
        {
            speedLine._remove = true;
        }

        aw.ctx.beginPath();
        aw.ctx.moveTo(speedLine.x, speedLine.y);
        aw.ctx.lineTo(speedLine.x + speedLineSize, speedLine.y);
        aw.ctx.stroke();
    });

    backgroundSpeedLines = backgroundSpeedLines.filter(speedLine => speedLine._remove !== true);

    aw.ctx.restore();
    aw.ctx.shadowBlur = shadowBlurSave;
}