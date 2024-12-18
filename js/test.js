const dropArea = document.getElementById('drop-area');
const saveButton = document.getElementById('save-button');
const addTextButton = document.getElementById('add-text');
const circleTextButton = document.getElementById('add-circle');
const reverseCircleTextButton = document.getElementById('add-reverse-circle');
const fileInput = document.getElementById('fileInput');
const slider = document.getElementById('opacity-slider');
const colorInput = document.getElementById("colorInput")
const inputContainer = document.querySelector(".inputContainer")
const inputContainer2 = document.querySelector(".inputContainer2")
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


const union = document.querySelector('.union')
const folderInput1 = document.getElementById('filebg');
const folderInput2 = document.getElementById('filebadge');
const startButton = document.getElementById('startButton');

const section1 = document.querySelector("#section1")
const section2 = document.querySelector("#section2")
const section3 = document.querySelector("#section3")
const section4 = document.querySelector("#section4")
const section5 = document.querySelector("#section5")
const svgs = document.querySelectorAll("section > svg")
const svgPath = document.querySelector('#svgImages path');
svgs.forEach(svg => {
    svg.removeAttribute('class')
    svg.removeAttribute('id')
    svg.style.opacity ="1"
    svg.id = 'svgImages'
    svg.classList.add('draggable');

});
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
    elements.forEach((element) => {
      const resizer = element.querySelector('.resizer');
      const resizerLB = element.querySelector('.resizerLB');
      const resizerLT = element.querySelector('.resizerLT');
      const resizerRT = element.querySelector('.resizerRT');
      const zIndexControls = element.querySelector('.z-index-controls');
  
      if (resizer) resizer.style.display = 'none';
      if (resizerLB) resizerLB.style.display = 'none';
      if (resizerLT) resizerLT.style.display = 'none';
      if (resizerRT) resizerRT.style.display = 'none';
      if (zIndexControls) zIndexControls.style.display = 'none';
      element.style.border = "none";
      element.classList.remove("selected");
    });
  }
  
  let isDraggingElement = false;
  
  
  dropArea.addEventListener("mousedown", (e) => {
    if (isResizing) return;
    if (e.target.classList.contains("element") || e.target.closest(".element")) {
      isDraggingElement = true;
    } else {
      isDragging = true;
      const dropAreaRect = dropArea.getBoundingClientRect();
      startX = e.clientX - dropAreaRect.left;
      startY = e.clientY - dropAreaRect.top;
      deselectAll();
  
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
    if (isDragging) {
        isDragging = false;
        const rect = selectionRectangle.getBoundingClientRect();
        const boxWidth = rect.width;
        const boxHeight = rect.height;
        let anySelected = false;

        deselectAll();

        // 드래그 박스의 크기가 일정 값 이상일 경우 다중 선택 처리
        const minDragBoxSize = 10; // 드래그 박스가 최소 크기 10 이상일 때 다중 선택으로 처리

        if (boxWidth > minDragBoxSize && boxHeight > minDragBoxSize) {
            // 드래그 박스로 인식: 겹쳐있는 모든 요소를 선택
            elements.forEach((element) => {
                const isInRect = isElementInRect(element, rect);
                if (isInRect) {
                    anySelected = true;

                    // 선택된 요소에 대해 표시할 스타일 설정
                    const resizer = element.querySelector('.resizer');
                    const resizerLB = element.querySelector('.resizerLB');
                    const resizerLT = element.querySelector('.resizerLT');
                    const resizerRT = element.querySelector('.resizerRT');
                    const zIndexControls = element.querySelector('.z-index-controls');

                    if (resizer) resizer.style.display = 'block';
                    if (resizerLB) resizerLB.style.display = 'block';
                    if (resizerLT) resizerLT.style.display = 'block';
                    if (resizerRT) resizerRT.style.display = 'block';
                    if (zIndexControls) zIndexControls.style.display = 'flex';

                    element.classList.add("selected");
                    element.style.border = "1px solid";
                }
            });
        } else {
            dropArea.removeChild(selectionRectangle)
            // 드래그 박스 크기가 작으면 toggleSelectedElement 함수로 처리
            
            toggleSelectedElement(rect);
        }

        // 드래그 박스 제거
        if (selectionRectangle) {
            selectionRectangle.style.display = 'none'; // 드래그 박스를 숨김
            dropArea.removeChild(selectionRectangle); // DOM에서 제거
            selectionRectangle = null; // 참조 초기화
        }

        // 선택된 요소가 없을 경우 선택 해제
        if (!anySelected) {
            deselectAll();
        }
    }
    isDraggingElement = false;
}



  function makeElementDraggable(element) {
    let offsetX = 0,
      offsetY = 0;
  
    element.addEventListener("mousedown", (e) => {
      if (isResizing) return;
  
      isDraggingElement = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
  
      function onMouseMove(e) {
        if (isDraggingElement) {
          element.style.left =
            e.clientX - dropArea.getBoundingClientRect().left - offsetX + "px";
          element.style.top =
            e.clientY - dropArea.getBoundingClientRect().top - offsetY + "px";
        }
      }
  
      function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        isDraggingElement = false;
        saveState();
      }
  
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  }
  
  dropArea.addEventListener("mouseup", endDrag);
  dropArea.addEventListener("mouseleave", endDrag);

  let groupContainer = null;

  function groupSelectedElements() {
    const selectedElements = elements.filter((element) => element.classList.contains("selected"));
    if (selectedElements.length === 0) return;
  
    const groupContainer = document.createElement("div");
    groupContainer.classList.add("group-container");
    groupContainer.style.position = "absolute";
  
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  
    // 선택된 각 요소의 위치와 크기를 계산하여 그룹 컨테이너 크기 조정
    selectedElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const offsetX = rect.left - dropArea.getBoundingClientRect().left;
      const offsetY = rect.top - dropArea.getBoundingClientRect().top;
  
      minX = Math.min(minX, offsetX);
      minY = Math.min(minY, offsetY);
      maxX = Math.max(maxX, offsetX + rect.width);
      maxY = Math.max(maxY, offsetY + rect.height);
    });
  
    // 그룹 컨테이너 위치와 크기 설정
    groupContainer.style.left = `${minX}px`;
    groupContainer.style.top = `${minY}px`;
    groupContainer.style.width = `${maxX - minX}px`;
    groupContainer.style.height = `${maxY - minY}px`;
  
    // 선택된 요소들을 그룹 컨테이너에 추가
    selectedElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const offsetX = rect.left - dropArea.getBoundingClientRect().left - minX;
      const offsetY = rect.top - dropArea.getBoundingClientRect().top - minY;
  
      element.style.position = "absolute";
      element.style.left = `${offsetX}px`;
      element.style.top = `${offsetY}px`;
        
      groupContainer.appendChild(element);
      
    });
   

  
    // 그룹 컨테이너를 dropArea에 추가
    dropArea.appendChild(groupContainer);
  
    // 그룹 컨테이너를 드래그 가능하게 만듦
    makeElementDraggable(groupContainer);
  }
  
  // CTRL + G 키 눌렀을 때 그룹화 기능 호출
  document.addEventListener("keydown", (e) => {
    if (e.key === "g" && e.ctrlKey) {
      groupSelectedElements();
    }
  });
  

// 초기 상태로 홈 섹션 보이기
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
		if(item.selected){
			newItem.style.width = `${item.width - 2}px`;
			newItem.style.height = `${item.height - 2}px`;
		} else {
			newItem.style.width = `${item.width}px`;
			newItem.style.height = `${item.height}px`;
		}
        newItem.style.top = `${item.top}px`;
        newItem.style.left = `${item.left}px`;
        newItem.style.position = 'absolute';

        if (item.type === 'textbox') {
            newItem.classList.add('text-box');

            const editableArea = item.innerHTML;
            newItem.appendChild(editableArea);
			if (item.array === 'left') {
				editableArea.style.textAlign = 'left';
				newItem.classList.add('left');
			} else if (item.array === 'center') {
				editableArea.style.textAlign = 'center';
				newItem.classList.add('center');
			} else if (item.array === 'right') {
				editableArea.style.textAlign = 'right';
				newItem.classList.add('right');
			}

		} else if (item.type === 'circleText') {
			newItem.classList.add('text-box', 'circle-text');
			newItem.style.position = 'absolute';
			newItem.style.borderRadius = '50%';
			newItem.style.display = 'flex';
			newItem.style.alignItems = 'center';
			newItem.style.justifyContent = 'center';
			newItem.tabIndex = 0;
			if(item.reverse){
				newItem.classList.add('reverse');
			}
			if (item.array === 'left') {
				newItem.classList.add('left');
			} else if (item.array === 'center') {
				newItem.classList.add('center');
			} else if (item.array === 'right') {
				newItem.classList.add('right');
			}
			const textPath = item.innerHTML.querySelector('textPath');
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

			    newItem.appendChild(item.innerHTML);
		}else if (item.type==='image'){
                const svg = item.innerHTML
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.position = "relative";
                newItem.tabIndex = 0;
                newItem.appendChild(svg);
            }


        newItem.appendChild(createResizer());
        newItem.appendChild(createResizerLB());
        newItem.appendChild(createResizerLT());
        newItem.appendChild(createResizerRT());
        newItem.appendChild(createZIndexControls(newItem));

        makeElementDraggable(newItem);


        newItem.addEventListener('click', function(e) {
            toggleSelectedElement(newItem, e);
        });
        dropArea.appendChild(newItem);
    });
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
        createSvg.firstChild.style.width= "100%";
        createSvg.firstChild.style.height= "100%";
	  	testDiv.appendChild(createSvg.firstChild);
        newItem.appendChild(testDiv);
            newItem.appendChild(createResizer());
            newItem.appendChild(createResizerLB());
            newItem.appendChild(createResizerLT());
            newItem.appendChild(createResizerRT());
            newItem.appendChild(createZIndexControls(newItem));
            elements.push(newItem)
            dropArea.appendChild(newItem);
            newItem.addEventListener('click', function(e) {
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
        console.log(dropArea.children.firstChild)
           const resizer = selectedElement.querySelector('.resizer');
           const resizerLB = selectedElement.querySelector('.resizerLB');
           const resizerLT = selectedElement.querySelector('.resizerLT');
           const resizerRT = selectedElement.querySelector('.resizerRT');
           const zIndexControls = selectedElement.querySelector('.z-index-controls');
           if (resizer) resizer.style.display = 'block';
           if (resizerLB) resizerLB.style.display = 'block';
           if (resizerLT) resizerLT.style.display = 'block';
           if (resizerRT) resizerRT.style.display = 'block';
           if (zIndexControls) zIndexControls.style.display = 'flex';
           selectedElement.style.border ="1px solid"
		   selectedElement.style.top = `${selectedElement.offsetTop - 1}px`;
		   selectedElement.style.left = `${selectedElement.offsetLeft - 1}px`;
           selectedElement.classList.add('selected');

        const isText = selectedElement.classList.contains('text-box');
		   const isCircleText = selectedElement.classList.contains('circle-text');
		   const isReverse = selectedElement.classList.contains('reverse');
		   const inputContainer = document.querySelector(".inputContainer");
		   const svg = selectedElement.querySelector('svg');
		   const path = selectedElement.querySelector('path');

           
		   if (isText) {
			inputContainer2.innerHTML = '';
		       const alignments = ['left', 'center', 'right'];
               const alignIcons = [
                '/rmimg/align-left-solid.svg',   
                '/rmimg/align-center-solid.svg', 
                '/rmimg/align-right-solid.svg'   
            ];
		       alignments.forEach((alignment,index) => {
                console.log(alignment)
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
                        console.log(alignment)
					       selectedElement.firstChild.style.textAlign = alignment;
					   }
		               alignments.forEach(align => {
		                   const alignButton = inputContainer2.querySelector(`button:nth-child(${alignments.indexOf(align) + 1})`);
		                   alignButton.disabled = (align === alignment);
		               });
		           });

		           inputContainer2.appendChild(button);
		       });
		   }

		  const currentOpacity = window.getComputedStyle(selectedElement.firstChild).opacity;
          slider.value = currentOpacity*100;
           slider.addEventListener('input', (e) => {
            const opacityValue = e.target.value / 100;

            selectedElement.firstChild.style.opacity = opacityValue;
       });

	   const angleSlider = document.createElement("input");
       angleSlider.classList.add('slider')
	   angleSlider.type = "range";
	   angleSlider.min = "0";
	   angleSlider.max = "360";
	   angleSlider.value = "0";

	   const angleInput = document.createElement("input");
       angleInput.classList.add("angle")
	   angleInput.type = "number";
	   angleInput.min = "0";
	   angleInput.max = "360";
	   angleInput.value = "0";
	   angleInput.style.marginLeft = "10px";

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

	   inputContainer2.appendChild(angleSlider);
	   inputContainer2.appendChild(angleInput);


            const svgElements = document.querySelectorAll('div > svg');


if(!isText){
svgElements.forEach(svg => {
  svg.addEventListener("click", () => {
    inputContainer.innerHTML ='';
    inputContainer2.innerHTML = '';
    const paths = svg.querySelectorAll('path, polygon');

    const uniqueFillIds = Array.from(new Set(Array.from(paths).map(path => path.getAttribute('fill-id'))));

    uniqueFillIds.forEach(fillId => {
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.id = `color-${fillId}`;
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
      
    });
  });
});
}else{

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

   dropArea.addEventListener('focusout', function(e) {
       if (selectedElement) {
       
           const resizer = selectedElement.querySelector('.resizer');
           const resizerLB = selectedElement.querySelector('.resizerLB');
           const resizerLT = selectedElement.querySelector('.resizerLT');
           const resizerRT = selectedElement.querySelector('.resizerRT');
           const zIndexControls = selectedElement.querySelector('.z-index-controls');
           if (resizer) resizer.style.display = 'none';
           if (resizerLB) resizerLB.style.display = 'none';
           if (resizerLT) resizerLT.style.display = 'none';
           if (resizerRT) resizerRT.style.display = 'none';
           if (zIndexControls) zIndexControls.style.display = 'none';
           selectedElement.style.border ="none"
		   selectedElement.style.top = `${selectedElement.offsetTop + 1}px`;
		   selectedElement.style.left = `${selectedElement.offsetLeft + 1}px`;
           selectedElement.classList.remove('selected');
       }
   });
	union.addEventListener('focusout', function(e) {
	       if (selectedElement) {
	           const resizer = selectedElement.querySelector('.resizer');
	           const resizerLB = selectedElement.querySelector('.resizerLB');
	           const resizerLT = selectedElement.querySelector('.resizerLT');
	           const resizerRT = selectedElement.querySelector('.resizerRT');
	           const zIndexControls = selectedElement.querySelector('.z-index-controls');
	           if (resizer) resizer.style.display = 'none';
	           if (resizerLB) resizerLB.style.display = 'none';
	           if (resizerLT) resizerLT.style.display = 'none';
	           if (resizerRT) resizerRT.style.display = 'none';
	           if (zIndexControls) zIndexControls.style.display = 'none';
	           selectedElement.style.border ="none"
		   selectedElement.style.top = `${selectedElement.offsetTop + 1}px`;
		   selectedElement.style.left = `${selectedElement.offsetLeft + 1}px`;
	           selectedElement.classList.remove('selected');
	       }
	   });

   function positionElement(element, x, y) {
       element.style.left = `${x - dropArea.getBoundingClientRect().left}px`;
       element.style.top = `${y - dropArea.getBoundingClientRect().top}px`;
   }

   function createResizer() {
    const resizer = document.createElement('div');
    resizer.classList.add('resizer');
    resizer.style.zIndex = 999;
    resizer.addEventListener('mousedown', function (e) {
        initResize(e, parent);
    });
    return resizer;
}

function initResize(e) {
     e.preventDefault();
     const resizableElement = e.target.parentElement;

     const isTextBox = resizableElement.classList.contains('text-box');
     const isCircleText = resizableElement.classList.contains('circle-text');
     let editableArea, originalFontSize, originalHeight;
     
     if (isTextBox&&!isCircleText) {
         editableArea = resizableElement.querySelector('.editable-area');
         if (!editableArea) return;
         originalFontSize = parseFloat(getComputedStyle(editableArea).fontSize);
         originalHeight = resizableElement.offsetHeight;
     }

     const startWidth = resizableElement.offsetWidth;
     const startHeight = resizableElement.offsetHeight;
     const aspectRatio = startWidth / startHeight;

     isResizing = true;
     window.addEventListener('mousemove', startResize);
     window.addEventListener('mouseup', stopResize);

     function startResize(e) {
         const newWidth = e.clientX - resizableElement.getBoundingClientRect().left;
         const newHeight = newWidth / aspectRatio;

         if (newHeight > 0) {
             resizableElement.style.width = `${newWidth}px`;
             resizableElement.style.height = `${newHeight}px`;
             if (isTextBox&&!isCircleText) {
                 const heightRatio = newHeight / originalHeight;
                 const newFontSize = originalFontSize * heightRatio;
                 editableArea.style.fontSize = `${newFontSize}px`;
             } 
         }
     }


    function stopResize() {
         isResizing = false;
        window.removeEventListener('mousemove', startResize);
        window.removeEventListener('mouseup', stopResize);
        saveState();
    }
}

        function createResizerLB() {
             const resizer = document.createElement('div');
             resizer.classList.add('resizerLB');
             resizer.style.zIndex = 999;
             resizer.addEventListener('mousedown', function (e) {
                 initResizeLB(e);
             });
             return resizer;
         }
        function initResizeLB(e) {
             e.preventDefault();
             const resizableElement = e.target.parentElement;
             const isTextBox = resizableElement.classList.contains('text-box');
             const isCircleText = resizableElement.classList.contains('circle-text');
             let editableArea, originalFontSize, originalHeight;

             if (isTextBox&&!isCircleText) {
                 editableArea = resizableElement.querySelector('.editable-area');
                 originalFontSize = parseFloat(getComputedStyle(editableArea).fontSize);
                 originalHeight = resizableElement.offsetHeight;
             }

             const startX = e.clientX;
             const startY = e.clientY;
             const startWidth = resizableElement.offsetWidth;
             const startLeft = resizableElement.offsetLeft;
             const startHeight = resizableElement.offsetHeight;
             const aspectRatio = startWidth / startHeight;
             isResizing = true;

             window.addEventListener('mousemove', startResize);
             window.addEventListener('mouseup', stopResize);

             function startResize(e) {
                 const newWidth = startWidth - (e.clientX - startX);
                 const newLeft = startLeft + (e.clientX - startX);
                 let newHeight = newWidth / aspectRatio;

                 if (newWidth > 0 && newHeight > 0) {
                     resizableElement.style.width = `${newWidth}px`;
                     resizableElement.style.height = `${newHeight}px`;
                     resizableElement.style.left = `${newLeft}px`;
                     if (isTextBox&&!isCircleText) {
                         const heightRatio = newHeight / originalHeight;
                         const newFontSize = originalFontSize * heightRatio;
                         editableArea.style.fontSize = `${newFontSize}px`;
                     }
                 }
             }

             function stopResize() {
                 isResizing = false;
                 window.removeEventListener('mousemove', startResize);
                 window.removeEventListener('mouseup', stopResize);
                 saveState()
             }
         }

         function createResizerLT() {
             const resizer = document.createElement('div');
             resizer.classList.add('resizerLT');
             resizer.style.zIndex = 999;
             resizer.addEventListener('mousedown', function (e) {
                 initResizeLT(e);
             });
             return resizer;
         }
         function initResizeLT(e) {
             e.preventDefault();
             const resizableElement = e.target.parentElement;
             const isTextBox = resizableElement.classList.contains('text-box');
             const isCircleText = resizableElement.classList.contains('circle-text');
             let editableArea, originalFontSize, originalHeight;

             if (isTextBox&&isCircleText) {
                 editableArea = resizableElement.querySelector('.editable-area');
                 originalFontSize = parseFloat(getComputedStyle(editableArea).fontSize);
                 originalHeight = resizableElement.offsetHeight;
             }

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
                 const deltaX = startX - e.pageX;
                 let newWidth = startWidth + deltaX;
                 let newHeight = newWidth / aspectRatio;
                 let newLeft = startLeft - deltaX;
                 let newTop = startTop - (newHeight - startHeight);

                 if (newWidth > 0 && newHeight > 0) {
                     resizableElement.style.width = `${newWidth}px`;
                     resizableElement.style.height = `${newHeight}px`;
                     resizableElement.style.left = `${newLeft}px`;
                     resizableElement.style.top = `${newTop}px`;
                     if (isTextBox&&!isCircleText) {
                         const heightRatio = newHeight / originalHeight;
                         const newFontSize = originalFontSize * heightRatio;
                         editableArea.style.fontSize = `${newFontSize}px`;
                     }
                 }
             }

             function stopResize() {
                 isResizing = false;
                 window.removeEventListener('mousemove', startResize);
                 window.removeEventListener('mouseup', stopResize);
				 saveState();
             }
         }


         function createResizerRT() {
             const resizer = document.createElement('div');
             resizer.classList.add('resizerRT');
             resizer.style.zIndex = 999;
             resizer.addEventListener('mousedown', function (e) {
                 initResizeRT(e);
             });
             return resizer;
         }

         function initResizeRT(e) {
             e.preventDefault();
             const resizableElement = e.target.parentElement;
             const isTextBox = resizableElement.classList.contains('text-box');
             const isCircleText = resizableElement.classList.contains('circle-text');
             let editableArea, originalFontSize, originalHeight;

             if (isTextBox&&!isCircleText) {
                 editableArea = resizableElement.querySelector('.editable-area');
                 originalFontSize = parseFloat(getComputedStyle(editableArea).fontSize);
                 originalHeight = resizableElement.offsetHeight;
             }

             const startX = e.pageX;
             const startY = e.pageY;
             const startWidth = resizableElement.offsetWidth;
             const startHeight = resizableElement.offsetHeight;
             const startTop = resizableElement.offsetTop;
             const aspectRatio = startWidth / startHeight;
             isResizing = true;

             window.addEventListener('mousemove', startResize);
             window.addEventListener('mouseup', stopResize);

             function startResize(e) {
                 const deltaX = e.clientX - startX;
                 let newWidth = startWidth + deltaX;
                 let newHeight = newWidth / aspectRatio;
                 let newTop = startTop + (startHeight - newHeight);

                 if (newWidth > 0 && newHeight > 0) {
                     resizableElement.style.width = `${newWidth}px`;
                     resizableElement.style.height = `${newHeight}px`;
                     resizableElement.style.top = `${newTop}px`;
                     if (isTextBox&&!isCircleText) {
                         const heightRatio = newHeight / originalHeight;
                         const newFontSize = originalFontSize * heightRatio;
                         editableArea.style.fontSize = `${newFontSize}px`;
                     }
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
            const files = fileInput.files; // 모든 파일 가져오기
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
	    const wrapper = createWrapper(100, 100);
	    const img = createImage(src);
	    wrapper.appendChild(img);
        wrapper.appendChild(createResizer());
        wrapper.appendChild(createResizerLB());
        wrapper.appendChild(createResizerLT());
        wrapper.appendChild(createResizerRT());
	    wrapper.appendChild(createZIndexControls(wrapper));
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
           console.log("1")
       }
   }
function bringToFront(element) {
    const currentIndex = Array.from(dropArea.children).indexOf(element);
    if (currentIndex < dropArea.children.length - 1) {
        dropArea.insertBefore(dropArea.children[currentIndex + 1], element);
    }
    saveState();
}

function sendToBack(element) {
    const currentIndex = Array.from(dropArea.children).indexOf(element);
    if (currentIndex > 0) {
            dropArea.insertBefore(element, dropArea.children[currentIndex - 1]);
			const resizer = selectedElement.querySelector('.resizer');
			const resizerLB = selectedElement.querySelector('.resizerLB');
			const resizerLT = selectedElement.querySelector('.resizerLT');
			const resizerRT = selectedElement.querySelector('.resizerRT');
			const zIndexControls = selectedElement.querySelector('.z-index-controls');
			if (resizer) resizer.style.display = 'block';
			if (resizerLB) resizerLB.style.display = 'block';
			if (resizerLT) resizerLT.style.display = 'block';
			if (resizerRT) resizerRT.style.display = 'block';
			if (zIndexControls) zIndexControls.style.display = 'flex';
			selectedElement.style.border ="1px solid"


			selectedElement.classList.add('selected');
			const contentEditableChild = element.querySelector('[contenteditable="true"]');
			if (contentEditableChild) {
			    contentEditableChild.focus();
			} else {
			    element.focus();
			}
            saveState();
    }
}


// function getMaxZIndex() {
//     const allElements = document.querySelectorAll('.resizable');
//     let maxZIndex = 0;
//     allElements.forEach(el => {
//         const firstChild = el.firstElementChild;
//         const zIndex = parseInt(window.getComputedStyle(firstChild).zIndex);
//         if (zIndex > maxZIndex) {
//             maxZIndex = zIndex;
//         }
//     });
//     return maxZIndex;
// }
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
    zIndexUp.classList.add('z-index-button');
    zIndexUp.append(up)
    zIndexUp.style.zIndex = 999;
    
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.append(trash)
    deleteButton.style.zIndex = 999;

    const zIndexDown = document.createElement('button');
    zIndexDown.classList.add('z-index-button');
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
        sendToBack(element);
		element.focus();
        saveState();
    });

    deleteButton.addEventListener('mousedown', function(e) {
        e.preventDefault()
        element.remove();
    });

    copyButton.addEventListener('mousedown', function(e) {
        e.preventDefault()
        const newElement = copyElement(element);
        
        dropArea.appendChild(newElement);
    });

    zIndexControls.appendChild(zIndexUp);
    zIndexControls.appendChild(zIndexDown);
    zIndexControls.appendChild(deleteButton);
    zIndexControls.appendChild(copyButton);
    // zIndexControls.appendChild(colorInput)

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
	newItem.appendChild(createResizer());
	newItem.appendChild(createResizerLB());
	newItem.appendChild(createResizerLT());
	newItem.appendChild(createResizerRT());
	newItem.appendChild(createZIndexControls(newItem));
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

	    textPath.addEventListener('click', (e) => {
	        e.stopPropagation();
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
	            }
	        });
	        newItem.appendChild(input);
	        input.focus();
	    });

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
addTextButton.addEventListener('click', () => {
    const textBox = document.createElement('div');
    textBox.classList.add('text-box', 'resizable', 'center');
    textBox.style.position = 'absolute';
    textBox.style.left = '10px';
    textBox.style.top = '10px';
    textBox.style.width = '150px';
    textBox.style.height = '25px';
    
    const editableArea = document.createElement('div');
    editableArea.classList.add('editable-area');
    editableArea.contentEditable = 'true';
    editableArea.style.position = 'relative';
    editableArea.innerText = 'Edit Text';
    editableArea.style.height = '100%';
    editableArea.style.fontSize = '20px';

    editableArea.style.border = 'none';
    editableArea.style.outline = 'none';
    editableArea.style.textAlign = 'center';
    editableArea.style.height = 'auto';
    editableArea.style.width = '100%';
    editableArea.style.height = '100%';
    
    
    textBox.appendChild(editableArea);
    textBox.appendChild(createResizer());
    textBox.appendChild(createResizerLB());
    textBox.appendChild(createResizerLT());
    textBox.appendChild(createResizerRT());
    
    makeElementDraggable(textBox);
    textBox.id = `item-${itemCounter++}`;

    textBox.addEventListener('click', function(e) {
        toggleSelectedElement(textBox);
        e.stopPropagation();
    });

    const zIndexControls = createZIndexControls(textBox);
    textBox.appendChild(zIndexControls);
    elements.push(textBox)
    dropArea.appendChild(textBox);
    saveState();
});

circleTextButton.addEventListener('click', () => {
    const circleTextBox = document.createElement('div');
    circleTextBox.classList.add('text-box', 'resizable', 'circle-text', 'center');
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
	svg.setAttribute("viewBox", "-85 -85 270 270");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.fontSize = "35px";
    svg.style.fontFamily = "Arial";
    svg.style.fontWeight = "400";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", `circlePath-${itemCounter}`);
	path.setAttribute("d", "M 150, 150 m -100, 0 a 100,100 0 1,1 0,-200 a 100,100 0 1,1 0,200");
    path.setAttribute("stroke-dasharray", "5, 5");
    path.style.stroke = "#737373";
    defs.appendChild(path);
    svg.appendChild(defs);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("letter-spacing", "0");

    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textPath.setAttribute("href", `#circlePath-${itemCounter}`);
    textPath.setAttribute("startOffset", "50%");
    textPath.textContent = "Edit Text Here";
	textPath.setAttribute("fill", "#000");

    text.appendChild(textPath);
    svg.appendChild(text);
	testDiv.appendChild(svg);
    circleTextBox.appendChild(testDiv);

    textPath.addEventListener('click', (e) => {
        e.stopPropagation();
		isResizing = true;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = textPath.textContent;
        input.style.position = 'absolute';
        input.style.width = '170px';
        input.style.left = '10px';
        input.style.top = '85px';
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
            circleTextBox.removeChild(input);
			isResizing = false;
            saveState();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });

        circleTextBox.appendChild(input);
        
        input.focus();
    });

    circleTextBox.appendChild(createResizer());
    circleTextBox.appendChild(createResizerLB());
    circleTextBox.appendChild(createResizerLT());
    circleTextBox.appendChild(createResizerRT());

    makeElementDraggable(circleTextBox);
    circleTextBox.id = `item-${itemCounter++}`;

    circleTextBox.addEventListener('click', function(e) {
        toggleSelectedElement(circleTextBox);
        e.stopPropagation();
    });

    const zIndexControls = createZIndexControls(circleTextBox);
    circleTextBox.appendChild(zIndexControls);
    elements.push(circleTextBox)
    dropArea.appendChild(circleTextBox);
    saveState();
});

reverseCircleTextButton.addEventListener('click', () => {
    const circleTextBox = document.createElement('div');
    circleTextBox.classList.add('text-box', 'resizable', 'circle-text', 'reverse', 'center');
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
	svg.setAttribute("viewBox", "37 137 225 225");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.style.fontSize = "30px";
	svg.style.fontFamily = "Arial";
	svg.style.fontWeight = "400";

	const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("id", `circlePath-${itemCounter}`);
	path.setAttribute("d", "M 150, 150 m 0, 0 a 100,100 0 1,0 0,200 a 100,100 0 1,0 0,-200");
	path.setAttribute("stroke-dasharray", "5, 5");
	path.style.stroke = "#737373";
	defs.appendChild(path);
	svg.appendChild(defs);

	const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.setAttribute("text-anchor", "middle");
	text.setAttribute("letter-spacing", "0");

	const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
	textPath.setAttribute("href", `#circlePath-${itemCounter}`);
	textPath.setAttribute("startOffset", "50%");
	textPath.textContent = "Edit Text Here";
	textPath.setAttribute("fill", "#000");

    text.appendChild(textPath);
    svg.appendChild(text);
	testDiv.appendChild(svg);
    circleTextBox.appendChild(testDiv);

    textPath.addEventListener('click', (e) => {
        e.stopPropagation();
		isResizing = true;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = textPath.textContent;
        input.style.position = 'absolute';
        input.style.width = '170px';
        input.style.left = '10px';
        input.style.top = '85px';
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
            circleTextBox.removeChild(input);
			isResizing = false;
            saveState();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });

        circleTextBox.appendChild(input);
        input.focus();
    });

    circleTextBox.appendChild(createResizer());
    circleTextBox.appendChild(createResizerLB());
    circleTextBox.appendChild(createResizerLT());
    circleTextBox.appendChild(createResizerRT());

    makeElementDraggable(circleTextBox);
    circleTextBox.id = `item-${itemCounter++}`;

    circleTextBox.addEventListener('click', function(e) {
        toggleSelectedElement(circleTextBox);
        e.stopPropagation();
    });

    const zIndexControls = createZIndexControls(circleTextBox);
    circleTextBox.appendChild(zIndexControls);
    dropArea.appendChild(circleTextBox);
    saveState();
});

    document.getElementById("removebtn").addEventListener('click', () => {dropArea.replaceChildren();
        saveState();

    });
    

    saveButton.addEventListener('click', () => {
        const saveName = prompt("이미지의 이름을 정해주세요")
        if(saveName==null){
            return;
        }else{
            dropArea.style.border = "none"
       
            html2canvas(dropArea, { backgroundColor: null }).then(canvas => {
                const link = document.createElement('a');
                // console.log(dropChild)
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
               console.log(state)
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
           console.log(state)
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

    
   

document.querySelectorAll('.sidebar a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault(); // 기본 링크 동작 방지

        const targetId = this.getAttribute('href'); // 클릭한 링크의 href 값 가져오기
        const targetElement = document.querySelector(targetId); // 해당 섹션 선택

        // 부드러운 스크롤 애니메이션
        targetElement.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const folderInput = document.getElementById('folderInput');


folderInput.setAttribute('multiple','multiple')
   folderInput.addEventListener('change', handleFolderUpload);

   function handleFolderUpload() {
    const files = folderInput.files; // 모든 파일 가져오기
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(11)
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => addUploadedImage(e.target.result);
            
            reader.readAsDataURL(file);
            console.log(reader)
        } else {
            alert('이미지 파일만 업로드할 수 있습니다.');
        }
    }
}
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");

// 모달 열기
openModalBtn.onclick = function() {
    union.innerHTML = ""
    modal.style.display = "block";
}

// 모달 닫기
closeModalBtn.onclick = function() {
    modal.style.display = "none";
}

// 배경 클릭 시 모달 닫기
modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// 페이지 로드 시 모달 닫기
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
const QRInput = document.getElementById("QRFile");
const QRContainer = document.getElementById("card-front");
const card = document.querySelector('.card');
const QRBack = document.getElementById("card-back")

const QRmodal = document.getElementById("QRmodal");
const QRopenModalBtn = document.getElementById("qrSave");
const QRcloseModalBtn = document.getElementById("QRcloseModal");

// 모달 열기
QRopenModalBtn.onclick = function() {
    QRContainer.innerHTML =""
    QRmodal.style.display = "block";
}

// 모달 닫기
QRcloseModalBtn.onclick = function() {
    QRContainer.style.border = "dashed 3px gray"
    
    card.removeEventListener("click",rotateCard)
    card.style.transform = "rotateY(0deg)"
    QRmodal.style.display = "none";
}

// 배경 클릭 시 모달 닫기
QRmodal.onclick = function(event) {
    if (event.target === QRmodal) {
        QRContainer.style.border = "dashed 3px gray"
    
        card.removeEventListener("click",rotateCard)
        card.style.transform = "rotateY(0deg)"
        QRmodal.style.display = "none";
    }
}

// 페이지 로드 시 모달 닫기
window.onclick = function(event) {
    if (event.target === QRmodal) {
QRContainer.style.transform = "rotateY(0deg)"
        card.removeEventListener("click",rotateCard)
        QRContainer.style.border = "dashed 3px gray"
    
        QRmodal.style.display = "none";
    }
}

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

        item.id = 'folder1-item'; // ID 설정
        item.appendChild(img);
        item.appendChild(createResizer());
        item.appendChild(createResizerLB());
        item.appendChild(createResizerLT());
        item.appendChild(createResizerRT());
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

        item.id = 'folder2-item'; // ID 설정
        img.style.zIndex = "999";
        item.appendChild(img);
        item.appendChild(createResizer());
        item.appendChild(createResizerLB());
        item.appendChild(createResizerLT());
        item.appendChild(createResizerRT());
        
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
        // 첫 번째 folder1 요소의 정보를 가져오기
        const folder1Item = union.querySelector(`#folder1-item`);
        if (folder1Item) {
            width1 = folder1Item.offsetWidth;
            height1 = folder1Item.offsetHeight;
            top1 = folder1Item.offsetTop;
            left1 = folder1Item.offsetLeft;
        }

        // 첫 번째 folder2 요소의 정보를 가져오기
        const folder2Item = union.querySelector(`#folder2-item`);
        if (folder2Item) {
            width2 = folder2Item.offsetWidth;
            height2 = folder2Item.offsetHeight;
            top2 = folder2Item.offsetTop;
            left2 = folder2Item.offsetLeft;
        }

        processImages(); // 저장한 값을 바탕으로 이미지 처리
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

QRInput.addEventListener('change', function(event) {
    
    const file = event.target.files[0];
    
    if (file) {
        console.log(file[0])
        QRContainer.style.border = "none";
        const reader = new FileReader();
        reader.onload = function(e) {
            const QRImage = document.createElement('img')
            QRContainer.innerHTML = "";
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = "400px";
            img.style.height = "400px";
            img.style.objectFit = "contain";
            QRContainer.appendChild(img);
            console.log(img.src)
            console.log(window.btoa(img.src))
            var ccc = window.btoa(img.src)
            console.log(ccc)
            var ccc2 = window.atob(ccc)
            
            isImageAdded = true;
            card.addEventListener('click', rotateCard);
        }
        reader.readAsDataURL(file);
        console.log(file)
    } else {
        QRContainer.innerHTML = '이미지를 선택하세요';
        
    }
   
});


function rotateCard() {
    if (isImageAdded) {
        card.style.transform = card.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    }
}

