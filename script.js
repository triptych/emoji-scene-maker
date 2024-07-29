let scene = [];
let selectedEmoji = '';
let selectedElement = null;

const picker = new EmojiButton();

picker.on('emoji', emoji => {
    selectedEmoji = emoji;
    document.getElementById('emojiButton').textContent = `Selected: ${emoji}`;
});

document.getElementById('emojiButton').addEventListener('click', () => {
    picker.togglePicker(document.getElementById('emojiButton'));
});

function addEmoji() {
    if (selectedEmoji) {
        const element = document.createElement('div');
        element.className = 'emoji';
        element.textContent = selectedEmoji;
        element.style.left = Math.random() * 250 + 'px';
        element.style.top = Math.random() * 150 + 'px';
        element.style.fontSize = '24px';
        document.getElementById('scene').appendChild(element);
        makeDraggable(element);
        scene.push({
            type: 'emoji', 
            content: selectedEmoji, 
            x: element.style.left, 
            y: element.style.top, 
            size: element.style.fontSize
        });
        element.addEventListener('click', (e) => selectElement(e, element));
    } else {
        alert('Please select an emoji first!');
    }
}

function addSpeechBubble() {
    const text = document.getElementById('textInput').value;
    if (text) {
        const element = document.createElement('div');
        element.className = 'speech-bubble';
        element.textContent = text;
        element.style.left = Math.random() * 200 + 'px';
        element.style.top = Math.random() * 150 + 'px';
        document.getElementById('scene').appendChild(element);
        makeDraggable(element);
        scene.push({
            type: 'speech', 
            content: text, 
            x: element.style.left, 
            y: element.style.top
        });
        element.addEventListener('click', (e) => selectElement(e, element));
    }
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        keepInBounds(element, document.getElementById('scene'));
        updateSceneItem(element);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function keepInBounds(element, scene) {
    const sceneRect = scene.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    let newLeft = parseInt(element.style.left);
    let newTop = parseInt(element.style.top);

    if (elementRect.left < sceneRect.left) newLeft = 0;
    if (elementRect.top < sceneRect.top) newTop = 0;
    if (elementRect.right > sceneRect.right) newLeft = sceneRect.width - elementRect.width;
    if (elementRect.bottom > sceneRect.bottom) newTop = sceneRect.height - elementRect.height;

    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
}

function updateSceneItem(element) {
    const index = Array.from(element.parentNode.children).indexOf(element);
    if (index !== -1) {
        scene[index].x = element.style.left;
        scene[index].y = element.style.top;
        if (element.classList.contains('emoji')) {
            scene[index].size = element.style.fontSize;
        }
    }
}

function selectElement(e, element) {
    e.stopPropagation();
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = element;
    element.classList.add('selected');
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'scene' || e.target === document.body) {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement = null;
        }
    }
});

function increaseSize() {
    if (selectedElement && selectedElement.classList.contains('emoji')) {
        let size = parseInt(selectedElement.style.fontSize);
        selectedElement.style.fontSize = (size + 2) + 'px';
        updateSceneItem(selectedElement);
    }
}

function decreaseSize() {
    if (selectedElement && selectedElement.classList.contains('emoji')) {
        let size = parseInt(selectedElement.style.fontSize);
        if (size > 12) {
            selectedElement.style.fontSize = (size - 2) + 'px';
            updateSceneItem(selectedElement);
        }
    }
}

function updateBackground() {
    const color = document.getElementById('bgColor').value;
    document.getElementById('scene').style.background = color;
}

function openGradientPicker() {
    document.getElementById('gradientDialog').showModal();
    updateGradientPreview();
}

function applyGradient() {
    const color1 = document.getElementById('gradientColor1').value;
    const color2 = document.getElementById('gradientColor2').value;
    const direction = document.getElementById('gradientDirection').value;
    const gradient = `linear-gradient(${direction}, ${color1}, ${color2})`;
    document.getElementById('scene').style.background = gradient;
    document.getElementById('gradientDialog').close();
}

document.getElementById('gradientColor1').addEventListener('input', updateGradientPreview);
document.getElementById('gradientColor2').addEventListener('input', updateGradientPreview);
document.getElementById('gradientDirection').addEventListener('change', updateGradientPreview);

function updateGradientPreview() {
    const color1 = document.getElementById('gradientColor1').value;
    const color2 = document.getElementById('gradientColor2').value;
    const direction = document.getElementById('gradientDirection').value;
    const gradient = `linear-gradient(${direction}, ${color1}, ${color2})`;
    document.getElementById('gradientPreview').style.background = gradient;
}

function shareScene() {
    const sceneData = encodeURIComponent(JSON.stringify(scene));
    const url = window.location.href.split('?')[0] + '?scene=' + sceneData;
    const shareUrlInput = document.getElementById('shareUrl');
    shareUrlInput.value = url;
    document.getElementById('shareDialog').showModal();
    shareUrlInput.select();
}

function copyShareUrl() {
    const shareUrlInput = document.getElementById('shareUrl');
    shareUrlInput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}

function exportToPNG() {
    html2canvas(document.getElementById('scene')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'emoji-scene.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function saveScene() {
    const sceneName = prompt("Enter a name for this scene:");
    if (sceneName) {
        const sceneData = {
            name: sceneName,
            elements: scene,
            background: document.getElementById('scene').style.background
        };
        let savedScenes = JSON.parse(localStorage.getItem('savedScenes') || '[]');
        savedScenes.push(sceneData);
        localStorage.setItem('savedScenes', JSON.stringify(savedScenes));
        alert('Scene saved successfully!');
    }
}

function openLoadDialog() {
    const savedScenes = JSON.parse(localStorage.getItem('savedScenes') || '[]');
    const select = document.getElementById('savedScenes');
    select.innerHTML = '';
    savedScenes.forEach((scene, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = scene.name;
        select.appendChild(option);
    });
    document.getElementById('loadDialog').showModal();
}

function loadSelectedScene() {
    const select = document.getElementById('savedScenes');
    const savedScenes = JSON.parse(localStorage.getItem('savedScenes') || '[]');
    const selectedScene = savedScenes[select.value];
    if (selectedScene) {
        scene = selectedScene.elements;
        document.getElementById('scene').style.background = selectedScene.background;
        document.getElementById('scene').innerHTML = '';
        scene.forEach(item => {
            const element = document.createElement('div');
            element.className = item.type === 'emoji' ? 'emoji' : 'speech-bubble';
            element.textContent = item.content;
            element.style.left = item.x;
            element.style.top = item.y;
            if (item.type === 'emoji') {
                element.style.fontSize = item.size;
            }
            document.getElementById('scene').appendChild(element);
            makeDraggable(element);
            element.addEventListener('click', (e) => selectElement(e, element));
        });
        document.getElementById('loadDialog').close();
    }
}

function loadScene() {
    const urlParams = new URLSearchParams(window.location.search);
    const sceneData = urlParams.get('scene');
    if (sceneData) {
        scene = JSON.parse(decodeURIComponent(sceneData));
        scene.forEach(item => {
            const element = document.createElement('div');
            element.className = item.type === 'emoji' ? 'emoji' : 'speech-bubble';
            element.textContent = item.content;
            element.style.left = item.x;
            element.style.top = item.y;
            if (item.type === 'emoji') {
                element.style.fontSize = item.size;
            }
            document.getElementById('scene').appendChild(element);
            makeDraggable(element);
            element.addEventListener('click', (e) => selectElement(e, element));
        });
    }
}

function createBackgroundCanvas() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const emojis = ['😀', '😎', '🚀', '🌈', '🍕', '🎉', '🦄', '🍦', '🌸', '🐱'];
    const gridSize = 100;
    ctx.font = '40px Arial';

    ctx.save();
    ctx.transform(1, 0, Math.tan(35 * Math.PI / 180), 1, 0, 0);

    const offsetX = -canvas.width * 0.2;
    const offsetY = -canvas.height * 0.2;

    for (let x = offsetX; x < canvas.width + gridSize; x += gridSize) {
        for (let y = offsetY; y < canvas.height + gridSize; y += gridSize) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
            ctx.fillText(emoji, x, y);
        }
    }

    ctx.restore();
}

function updateCanvasDimensions() {
    const dimensions = document.getElementById('canvasDimensions').value.split('x');
    const width = parseInt(dimensions[0]);
    const height = parseInt(dimensions[1]);
    const scene = document.getElementById('scene');
    scene.style.width = width + 'px';
    scene.style.height = height + 'px';
}

function toggleCredits() {
    const app = document.getElementById('app');
    app.classList.toggle('flipped');
}

window.onload = function() {
    loadScene();
    createBackgroundCanvas();
    updateCanvasDimensions();
};

window.addEventListener('resize', createBackgroundCanvas);

document.addEventListener('keydown', (e) => {
    if (selectedElement && selectedElement.classList.contains('emoji')) {
        if (e.key === '+' || e.key === '=') {
            increaseSize();
        } else if (e.key === '-' || e.key === '_') {
            decreaseSize();
        }
    }
});