document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const sliders = document.querySelectorAll('.slider');
    const sliderValues = document.querySelectorAll('.output');
    const directionMap = new Map(); // to track direction of each slider
    const directionChangeData = new Map(); // to track direction change data of each slider

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

            if (directionMap.get(slider) !== currentDirection) {
                flagDirectionChanged = true; // Set flag when direction changes
                directionMap.set(slider, currentDirection); // Update direction
            }

            if (flagDirectionChanged) {
                dataToPython = {
                    index: sliderIndex,
                    value: previousValue
                }; // Save data to send if direction change gets confirmed
                if (!directionChangeData.has(slider)) {
                    directionChangeData.set(slider, []);
                }
                directionChangeData.get(slider).push(dataToPython);
                flagDirectionChanged = false; // Reset flag
            }

            previousValue = currentValue; // Update previousValue for the next 'input' event
        });

        slider.addEventListener('change', function() {
            const finalValue = {
                index: sliderIndex,
                value: this.value
            };

            let dataPackage = {
                preferredData: finalValue,
                otherData: []
            };

            if (directionChangeData.has(slider)) {
                dataPackage.otherData = directionChangeData.get(slider);
                directionChangeData.delete(slider);
            }

            sendDataToPython(dataPackage);
        });
    });

    // Function to send data to Python
    function sendDataToPython(dataPackage) {
        fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataPackage)
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
