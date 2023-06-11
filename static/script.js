document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const sliders = document.querySelectorAll('.slider');
    const sliderValues = document.querySelectorAll('.output');
    const buttons = document.querySelectorAll('.button');
    const directionMap = new Map(); // to track direction of each slider

    // Display property values
    for (let i = 0; i < sliders.length; i++) {
        sliderValues[i].innerHTML = sliders[i].value;
        directionMap.set(sliders[i], 0); // Initialize direction to 0
    }

    // Update text property and displayed property value for each slider
    sliders.forEach(slider => {
        const sliderIndex = slider.getAttribute('data-index');
        const output = document.querySelector(`.output[data-index='${sliderIndex}']`);

        let previousValue = slider.value; // Initialize previousValue with the initial value of slider
        let flagDirectionChanged = false; 
        let dataToPython = null; // Temporarily store data to send to Python

        slider.addEventListener('input', function() {
            container.style.setProperty(`--${this.id}`, this.value);
            output.innerHTML = this.value;

            // Check for change in direction
            let currentValue = this.value;
            let currentDirection = previousValue === null ? 0 : (currentValue - previousValue) > 0 ? 1 : -1;
        
            if (currentDirection !== directionMap.get(slider)) {
                flagDirectionChanged = true; // Set flag when direction changes
            } else {
                if (flagDirectionChanged) { // If direction just got confirmed
                    if (dataToPython !== null) {
                        sendDataToPython(dataToPython); // Send data of the point before direction changed
                    }
                    dataToPython = null;
                    flagDirectionChanged = false; // Reset flag
                }
            }
            directionMap.set(slider, currentDirection); // Update direction
        
            if (flagDirectionChanged) {
                dataToPython = {
                    index: sliderIndex,
                    value: previousValue
                }; // Save data to send if direction change gets confirmed
            }
        
            previousValue = currentValue; // Update previousValue for the next 'input' event
        });

        slider.addEventListener('change', function() {
            const data = {
                index: sliderIndex,
                value: this.value
            };
        
            sendDataToPython(data);
        });
    });

    // Reset text property and update display property value for each slider
    buttons.forEach(button => {
        const buttonIndex = button.getAttribute('data-index');
        const resetOutput = document.querySelector(`.output[data-index='${buttonIndex}']`);
        const resetSlider = document.querySelector(`.slider[data-index='${buttonIndex}']`);
        button.onclick = function() {
            container.style.removeProperty(`--${resetSlider.id}`);
            resetOutput.innerHTML = resetSlider.defaultValue;
            resetSlider.value = resetSlider.defaultValue;

            const data = {
                index: buttonIndex,
                value: resetSlider.defaultValue
            };

            sendDataToPython(data);
        };
    });

    // Function to send data to Python
    function sendDataToPython(data) {
        fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
