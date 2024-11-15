const dropArea = document.getElementById('drop-area');
const saveButton = document.getElementById('save-button');
const addTextButton = document.getElementById('add-text');
const circleTextButton = document.getElementById('add-circle');
const reverseCircleTextButton = document.getElementById('add-reverse-circle');
const fileInput = document.getElementById('fileInput');
const slider = document.getElementById('opacity-slider');
const colorInput = document.createElement('input')
const inputContainer = document.querySelector(".inputContainer")
const inputContainer2 = document.querySelector(".inputContainer2")
const Rotatedropdown = document.querySelector('.Rotatedropdown')
const Sizedropdown = document.querySelector('.Sizedropdown')
const textalign = document.querySelector('.textalign')
const createFont = document.querySelector('.createFont')
const Spacingdropdown =document.querySelector('.Spacingdropdown')
let isZindex = false;
colorInput.type = 'color'
colorInput.id = 'colorInput'
let selectedElement = null;
let offsetX = 0;
let offsetY = 0;
let draggedImage = null;
let itemCounter = 0;
let isResizing = false;
let history = [];
let redoStack = [];
let elements = [];
let selectionRectangle = null;
let startX, startY;
let isDragging = false;
let isSelected = false;
const union = document.querySelector('.union')
const folderInput1 = document.getElementById('filebg');
const folderInput2 = document.getElementById('filebadge');
const startButton = document.getElementById('startButton');
const svgs = document.querySelectorAll("section > svg")
const svgPath = document.querySelector('#svgImages path');
function showResizers(element) {
    const resizerClasses = [
        '.resizerRB','.resizerLB', '.resizerLT', '.resizerRT', 
        '.z-index-controls'
    ];

    resizerClasses.forEach(className => {
        const resizer = element.querySelector(className);
        if (resizer) {
            resizer.style.display = className === '.z-index-controls' ? 'flex' : 'block';
        }
    });
    
	if(!isSelected){
	element.style.top = `${element.offsetTop - 1}px`;
	element.style.left = `${element.offsetLeft - 1}px`;
	isSelected = true;
	}

    element.style.border = "1px solid";
    element.classList.add('selected');
}
svgs.forEach(svg => {
    svg.style.margin = '5px'
    svg.removeAttribute('class')
    svg.removeAttribute('id')
    svg.style.opacity ="1"
    svg.id = 'svgImages'
    svg.classList.add('draggable');

});

function blindResizers(element) {
    const resizerClasses = [
        '.resizerRB', '.resizerLB', '.resizerLT', '.resizerRT', 
        '.z-index-controls'
    ];

    resizerClasses.forEach(className => {
        const resizer = element.querySelector(className);
        if (resizer) {
            resizer.style.display = 'none';
        }
    });
    if(isSelected){
		element.style.top = `${element.offsetTop + 1}px`;
		element.style.left = `${element.offsetLeft + 1}px`;
	isSelected = false;
    }


    element.style.border = "none";
    element.classList.remove('selected');
}

function isElementInRect(element, rect) {
    const elRect = element.getBoundingClientRect();
    return !(
      elRect.right < rect.left ||
      elRect.left > rect.right ||
      elRect.bottom < rect.top ||
      elRect.top > rect.bottom
    );
  }
  
  function deselectAll() {
    elements.forEach((element) => blindResizers(element));
  }
  
  let isDraggingElement = false;
  dropArea.addEventListener("mousedown", (e) => {
    if (isResizing || isDraggingElement) return;
    
    if (e.target.classList.contains("element") || e.target.closest(".element")) {
      isDraggingElement = true;
    } else {
      isDragging = true;
      const dropAreaRect = dropArea.getBoundingClientRect();
      startX = e.clientX - dropAreaRect.left;
      startY = e.clientY - dropAreaRect.top;
      
      selectionRectangle = document.createElement("div");
      selectionRectangle.classList.add("selection-rectangle");
      selectionRectangle.style.width = `0px`;
      selectionRectangle.style.height = `0px`;
      selectionRectangle.style.transform = `translate(${startX}px, ${startY}px)`;
      dropArea.appendChild(selectionRectangle);
    }
  });
  
  dropArea.addEventListener("mousemove", (e) => {
    if (!isDragging || isDraggingElement) return;
  
    const dropAreaRect = dropArea.getBoundingClientRect();
    const currentX = e.clientX - dropAreaRect.left;
    const currentY = e.clientY - dropAreaRect.top;
  
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);
  
    selectionRectangle.style.width = `${width}px`;
    selectionRectangle.style.height = `${height}px`;
    selectionRectangle.style.transform = `translate(${left}px, ${top}px)`;
  });
  
  function endDrag() {
    if (!isDragging) return;
  
    isDragging = false;
    const rect = selectionRectangle.getBoundingClientRect();
    const minDragBoxSize = 1;
    let selectedElements = [];
  
    if (rect.width > minDragBoxSize && rect.height > minDragBoxSize) {
      selectedElements = elements.filter((element) => isElementInRect(element, rect));
  
      if (selectedElements.length > 0) {
        groupSelectedElements(selectedElements);
      }
    }
  
    if (selectionRectangle) {
      selectionRectangle.remove();
      selectionRectangle = null;
    }
  
    isDraggingElement = false;
  }
  
  document.addEventListener("mouseup", endDrag);
  dropArea.addEventListener("focusout", endDrag);
  dropArea.addEventListener("error", endDrag);
  
  
  
  
  function calculateBoundingBox(selectedElements) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    selectedElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });
  
    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  function groupSelectedElements(selectedElements) {
    if (selectedElements.length >= 2 && !dropArea.querySelector('.group-container')) {
      const boundingBox = calculateBoundingBox(selectedElements);
      const dropAreaRect = dropArea.getBoundingClientRect();
  
      const groupDiv = document.createElement('div');
      addResizers(groupDiv);
      groupDiv.classList.add('group-container');
      groupDiv.style.border = "1px solid";
      groupDiv.style.position = 'absolute';
      groupDiv.style.left = `${boundingBox.left - dropAreaRect.left}px`;
      groupDiv.style.top = `${boundingBox.top - dropAreaRect.top}px`;
      groupDiv.style.width = `${boundingBox.width}px`;
      groupDiv.style.height = `${boundingBox.height}px`;
  
      selectedElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        const offsetX = elementRect.left - boundingBox.left;
        const offsetY = elementRect.top - boundingBox.top;
  
        element.dataset.initialWidth = elementRect.width - 1;
        element.dataset.initialHeight = elementRect.height - 1;
        element.dataset.initialLeft = offsetX;
        element.dataset.initialTop = offsetY;
  
        element.style.position = 'absolute';
        element.style.border = "1px solid";
        element.style.left = `${offsetX}px`;
        element.style.top = `${offsetY}px`;
  
        element.style.pointerEvents = 'none';
  
        groupDiv.appendChild(element);
      });
  
      groupDiv.tabIndex = 0;
      makeElementDraggable(groupDiv);
      groupDiv.addEventListener('focus', (e) => {
        toggleSelectedElement(groupDiv, e);
      });
      dropArea.appendChild(groupDiv);
  
      groupDiv.focus();
  
      const resizeObserver = new ResizeObserver(() => {
        const groupRect = groupDiv.getBoundingClientRect();
  
        selectedElements.forEach((element) => {
          const initialWidth = parseFloat(element.dataset.initialWidth);
          const initialHeight = parseFloat(element.dataset.initialHeight);
          const initialLeft = parseFloat(element.dataset.initialLeft);
          const initialTop = parseFloat(element.dataset.initialTop);
  
          const widthRatio = groupRect.width / boundingBox.width;
          const heightRatio = groupRect.height / boundingBox.height;
  
          element.style.width = `${initialWidth * widthRatio}px`;
          element.style.height = `${initialHeight * heightRatio}px`;
          element.style.left = `${initialLeft * widthRatio}px`;
          element.style.top = `${initialTop * heightRatio}px`;
        });
      });
  
      resizeObserver.observe(groupDiv);
  
      groupDiv.addEventListener('focusout', () => {
          if(!isZindex){
              resizeObserver.unobserve(groupDiv);
  
              const groupLeft = parseFloat(groupDiv.style.left);
              const groupTop = parseFloat(groupDiv.style.top);
  
              const children = Array.from(groupDiv.children);
              children.forEach((child) => {
                if (child.classList.contains('resizable')) {
                  const computedStyle = window.getComputedStyle(child);
                  const childWidth = computedStyle.width;
                  const childHeight = computedStyle.height;
  
                  const offsetX = groupLeft + parseFloat(child.style.left);
                  const offsetY = groupTop + parseFloat(child.style.top);
  
                  child.style.width = childWidth;
                  child.style.height = childHeight;
                  child.style.left = `${offsetX}px`;
                  child.style.top = `${offsetY}px`;
                  child.style.border = "none";
                  child.style.pointerEvents = '';
  
                  dropArea.insertBefore(child, groupDiv);
                }
              });
  
              groupDiv.remove();
          }
      });
    }
  }
  
  
const horizontalLine = document.getElementById("horizontal-line");
const verticalLine = document.getElementById("vertical-line");




function makeElementDraggable(element) {
    
    element.addEventListener("mousedown", (e) => {
        if (isResizing) return;

        isDraggingElement = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        function onMouseMove(e) {
            if (isDraggingElement) {
                const containerRect = dropArea.getBoundingClientRect();
                let x = e.clientX - containerRect.left - offsetX;
                let y = e.clientY - containerRect.top - offsetY;
                if (x < 0) x = 0;
                if (x + element.offsetWidth > containerRect.width) {
                    x = containerRect.width - element.offsetWidth;
                }
                if (y < 0) y = 0;
                if (y + element.offsetHeight > containerRect.height) {
                    y = containerRect.height - element.offsetHeight;
                }

                element.style.left = x + "px";
                element.style.top = y + "px";

                checkIfCentered(element);
            }
        }

        function onMouseUp() {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            isDraggingElement = false;
            horizontalLine.style.display = "none"; 
            verticalLine.style.display = "none";
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    });
}

function checkIfCentered(element) {
    const container = dropArea;
    const containerCenterX = container.clientWidth / 2;
    const containerCenterY = container.clientHeight / 2;
    const elementCenterX = element.offsetLeft + element.offsetWidth / 2;
    const elementCenterY = element.offsetTop + element.offsetHeight / 2;

    const tolerance = 3; 
    if (Math.abs(elementCenterY - containerCenterY) < tolerance) {
        horizontalLine.style.display = "block"; 
    } else {
        horizontalLine.style.display = "none"; 
    }

    if (Math.abs(elementCenterX - containerCenterX) < tolerance) {
        verticalLine.style.display = "block"; 
    } else {
        verticalLine.style.display = "none"; 
    }
}
function saveState() {
    const elementsState = [];
    
    const allElements = document.querySelectorAll('.resizable');
    allElements.forEach(el => {
        const Svgcontainer = document.createElement("div")
        const rect = el.getBoundingClientRect();
        const contentElement = el.firstElementChild;
        const isTextBox = el.classList.contains('text-box');
        const isCircleText = el.classList.contains('circle-text');
		const isReverseCircle = el.classList.contains('reverse');	
        const isSvg =  new XMLSerializer().serializeToString(contentElement);
		const isLeft = el.classList.contains('left');
		const isCenter = el.classList.contains('center');
		const isRight = el.classList.contains('right');
		const isSelected = el.classList.contains('selected');
        Svgcontainer.innerHTML = isSvg
        let childColor = window.getComputedStyle(contentElement).color;
		let childFill = el.querySelector('textPath')?.getAttribute('fill');
        let childOpacity = window.getComputedStyle(contentElement).opacity;

        let state = {
            id: el.id,
            width: rect.width,
            height: rect.height,
            top: rect.top - dropArea.getBoundingClientRect().top - 3,
            left: rect.left - dropArea.getBoundingClientRect().left - 3,
            color: isCircleText? childFill : childColor,
            opacity: childOpacity,
			reverse: isReverseCircle? true : false,
			array: isLeft? 'left' : isCenter? 'center' : isRight? 'right' : null,
			selected: isSelected,
            type: isCircleText ? 'circleText' : isTextBox ? 'textbox' : 'image',
            fontSize: isTextBox ? window.getComputedStyle(contentElement).fontSize : null
        };
			state.innerHTML = Svgcontainer.firstChild;

        elementsState.push(state);
    });

    history.push(elementsState);
    redoStack = [];
}

function restoreState(state) {
    dropArea.innerHTML = '';

    state.forEach(item => {
        const newItem = document.createElement('div');
        newItem.classList.add('resizable');
        newItem.id = item.id;
        setElementDimensions(newItem, item);
        setPositionAndAlignment(newItem, item);

        if (item.type === 'textbox') {
            setupTextBox(newItem, item);
        } else if (item.type === 'circleText') {
            setupCircleText(newItem, item);
        } else if (item.type === 'image') {
            setupImage(newItem, item);
        }

        addResizers(newItem);
        makeElementDraggable(newItem);

        newItem.addEventListener('click', function(e) {
            toggleSelectedElement(newItem, e);
        });

        elements.push(newItem);
        dropArea.appendChild(newItem);
    });
}

function setElementDimensions(element, item) {
    element.style.width = `${item.selected ? item.width - 2 : item.width}px`;
    element.style.height = `${item.selected ? item.height - 2 : item.height}px`;
}

function setPositionAndAlignment(element, item) {
    element.style.top = `${item.top}px`;
    element.style.left = `${item.left}px`;
    element.style.position = 'absolute';
    if (item.array === 'left') {
        element.classList.add('left');
    } else if (item.array === 'center') {
        element.classList.add('center');
    } else if (item.array === 'right') {
        element.classList.add('right');
    }
}

function setupTextBox(element, item) {
    element.classList.add('text-box');
    const editableArea = item.innerHTML;
    editableArea.style.textAlign = item.array || 'center';
    element.appendChild(editableArea);
}

function setupCircleText(element, item) {
    element.classList.add('text-box', 'circle-text');
    element.style.borderRadius = '50%';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.tabIndex = 0;
    
    if (item.reverse) element.classList.add('reverse');
    
    const textPath = item.innerHTML.querySelector('textPath');
    addEditText(textPath, element);
    element.appendChild(item.innerHTML);
}

function setupImage(element, item) {
    const svg = item.innerHTML;
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.position = 'relative';
    element.tabIndex = 0;
    element.appendChild(svg);
}


svgs.forEach(element =>{
    element.addEventListener("click",()=>{
        const newSvg = new XMLSerializer().serializeToString(element);
        const createSvg = document.createElement('div');
		const testDiv = document.createElement('div');
        createSvg.innerHTML = newSvg;
        let newItem = createWrapper(100, 100);
		testDiv.style.width = '100%';
		testDiv.style.height = '100%';
        newItem.style.width = '100px';
        newItem.style.height = `100px`;
        createSvg.style.position ="absolute";
        createSvg.firstChild.style.margin ="0"
        createSvg.firstChild.style.width= "100%";
        createSvg.firstChild.style.height= "100%";
	  	testDiv.appendChild(createSvg.firstChild);
        newItem.appendChild(testDiv);
        addResizers(newItem);
            elements.push(newItem)
            dropArea.appendChild(newItem);
            newItem.addEventListener('focus', function(e) {
                toggleSelectedElement(newItem, e);
                
            });
            makeElementDraggable(newItem);
            newItem.id = `item-${itemCounter++}`;

			saveState();
    })
})

function createWrapper(width, height) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('resizable');
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.position = 'absolute';
    wrapper.style.top = '50px';
    wrapper.style.left = '50px';
    wrapper.tabIndex = 0;
    return wrapper;
}

function createImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('draggable');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = "relative";
    img.draggable = false;
    return img;
}

   function toggleSelectedElement(newElement) {
       selectedElement = newElement;
       
       

       if (dropArea.children) {
        updateButtonStates(selectedElement);
showResizers(selectedElement);

        const isText = selectedElement.classList.contains('text-box');
		   const isCircleText = selectedElement.classList.contains('circle-text');
		   const isReverse = selectedElement.classList.contains('reverse');
		   const inputContainer = document.querySelector(".inputContainer");
		   const svg = selectedElement.querySelector('svg');
		   const path = selectedElement.querySelector('path');


           document.addEventListener("keydown", function(event) {
            let step = 10;
        
            if (event.key === "Delete") {
                inputContainer.innerHTML = '';
                createFont.style.display = 'none';
                Rotatedropdown.style.display = 'none';
                Sizedropdown.style.display = 'none';
                textalign.style.display = 'none';
                Spacingdropdown.style.display = 'none';
                selectedElement.replaceChildren();
                selectedElement.remove();
            } else {
                let movement = event.ctrlKey ? step : 1; 
        
                switch (event.key) {
                    case 'ArrowUp':
                        selectedElement.style.top = (selectedElement.offsetTop - movement) + 'px';
                        break;
                    case 'ArrowDown':
                        selectedElement.style.top = (selectedElement.offsetTop + movement) + 'px';
                        break;
                    case 'ArrowLeft':
                        selectedElement.style.left = (selectedElement.offsetLeft - movement) + 'px';
                        break;
                    case 'ArrowRight':
                        selectedElement.style.left = (selectedElement.offsetLeft + movement) + 'px';
                        break;
                }
            }
        });
        
           
		   if (isText) {
            textalign.innerHTML=''
            createFont.innerHTML=''
            Sizedropdown.style.display='inline-block'
            createFont.style.display='block'
            textalign.style.display='block'
		       const alignments = ['left', 'center', 'right'];
               const alignIcons = [
                '/rmimg/align-left-solid.svg',   
                '/rmimg/align-center-solid.svg', 
                '/rmimg/align-right-solid.svg'   
            ];
		       alignments.forEach((alignment,index) => {
		           const button = document.createElement('button');
                   button.style.backgroundColor = 'white'
                   button.style.margin='5px'
                   button.style.border = "none"
                   button.style.borderRadius="3px"
                   button.style.width ='30px'
                   button.style.height='30px'
                   const Alignicon = document.createElement('img')
                   Alignicon.src = alignIcons[index];
		           button.appendChild(Alignicon)

		           button.disabled = selectedElement.firstChild.style.textAlign === alignment;

		           button.addEventListener('click', () => {
		               selectedElement.classList.remove('left', 'center', 'right');
		               selectedElement.classList.add(alignment);
					   if (isCircleText) {
					       if (alignment === 'left') {
					           if (isReverse) {
					               svg.setAttribute("viewBox", "37 37 225 225");
					               path.setAttribute("d", "M 150, 150 m 100, 0 a 100,100 0 1,0 -200,0 a 100,100 0 1,0 200,0");
					           } else {
					               svg.setAttribute("viewBox", "-185 15 270 270");
					               path.setAttribute("d", "M 150, 150 m -100, 0 a 100,100 0 1,1 -200,0 a 100,100 0 1,1 200,0");
					           }
					       } else if (alignment === 'center') {
					           if (isReverse) {
									svg.setAttribute("viewBox", "37 137 225 225");
									path.setAttribute("d", "M 150, 150 m 0, 0 a 100,100 0 1,0 0,200 a 100,100 0 1,0 0,-200");
					           } else {
					               svg.setAttribute("viewBox", "-85 -85 270 270");
					               path.setAttribute("d", "M 150, 150 m -100, 0 a 100,100 0 1,1 0,-200 a 100,100 0 1,1 0,200");
					           }
					       } else if (alignment === 'right') {
					           if (isReverse) {
					               svg.setAttribute("viewBox", "37 37 225 225");
					               path.setAttribute("d", "M 150, 150 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0");
					           } else {
					               svg.setAttribute("viewBox", "15 15 270 270");
					               path.setAttribute("d", "M 150, 150 m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0");
					           }
					       }
					   } else {
					       selectedElement.querySelector('.editable-area').style.textAlign = alignment;
					   }
		               alignments.forEach(align => {
		                   const alignButton = inputContainer2.querySelector(`button:nth-child(${alignments.indexOf(align) + 1})`);
		                   alignButton.disabled = (align === alignment);
		               });
		           });
		           textalign.appendChild(button);
                   
		       });
            createFontSelector()
               
               const sizeSlider = document.querySelector('#sizeSlider')

const sizeInput = document.querySelector('#size')

function updateFontSizeValues() {
  const currentFontSize = parseInt(
    !isCircleText
      ? window.getComputedStyle(selectedElement.firstChild).fontSize
      : window.getComputedStyle(selectedElement.querySelector('svg')).fontSize,
    10
  );
  sizeSlider.value = currentFontSize;
  sizeInput.value = currentFontSize;
}
updateFontSizeValues();

sizeSlider.addEventListener("input", (e) => {
  const sizeValue = e.target.value;
  if (!isCircleText) {
    selectedElement.querySelector('.editable-area').style.fontSize = `${sizeValue}px`;
  } else {
    selectedElement.querySelector('svg').style.fontSize = `${sizeValue}px`;
  }
  sizeInput.value = sizeValue;
});

sizeInput.addEventListener("input", (e) => {
  let sizeValue = e.target.value;
  if (sizeValue < 3) sizeValue = 3;
  if (sizeValue > 200) sizeValue = 200;
  if (!isCircleText) {
    selectedElement.querySelector('.editable-area').style.fontSize = `${sizeValue}px`;
  } else {
    selectedElement.querySelector('svg').style.fontSize = `${sizeValue}px`;
  }
  sizeSlider.value = sizeValue;
});

AngleFunction()
spacingFunction()

            }

		  const currentOpacity = window.getComputedStyle(selectedElement.firstChild).opacity;
          slider.value = currentOpacity*100;
           slider.addEventListener('input', (e) => {
            const opacityValue = e.target.value / 100;

            selectedElement.firstChild.style.opacity = opacityValue;
       });
            
if(!isText){
    const svgElements = document.querySelectorAll('div > svg');
   createFont.style.display='none'
   Sizedropdown.style.display='none'
   textalign.style.display='none'
   Spacingdropdown.style.display='none'
    AngleFunction()

svgElements.forEach(svg => {
  svg.addEventListener('click',()=>{
    inputContainer.innerHTML ='';
    const paths = svg.querySelectorAll('path, polygon');

    const uniqueFillIds = Array.from(new Set(Array.from(paths).map(path => path.getAttribute('fill-id'))));

    uniqueFillIds.forEach(fillId => {
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.id = `color-${fillId}`;
      colorInput.classList.add('colordesign')
      const firstPath = svg.querySelector(`[fill-id='${fillId}']`);
      colorInput.value = firstPath.getAttribute("fill"); 
      colorInput.addEventListener("input", (event) => {
        const selectedColor = event.target.value;
        const pathsWithFillId = svg.querySelectorAll(`[fill-id='${fillId}']`);
        pathsWithFillId.forEach(path => {
          path.setAttribute("fill", selectedColor); 
          
        });
      });

     inputContainer.appendChild(colorInput);
    })
    });
  
});

}else{
    inputContainer.innerHTML=''
    inputContainer.appendChild(colorInput)

    colorInput.removeEventListener('input', colorInput.handleColorChange);
colorInput.handleColorChange = (e) => {
    const selectedColor = e.target.value;
    const isCircleText = selectedElement.classList.contains('circle-text');
    const circletargetElement = isCircleText 
        ? selectedElement.firstChild.querySelector("textPath") 
        : selectedElement.firstChild;

    if (isCircleText) {
        circletargetElement.setAttribute("fill", selectedColor);
    } else {
        circletargetElement.style.color = selectedColor;
    }
};
colorInput.addEventListener('input', colorInput.handleColorChange);

}
           selectedElement.focus();
           
       }
   }
   
   AngleFunction =() =>{
    Rotatedropdown.style.display ='inline-block'
    const angleSlider = document.querySelector('#angleSlider')
    const angleInput = document.querySelector('#angle')

    const currentAngle = window.getComputedStyle(selectedElement.firstChild).transform;
    const matrix = currentAngle.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ');
      const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
      const initialAngle = angle < 0 ? 360 + angle : angle;
      angleSlider.value = initialAngle;
      angleInput.value = initialAngle;
    }

    angleSlider.addEventListener("input", (e) => {
      const angleValue = e.target.value;
      selectedElement.firstChild.style.transform = `rotate(${angleValue}deg)`;
      angleInput.value = angleValue;
    });

    angleInput.addEventListener("input", (e) => {
      let angleValue = e.target.value;
      if (angleValue < 0) angleValue = 0;
      if (angleValue > 360) angleValue = 360;
      selectedElement.firstChild.style.transform = `rotate(${angleValue}deg)`;
      angleSlider.value = angleValue;
    });
   }

   spacingFunction = () => {
    Spacingdropdown.style.display='inline-block'
    const spacingSlider = document.querySelector('#spacingSlider')

    const spacingInput = document.querySelector("#spacingInput");
    
    const computedSpacing = window.getComputedStyle(selectedElement.querySelector('.spacing')).letterSpacing;
    const currentSpacing = parseFloat(computedSpacing) || 0;

    spacingSlider.value = currentSpacing;
    spacingInput.value = currentSpacing;

    spacingSlider.addEventListener("input", (e) => {
      const spacingValue = e.target.value;
      spacingInput.value = spacingValue;
      selectedElement.querySelector('.spacing').style.letterSpacing = `${spacingValue}px`;
    });

    spacingInput.addEventListener("input", (e) => {
      let spacingValue = e.target.value;
      if (spacingValue < -10) spacingValue = -10;
      if (spacingValue > 20) spacingValue = 20;
      spacingSlider.value = spacingValue;
      selectedElement.querySelector('.spacing').style.letterSpacing = `${spacingValue}px`;
    });

  }

  function createFontSelector() {
    const fonts = [
		{
		  name: 'Arial',
		  css: "@font-face { font-family: 'Arial'; font-weight: normal; font-style: normal; }"
		},
       {
         name: 'BagelFatOne-Regular',
         css: "@font-face { font-family: 'BagelFatOne-Regular'; src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_JAMO@1.0/BagelFatOne-Regular.woff2') format('woff2'); font-weight: normal; font-style: normal; }"
       },
	   {
		name: 'ChosunCentennial',
		css: "@font-face { font-family: 'ChosunCentennial'; src: url('https://gcore.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/ChosunCentennial.woff2') format('woff2'); font-weight: normal; font-style: normal;}"
	   },
	   {
		name: 'SF_IceLemon',
		css: "@font-face {font-family: 'SF_IceLemon';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2106@1.1/SF_IceLemon.woff') format('woff');    font-weight: normal;    font-style: normal;}"
	   },
	   {
		name: 'GowunDodum-Regular',
		css: "@font-face {    font-family: 'GowunDodum-Regular';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GowunDodum-Regular.woff') format('woff');    font-weight: normal;    font-style: normal;}"
	   },	{
		name: 'GowunBatang-Regular',
		css: "@font-face {    font-family: 'GowunBatang-Regular';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GowunBatang-Regular.woff') format('woff');    font-weight: normal;    font-style: normal;}"
		},
	   {
		name: 'SF_HambakSnow',
		css: "@font-face {    font-family: 'SF_HambakSnow';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2106@1.1/SF_HambakSnow.woff') format('woff');    font-weight: normal;    font-style: normal;}"
	   },
	   {
	   name: 'PyeongChangPeace-Bold',
	   css: "@font-face {    font-family: 'PyeongChangPeace-Bold';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/PyeongChangPeace-Bold.woff2') format('woff2');    font-weight: 700;    font-style: normal;}"
	   },
	   {
	   name: 'Pretendard-Regular',
	   css: "@font-face {    font-family: 'Pretendard-Regular';    src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');    font-weight: 400;    font-style: normal;}"
	   },
	   {
	   name: 'ChosunKg',
	   css: "@font-face {    font-family: 'ChosunKg';    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ChosunKg.woff') format('woff');    font-weight: normal;    font-style: normal;}"
	   },
     ];

    const styleElement = document.createElement('style');
    fonts.forEach(font => {
      styleElement.appendChild(document.createTextNode(font.css));
    });
    document.head.appendChild(styleElement);

    const fontSelect = document.createElement('select');
    fontSelect.classList.add('font-selector');

    fonts.forEach(font => {
      const option = document.createElement('option');
      option.value = font.name;
      option.textContent = font.name;
      option.style.fontFamily = font.name;
      fontSelect.appendChild(option);
    });

    let currentFont = window.getComputedStyle(selectedElement.querySelector('svg')).fontFamily;

       if (currentFont.includes(',')) {
         currentFont = currentFont.split(',')[0].replace(/['"]+/g, '').trim();
       }

       const matchingOption = Array.from(fontSelect.options).find(option => option.value === currentFont);
       if (matchingOption) {
         matchingOption.selected = true;
       } else {
         fontSelect.value = 'Arial';
       }

    
    fontSelect.addEventListener('change', (e) => {
      const selectedFont = e.target.value;
      if (selectedElement) {
        selectedElement.querySelector('svg').style.fontFamily = selectedFont;
      }
    });

    fontSelect.classList.add('fontselect')
    createFont.appendChild(fontSelect);
  }

   dropArea.addEventListener('focusout', function(e) {
       if (selectedElement) {
       
blindResizers(selectedElement);
       }
   });
	union.addEventListener('focusout', function(e) {
	       if (selectedElement) {
blindResizers(selectedElement);
	       }
	   });

   function positionElement(element, x, y) {
       element.style.left = `${x - dropArea.getBoundingClientRect().left}px`;
       element.style.top = `${y - dropArea.getBoundingClientRect().top}px`;
   }
   function addResizers(newItem) {
	['RB', 'LB', 'LT', 'RT'].forEach(type => {
	    newItem.appendChild(createResizer(type));
	});
    newItem.appendChild(createZIndexControls(newItem));
}
function createResizer(type) {
    const resizer = document.createElement('div');
    resizer.classList.add(`resizer${type}`);
    resizer.style.zIndex = 999;
    resizer.addEventListener('mousedown', function (e) {
        initResize(e, type);
    });
    return resizer;
}

function initResize(e, type) {
    e.preventDefault();
    const resizableElement = e.target.parentElement;
    const isTextBox = resizableElement.classList.contains('text-box');
    const isCircleText = resizableElement.classList.contains('circle-text');

    const startX = e.pageX;
    const startY = e.pageY;
    const startWidth = resizableElement.offsetWidth;
    const startHeight = resizableElement.offsetHeight;
    const startLeft = resizableElement.offsetLeft;
    const startTop = resizableElement.offsetTop;
    const aspectRatio = startWidth / startHeight;
    isResizing = true;

    window.addEventListener('mousemove', startResize);
    window.addEventListener('mouseup', stopResize);

    function startResize(e) {
        let newWidth, newHeight, newLeft, newTop;

        switch (type) {
			case 'RB':
				 newWidth = e.clientX - resizableElement.getBoundingClientRect().left;
				          newHeight = newWidth / aspectRatio;

				         if (newHeight > 0) {
				             if (isTextBox&&!isCircleText) {
								resizableElement.style.width = `${e.clientX - resizableElement.getBoundingClientRect().left}px`;
								resizableElement.style.height = `${e.clientY - resizableElement.getBoundingClientRect().top}px`;
				             } else {
								resizableElement.style.width = `${newWidth}px`;
								resizableElement.style.height = `${newHeight}px`;
							 }
				         }

			    break;
			case 'LB':
				 newWidth = startWidth - (e.clientX - startX);
				                 newLeft = startLeft + (e.clientX - startX);
				                 newHeight = newWidth / aspectRatio;

				                if (newWidth > 0 && newHeight > 0) {
				                    if (isTextBox&&!isCircleText) {
									resizableElement.style.width = `${newWidth}px`;
									resizableElement.style.height = `${startHeight + (e.clientY - startY)}px`;
									resizableElement.style.left = `${newLeft}px`;
				                    } else {
									resizableElement.style.width = `${newWidth}px`;
									resizableElement.style.height = `${newHeight}px`;
									resizableElement.style.left = `${newLeft}px`;						
								 }
				                }

			    break;
				case 'LT':
				const deltX = startX - e.pageX;
				const deltY = startY - e.pageY;
				    newWidth = startWidth + deltX;
				    newHeight = newWidth / aspectRatio;
				    newLeft = startLeft - deltX;
				    newTop = startTop - (newHeight - startHeight);

				    if (newWidth > 0 && newHeight > 0) {
				        if (isTextBox && !isCircleText) {
				            resizableElement.style.width = `${startWidth + deltX}px`;
				            resizableElement.style.height = `${startHeight + deltY}px`;
				            resizableElement.style.left = `${newLeft}px`;
				            resizableElement.style.top = `${startTop - ((startHeight + deltY) - startHeight)}px`;
				        } else {
				            resizableElement.style.width = `${newWidth}px`;
				            resizableElement.style.height = `${newHeight}px`;
				            resizableElement.style.left = `${newLeft}px`;
				            resizableElement.style.top = `${newTop}px`;
				        }
				    }

                break;

            case 'RT':
				const deltaX = e.clientX - startX;
							 const deltaY = e.clientY - startY;
				                 newWidth = startWidth + deltaX;
				                 newHeight = newWidth / aspectRatio;
				                 newTop = startTop + (startHeight - newHeight);

				                if (newWidth > 0 && newHeight > 0) {
				                    if (isTextBox&&!isCircleText) {
								resizableElement.style.width = `${newWidth}px`;
								resizableElement.style.height = `${startHeight - deltaY}px`;
								resizableElement.style.top = `${startTop + deltaY}px`;
				                    } else {
									resizableElement.style.width = `${newWidth}px`;
									resizableElement.style.height = `${newHeight}px`;
									resizableElement.style.top = `${newTop}px`;
								 }
				                }

                break;
            default:
                return;
        }
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', startResize);
        window.removeEventListener('mouseup', stopResize);
        saveState();
    }
}
         fileInput.setAttribute('multiple','multiple')
         fileInput.addEventListener('change', handleFileUpload);
         function handleFileUpload() {
            const files = fileInput.files; 
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = e => addUploadedImage(e.target.result);
                    
                    reader.readAsDataURL(file);
                } else {
                    alert('이미지 파일만 업로드할 수 있습니다.');
                }
            }
        }
      

   function addUploadedImage(src) {
        const div = document.createElement('div');
        const img = createImage(src);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = height / width;
        const newHeight = 100 * ratio;
        const wrapper = createWrapper(100, newHeight);

        div.appendChild(img);
	    wrapper.appendChild(div);
        
        addResizers(wrapper);
        elements.push(wrapper)
	    dropArea.appendChild(wrapper);
	    
	    wrapper.id = `item-${itemCounter++}`;
        makeElementDraggable(wrapper);
	    wrapper.style.left = '10px';
	    wrapper.style.top = '10px';

	    wrapper.addEventListener('click', function(e) {
	        toggleSelectedElement(wrapper, e);
	    });
        saveState()
	}

   function makeImageDraggable(img) {
       img.addEventListener('mousedown', function(e) {
           draggedImage = img;
           offsetX = e.clientX - img.getBoundingClientRect().left;
           offsetY = e.clientY - img.getBoundingClientRect().top;
       });

       document.addEventListener('mousemove', moveDraggedImage);
       document.addEventListener('mouseup', releaseDraggedImage);
   }

   function moveDraggedImage(e) {
       if (draggedImage) {
           positionElement(draggedImage, e.clientX - offsetX, e.clientY - offsetY);
       }
   }

   function releaseDraggedImage() {
       if (draggedImage) {
           draggedImage = null;
       }
   }
   function bringToFront(element) {
    const currentIndex = Array.from(dropArea.children).indexOf(element);
    if (currentIndex < dropArea.children.length - 1) {
        dropArea.insertBefore(dropArea.children[currentIndex + 1], element);
    }
    updateButtonStates(element);
    saveState();
}


function sendToBack(element) {
    const currentIndex = Array.from(dropArea.children).indexOf(element);
    if (currentIndex > 0) {
        dropArea.insertBefore(element, dropArea.children[currentIndex - 1]);
        showResizers(element);
        const contentEditableChild = element.querySelector('[contenteditable="true"]');
        if (contentEditableChild) {
            contentEditableChild.focus();
        } else {
            element.focus();
        }
		isZindex = false;
        updateButtonStates(element);
        saveState();
    }
}


function updateButtonStates(element) {
       const currentIndex = Array.from(dropArea.children).indexOf(element);
     const zIndexUp = element.querySelector('.z-index-up');
     const zIndexDown = element.querySelector('.z-index-down');

         if (currentIndex >= dropArea.children.length - 1) {
             zIndexUp.disabled = true;
             zIndexUp.style.pointerEvents = 'none';
         } else {
             zIndexUp.disabled = false;
             zIndexUp.style.pointerEvents = 'auto';
         }

         if (currentIndex <= 0) {
             zIndexDown.disabled = true;
             zIndexDown.style.pointerEvents = 'none';
         } else {
             zIndexDown.disabled = false;
             zIndexDown.style.pointerEvents = 'auto';
         }
     }


function createZIndexControls(element) {
    const up = document.createElement("img")
    up.src = "./rmimg/arrow-up-solid.svg"
    up.style.width = '20px';
    up.style.height = '20px';
    const down = document.createElement("img")
    down.src = "./rmimg/arrow-down-solid.svg"
    down.style.width = '20px';
    down.style.height = '20px';
    const trash = document.createElement("img")
    trash.src = "./rmimg/trash-solid.svg"
    trash.style.width = '20px';
    trash.style.height = '20px';
    const copy = document.createElement("img")
    copy.src = "./rmimg/copy-solid.svg"
    copy.style.width = '20px'
    copy.style.height = '20px';
    const zIndexControls = document.createElement('div');
    zIndexControls.classList.add('z-index-controls');
    zIndexControls.style.zIndex = 999;

    const zIndexUp = document.createElement('button');
    zIndexUp.classList.add('z-index-up');
    zIndexUp.append(up)
    zIndexUp.style.zIndex = 999;
    
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.append(trash)
    deleteButton.style.zIndex = 999;

    const zIndexDown = document.createElement('button');
    zIndexDown.classList.add('z-index-down');
    zIndexDown.append(down)
    zIndexDown.style.zIndex = 999;
   
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.append(copy)
    copyButton.style.zIndex = 999;


    zIndexUp.addEventListener('mousedown', function(e) {
        e.preventDefault()
        bringToFront(element);
        saveState();
    });


    zIndexDown.addEventListener('mousedown', function(e) {
        e.preventDefault();
		isZindex = true;
        sendToBack(element);
		element.focus();
        saveState();
    });
    
    

    deleteButton.addEventListener('mousedown', function(e) {
        e.preventDefault()
        inputContainer.innerHTML=''
        createFont.style.display='none'
        Rotatedropdown.style.display='none'
        Sizedropdown.style.display='none'
        textalign.style.display='none'
        Spacingdropdown.style.display='none'
        element.replaceChildren()
        element.remove()
    });

    
    copyButton.addEventListener('mousedown', function(e) {
	    e.preventDefault();
	    const resizableElements = Array.from(element.querySelectorAll('.resizable'));
	    if (resizableElements.length > 0) {
	        const elementStyle = window.getComputedStyle(element);
	        const elementLeft = parseFloat(elementStyle.left) || 0;
	        const elementTop = parseFloat(elementStyle.top) || 0;

	        resizableElements.forEach((resizableElement) => {
	            const resizableStyle = window.getComputedStyle(resizableElement);
	            const resizableLeft = parseFloat(resizableStyle.left) || 0;
	            const resizableTop = parseFloat(resizableStyle.top) || 0;

	            const newLeft = resizableLeft + elementLeft;
	            const newTop = resizableTop + elementTop;

	            const newElement = copyElement(resizableElement);
	            newElement.style.position = 'absolute';
	            newElement.style.left = `${newLeft + 20}px`;
	            newElement.style.top = `${newTop + 20}px`;

	            elements.push(newElement);
	            dropArea.appendChild(newElement);
	        });
	    } else {
	        const newElement = copyElement(element);
	        elements.push(newElement);
	        dropArea.appendChild(newElement);
	    }
	});
    zIndexControls.appendChild(zIndexUp);
    zIndexControls.appendChild(zIndexDown);
    zIndexControls.appendChild(deleteButton);
    zIndexControls.appendChild(copyButton);
    return zIndexControls;
}

function copyElement(element) {
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const isTextBox = element.classList.contains('text-box');
	const isCircleText = element.classList.contains('circle-text');
	const isReverseCircle = element.classList.contains('reverse');
	const isLeft = element.classList.contains('left');
	const isCenter = element.classList.contains('center');
	const isRight = element.classList.contains('right');

    const newItem = document.createElement('div');
    newItem.classList.add('resizable');
    newItem.style.position = 'absolute';
    
    newItem.style.width = `${width-2}px`;
    newItem.style.height = `${height-2}px`;
	    const svgElement = element.querySelector('div');

	        const svgContent = document.createElement("div");
	       const svgCopy = new XMLSerializer().serializeToString(svgElement);
	        svgContent.innerHTML = svgCopy;

	        newItem.appendChild(svgContent.firstChild);
	const currentLeft = element.offsetLeft;
	const currentTop = element.offsetTop;
	newItem.style.left = `${currentLeft + 20}px`;
	newItem.style.top = `${currentTop + 20}px`;
    addResizers(newItem);
	if (isCircleText) {
	newItem.classList.add('text-box', 'circle-text');
				newItem.style.position = 'absolute';
				newItem.style.borderRadius = '50%';
				newItem.style.display = 'flex';
				newItem.style.alignItems = 'center';
				newItem.style.justifyContent = 'center';
	    		newItem.classList.add('circle-text');
				newItem.tabIndex = 0;
				
				const path = newItem.querySelector('path');
				path.id = `circlePath-copy-${itemCounter}`;

				const textPath = newItem.querySelector('textPath');
				textPath.setAttribute('href', `#circlePath-copy-${itemCounter}`);
		if(isReverseCircle){
			newItem.classList.add('reverse');
		}
		if (isLeft) {
			newItem.classList.add('left');
		} else if (isCenter) {
			newItem.classList.add('center');
		} else if (isRight) {
			newItem.classList.add('right');
		}

	    addEditText(textPath, newItem);

    } else if (isTextBox&&!isCircleText) {
        newItem.classList.add('text-box');
        const editableArea = element.querySelector('.editable-area');

		if(isLeft){
			editableArea.style.textAlign = 'left';
			newItem.classList.add('left');
		} else if(isCenter){
			editableArea.style.textAlign = 'center';
			newItem.classList.add('center');
		} else if(isRight){
			editableArea.style.textAlign = 'right';
			newItem.classList.add('right');
		}

    } else {
		newItem.tabIndex = 0;
	}
	newItem.id = `item-${itemCounter++}`;
	makeElementDraggable(newItem);
	newItem.addEventListener('click', function(e) {
	    toggleSelectedElement(newItem, e);
	});
	
    saveState();
    return newItem;
}

function addEditText(textPath, newItem) {
    textPath.addEventListener('click', (e) => {
        e.stopPropagation();
        isResizing = true;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textPath.textContent;
        input.style.position = 'absolute';
        input.style.width = '170px';
        input.style.left = 'center';
        input.style.top = 'center';
        input.style.fontSize = '23px';
        input.style.textAlign = 'center';
        input.style.border = '2px solid #3498db';
        input.style.borderRadius = '8px';
        input.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
        input.style.backgroundColor = '#f9f9f9';
        input.style.color = '#333';
        input.style.outline = 'none';
        
        input.addEventListener('blur', () => {
            textPath.textContent = input.value || "Edit Text Here";
            newItem.removeChild(input);
            isResizing = false;
            saveState();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
                isResizing = false;
            }
        });

        newItem.appendChild(input);
        input.focus();
    });
}

addTextButton.addEventListener('click', () => {
    const textBox = document.createElement('div');
    textBox.classList.add('text-box', 'resizable', 'center');
    textBox.style.position = 'absolute';
    textBox.style.left = '10px';
    textBox.style.top = '10px';
    textBox.style.width = '150px';
    textBox.style.height = '25px';

    const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgContainer.setAttribute('width', '100%');
    svgContainer.setAttribute('height', '100%');
    svgContainer.style.position = 'absolute';
    svgContainer.style.top = '0';
    svgContainer.style.left = '0';

    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
	foreignObject.setAttribute('letter-spacing', 0);
	foreignObject.classList.add('spacing');

	const testDiv = document.createElement('div');
	testDiv.style.width = '100%';
	testDiv.style.height = '100%';
		
    const editableArea = document.createElement('div');
    editableArea.classList.add('editable-area');
    editableArea.contentEditable = 'true';
    editableArea.style.position = 'relative';
    editableArea.innerText = 'Edit Text';
    editableArea.style.fontSize = '20px';
    editableArea.style.border = 'none';
    editableArea.style.outline = 'none';
    editableArea.style.textAlign = 'center';
    editableArea.style.width = '100%';
    editableArea.style.height = '100%';
	editableArea.spellcheck = false;

    foreignObject.appendChild(editableArea);
    svgContainer.appendChild(foreignObject);
	testDiv.appendChild(svgContainer);
    textBox.appendChild(testDiv);
    
    addResizers(textBox);
    makeElementDraggable(textBox);
    textBox.id = `item-${itemCounter++}`;

    textBox.addEventListener('click', function(e) {
        toggleSelectedElement(textBox);
        e.stopPropagation();
    });

    elements.push(textBox);
    dropArea.appendChild(textBox);
    saveState();
});
function createCircleTextBox(isReverse = false) {
    const circleTextBox = document.createElement('div');
    circleTextBox.classList.add('text-box', 'resizable', 'circle-text', 'center');
    if (isReverse) circleTextBox.classList.add('reverse');
    circleTextBox.style.position = 'absolute';
    circleTextBox.style.left = '10px';
    circleTextBox.style.top = '10px';
    circleTextBox.style.width = '200px';
    circleTextBox.style.height = '200px';
    circleTextBox.style.borderRadius = '50%';
    circleTextBox.style.display = 'flex';
    circleTextBox.style.alignItems = 'center';
    circleTextBox.style.justifyContent = 'center';
    circleTextBox.tabIndex = 0;

    const testDiv = document.createElement('div');
    testDiv.style.width = '100%';
    testDiv.style.height = '100%';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", isReverse ? "37 137 225 225" : "-85 -85 270 270");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.fontSize = isReverse ? "30px" : "35px";
    svg.style.fontFamily = "Arial";
    svg.style.fontWeight = "400";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", `circlePath-${itemCounter}`);
    path.setAttribute("d", isReverse
        ? "M 150, 150 m 0, 0 a 100,100 0 1,0 0,200 a 100,100 0 1,0 0,-200"
        : "M 150, 150 m -100, 0 a 100,100 0 1,1 0,-200 a 100,100 0 1,1 0,200");
    path.setAttribute("stroke-dasharray", "5, 5");
    path.style.stroke = "#737373";
    defs.appendChild(path);
    svg.appendChild(defs);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("letter-spacing", "0");
    text.classList.add('spacing');

    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textPath.setAttribute("href", `#circlePath-${itemCounter}`);
    textPath.setAttribute("startOffset", "50%");
    textPath.textContent = "Edit Text Here";
    textPath.setAttribute("fill", "#000");

    text.appendChild(textPath);
    svg.appendChild(text);
    testDiv.appendChild(svg);
    circleTextBox.appendChild(testDiv);

    addEditText(textPath, circleTextBox);
    addResizers(circleTextBox);
    makeElementDraggable(circleTextBox);
    circleTextBox.id = `item-${itemCounter++}`;

    circleTextBox.addEventListener('click', function(e) {
        toggleSelectedElement(circleTextBox);
        e.stopPropagation();
    });

    elements.push(circleTextBox);
    dropArea.appendChild(circleTextBox);
    saveState();
}

circleTextButton.addEventListener('click', () => createCircleTextBox(false));
reverseCircleTextButton.addEventListener('click', () => createCircleTextBox(true));

    document.getElementById("removebtn").addEventListener('click', () => {
        inputContainer.innerHTML=''
        createFont.style.display='none'
        Rotatedropdown.style.display='none'
        Sizedropdown.style.display='none'
        textalign.style.display='none'
        Spacingdropdown.style.display='none'
        dropArea.replaceChildren();
        saveState();
    });
    
    saveButton.addEventListener('click', () => {
        const saveName = prompt("이미지의 이름을 정해주세요")
        if(saveName==null || saveName==""){
            return;
        }else{
            dropArea.style.border = "none"
       
            html2canvas(dropArea, { backgroundColor: null }).then(canvas => {
                const link = document.createElement('a');
                link.download = saveName+'.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                dropArea.style.border = "dashed #243642"
            });
        }
    });
document.addEventListener('keydown', (event) => {
        if(event.ctrlKey && event.key === 'y'){
            if (redoStack.length > 0) {
                const state = redoStack.pop();
                history.push(state); 
                restoreState(state); 
            } 
        }else if(event.ctrlKey && event.key === 'z'){
            if (history.length > 1) {
                redoStack.push(history.pop()); 
                restoreState(history[history.length - 1]);       
            }else{
                dropArea.innerHTML = ""
            }
        }
       
    });

    document.getElementById('undoBtn').addEventListener('click', () => {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            history.push(state); 
            restoreState(state); 
        }
    });
    document.getElementById('redoBtn').addEventListener('click', () => {
        if (history.length > 1) {
            redoStack.push(history.pop()); 
            restoreState(history[history.length - 1]); 

            
        }else{
            dropArea.innerHTML = ""
        }
        
    });

const folderInput = document.getElementById('folderInput');


folderInput.setAttribute('multiple','multiple')
   folderInput.addEventListener('change', handleFolderUpload);

   function handleFolderUpload() {
    const files = folderInput.files; 
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => addUploadedImage(e.target.result);     
            reader.readAsDataURL(file);
        } else {
            alert('이미지 파일만 업로드할 수 있습니다.');
        }
    }
}
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
openModalBtn.onclick = function() {
    union.innerHTML = ""
    modal.style.display = "block";
}

closeModalBtn.onclick = function() {
    modal.style.display = "none";
}

modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
// const QRInput = document.getElementById("QRFile");
// const QRContainer = document.getElementById("card-front");
// const card = document.querySelector('.card');
// const QRBack = document.getElementById("card-back")

// const QRmodal = document.getElementById("QRmodal");
// const QRopenModalBtn = document.getElementById("qrSave");
// const QRcloseModalBtn = document.getElementById("QRcloseModal");
// QRopenModalBtn.onclick = function() {
//     QRContainer.innerHTML =""
//     QRmodal.style.display = "block";
// }

// QRcloseModalBtn.onclick = function() {
//     QRContainer.style.border = "dashed 3px gray"
    
//     card.removeEventListener("click",rotateCard)
//     card.style.transform = "rotateY(0deg)"
//     QRmodal.style.display = "none";
// }

// QRmodal.onclick = function(event) {
//     if (event.target === QRmodal) {
//         QRContainer.style.border = "dashed 3px gray"
//         card.removeEventListener("click",rotateCard)
//         card.style.transform = "rotateY(0deg)"
//         QRmodal.style.display = "none";
//     }
// }

// window.onclick = function(event) {
//     if (event.target === QRmodal) {
// QRContainer.style.transform = "rotateY(0deg)"
//         card.removeEventListener("click",rotateCard)
//         QRContainer.style.border = "dashed 3px gray"
    
//         QRmodal.style.display = "none";
//     }
// }

   function unionMakeElementDraggable(element) {
    let offsetX = 0, offsetY = 0;

    element.addEventListener('mousedown', (e) => {
        if (isResizing) return;

        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        function onMouseMove(e) {

            element.style.left = (e.clientX - union.getBoundingClientRect().left - offsetX) + 'px';
            element.style.top = (e.clientY - union.getBoundingClientRect().top - offsetY) + 'px';
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            saveState();
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
}

folderInput1.addEventListener('change', handleFolder1Upload);
folderInput2.addEventListener('change', handleFolder2Upload);
startButton.addEventListener('click', startProcessing);

let folder1Files = [];
let folder2Files = [];

let width1 = 0;
let height1 = 0;
let top1 = 0;
let left1 = 0;
let width2 = 0;
let height2 = 0;
let top2 = 0;
let left2 = 0;

function handleFolder1Upload() {
    folder1Files = [...folderInput1.files].filter(file => file.type.startsWith('image/'));
    const backgroundReader = new FileReader();
    
    backgroundReader.onload = (e) => {
        const src = e.target.result;
        const img = createImage(src);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = height / width;
        const newHeight = 300 * ratio;
        const item = createWrapper(300, newHeight);
        item.id = 'folder1-item'; 
        item.appendChild(img);
        addResizers(item)
        union.appendChild(item);

        item.addEventListener('click', function(e) {
            toggleSelectedElement(item, e);
        });
        unionMakeElementDraggable(item);
    };
    backgroundReader.readAsDataURL(folder1Files[0]);

    checkStartButton();
}

function handleFolder2Upload() {
    folder2Files = [...folderInput2.files].filter(file => file.type.startsWith('image/'));
    const badgereader = new FileReader();

    badgereader.onload = (e) => {
        const src = e.target.result;
        const img = createImage(src);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = height / width;
        const newHeight = 200 * ratio;
        const item = createWrapper(200, newHeight);
        item.id = 'folder2-item';
        img.style.zIndex = "999";
        item.appendChild(img);
        addResizers(item)
        union.appendChild(item);

        item.addEventListener('click', function(e) {
            toggleSelectedElement(item, e);
        });
        unionMakeElementDraggable(item);
    };
    badgereader.readAsDataURL(folder2Files[0]);

    checkStartButton();
}

function checkStartButton() {
    if (folder1Files.length > 0 && folder2Files.length > 0) {
        startButton.disabled = false;
    } else {
        startButton.disabled = true;
    }
}
function startProcessing() {
    if (folder1Files.length > 0 && folder2Files.length > 0) {
        const folder1Item = union.querySelector(`#folder1-item`);
        if (folder1Item) {
            width1 = folder1Item.offsetWidth;
            height1 = folder1Item.offsetHeight;
            top1 = folder1Item.offsetTop;
            left1 = folder1Item.offsetLeft;
        }
        const folder2Item = union.querySelector(`#folder2-item`);
        if (folder2Item) {
            width2 = folder2Item.offsetWidth;
            height2 = folder2Item.offsetHeight;
            top2 = folder2Item.offsetTop;
            left2 = folder2Item.offsetLeft;
        }

        processImages(); 
    }
}

function processImages() {
    let currentWrapper1 = null;

    function processFolder2Images(index1) {
        const file1 = folder1Files[index1];
        const reader1 = new FileReader();
        reader1.onload = (e1) => {
            const img1Src = e1.target.result;
            currentWrapper1 = createWrapper(678, 100);
            const img1 = createImage(img1Src);
            currentWrapper1.style.left =(left1*1.614)+'px';
            currentWrapper1.style.top = (top1*1.614)+'px';
            currentWrapper1.style.width = (width1*1.614)+'px';
            currentWrapper1.style.height = (height1*1.614)+'px';
            img1.style.width = '100%';
            img1.style.height = '100%';
            currentWrapper1.appendChild(img1);
            dropArea.innerHTML=''
            dropArea.appendChild(currentWrapper1);

            function processSingleImage(index2) {
                if (index2 >= folder2Files.length) {
                    dropArea.removeChild(currentWrapper1);
                    if (index1 + 1 < folder1Files.length) {
                        processFolder2Images(index1 + 1);
                    }
                    return;
                }
                const file2 = folder2Files[index2];
                const reader2 = new FileReader();
                reader2.onload = (e2) => {
                    const img2Src = e2.target.result;
                    const wrapper2 = createWrapper(300, 100);
                    const img2 = createImage(img2Src);
                    wrapper2.style.left = (left2*1.614)+'px';
                    wrapper2.style.top = (top2*1.614)+'px';
					wrapper2.style.width = (width2*1.614)+'px';
					const aspectRatio = height2/width2;
					const height =  (width2*1.614)*aspectRatio;
					wrapper2.style.height = height+'px';
                    wrapper2.appendChild(img2);
                    dropArea.appendChild(wrapper2);
                    const fileName = `${file2.name.split('.')[0]}_${file1.name.split('.')[0]}.png`;
                    saveAndRemoveImages(fileName, wrapper2, () => {
                        processSingleImage(index2 + 1);
                    });
                };
                reader2.readAsDataURL(file2);
            }
            processSingleImage(0);
        };
        reader1.readAsDataURL(file1);
    }
    processFolder2Images(0);
}

function saveAndRemoveImages(fileName, wrapper2, callback) {
    dropArea.style.border = "none";
    html2canvas(dropArea, { backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        dropArea.style.border = "dashed #243642";
        dropArea.removeChild(wrapper2);
        if (callback) callback();
    });
    
}
let isImageAdded = false; 
// QRInput.addEventListener('change', function(event) {
    
//     const file = event.target.files[0];
    
//     if (file) {
//         console.log(file[0])
//         QRContainer.style.border = "none";
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const QRImage = document.createElement('img')
//             QRContainer.innerHTML = "";
//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.style.width = "400px";
//             img.style.height = "400px";
//             img.style.objectFit = "contain";
//             QRContainer.appendChild(img);
//             console.log(img.src)
//             console.log(window.btoa(img.src))
//             var ccc = window.btoa(img.src)
//             console.log(ccc)
//             var ccc2 = window.atob(ccc)
            
//             isImageAdded = true;
//             card.addEventListener('click', rotateCard);
//         }
//         reader.readAsDataURL(file);
//         console.log(file)
//     } else {
//         QRContainer.innerHTML = '이미지를 선택하세요';
        
//     }
   
// });
function rotateCard() {
    if (isImageAdded) {
        card.style.transform = card.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    }
}

const rotateDropdown = document.querySelector('.Rotatedropdown-content');
const sizeDropdown = document.querySelector('.Sizedropdown-content');
const spacingDropdown = document.querySelector('.Spacingdropdown-content');
const dropbtngDropdown = document.querySelector('.dropdown-content');

document.addEventListener('click', function(e) {
	if (!document.querySelector('.dropbtn').contains(e.target) && !rotateDropdown.contains(e.target)) {
    dropbtngDropdown.classList.remove('Rotateshow');
}
    if (!document.querySelector('.Rotatedropbtn').contains(e.target) && !rotateDropdown.contains(e.target)) {
        rotateDropdown.classList.remove('Rotateshow');
    }
    if (!document.querySelector('.Sizedropbtn').contains(e.target) && !sizeDropdown.contains(e.target)) {
        sizeDropdown.classList.remove('Sizeshow');
    }
    if (!document.querySelector('.Spacingdropbtn').contains(e.target) && !spacingDropdown.contains(e.target)) {
        spacingDropdown.classList.remove('Spacingshow');
    }
});

document.querySelector('.dropbtn').addEventListener('click', function() {
    dropbtngDropdown.classList.toggle('Rotateshow');
});

document.querySelector('.Rotatedropbtn').addEventListener('click', function() {
    rotateDropdown.classList.toggle('Rotateshow');
});

document.querySelector('.Sizedropbtn').addEventListener('click', function() {
    sizeDropdown.classList.toggle('Sizeshow');
});

document.querySelector('.Spacingdropbtn').addEventListener('click', function() {
    spacingDropdown.classList.toggle('Spacingshow');
});

const links = document.querySelectorAll('.sidebar ul li a');

links.forEach(link => {
    link.addEventListener('click', function() {
        links.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});
