document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const sliders = document.querySelectorAll('.slider');
    const sliderValues = document.querySelectorAll('.output');
    const directionMap = new Map(); // to track direction of each slider
    const directionChangeData = new Map(); // to track direction change data of each slider

    // Get slider range
    const sliderRange = [];
    sliders.forEach(slider => {
        const min = parseFloat(slider.getAttribute('min'));
        const max = parseFloat(slider.getAttribute('max'));
        sliderRange.push({ min, max });
    });

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
            let sliderIndex = parseInt(slider.getAttribute('data-index'));

            // Collect data from all sliders
            let allData = Array.from(sliders, slider => {
                const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                const value = parseFloat(slider.value);
                const normalizedValue = (value - min) / (max - min); // Normalize the value
                return normalizedValue;
            });

            let allOtherData = []; // Initialize allOtherData as an empty array
            if (directionChangeData.has(slider)) {
                // For each direction change data point, create an array of all slider values, replacing the value of the current slider with the direction change data point
                directionChangeData.get(slider).forEach(data => {
                    let tempData = [...allData]; // Create a copy of allData
                    const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                    const value = parseFloat(data.value);
                    const normalizedValue = (value - min) / (max - min); // Normalize the value
                    tempData[sliderIndex] = normalizedValue; // Replace the value of the current slider with the direction change data point
                    allOtherData.push(tempData);
                });
                directionChangeData.delete(slider); // Clear the direction change data for the slider
            }

            sendDataToPython({preferredData: allData, otherData: allOtherData});
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
        .then(response => response.json())
        .then(data => {
            // Denormalize and output suggestions
            const suggestions = data.suggestions;
            const denormalizedSuggestions = [];

            for (const suggestion of suggestions) {
                const denormalizedSuggestion = [];
                for (let i = 0; i < suggestion.length; i++) {
                    const { min, max } = sliderRange[i];
                    const denormalizedValue = Math.round(suggestion[i] * (max - min) + min);
                    denormalizedSuggestion.push(denormalizedValue);
                }
                denormalizedSuggestions.push(denormalizedSuggestion);
            }

            console.log("Denormalized Suggestions:", denormalizedSuggestions);
            outputDenormalizedSuggestions(denormalizedSuggestions); // Output denormalized suggestions
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    // Function to display denormalized suggestions
    function outputDenormalizedSuggestions(values) {
        const suggestionsContainer = document.querySelector('#suggestions');
        suggestionsContainer.innerHTML = '';

        values.forEach(val => {
            const suggestionContainer = document.createElement('div');
            suggestionContainer.classList.add('suggestion');

            const demoText = document.createElement('div');
            demoText.classList.add('suggested-text');
            demoText.textContent = 'Tokyo';
            demoText.style.fontWeight = val[0];
            demoText.style.fontStretch = `${val[1]}%`;
            demoText.style.fontStyle = `oblique ${val[2]}deg`;
            demoText.style.fontVariationSettings = `"wght" ${val[0]}, "wdth" ${val[1]}, "slnt" ${val[2]}`;

            const selectButton = document.createElement('button');
            selectButton.textContent = 'Select this style';
            selectButton.addEventListener('click', function() {
                let preferredData = val;
                let otherData = values.filter(item => item !== val);
                // Normalize preferredData
                preferredData = Array.from(sliders, slider => {
                    const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                    const value = parseFloat(preferredData[parseInt(slider.getAttribute('data-index'))]);
                    const normalizedValue = (value - min) / (max - min); // Normalize the value
                    return normalizedValue;
                });
                // Normalize otherData
                otherData = otherData.map(item => {
                    return Array.from(sliders, slider => {
                        const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                        const value = parseFloat(item[parseInt(slider.getAttribute('data-index'))]);
                        const normalizedValue = (value - min) / (max - min); // Normalize the value
                        return normalizedValue;
                    });
                });
                // Get current slider values
                const currentData = Array.from(sliders, slider => {
                    const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                    const value = parseFloat(slider.value);
                    const normalizedValue = (value - min) / (max - min); // Normalize the value
                    return normalizedValue;
                });
                // Add current slider values to otherData
                otherData.push(currentData);
                // Send data to Python
                sendDataToPython({ preferredData: preferredData, otherData: otherData });

                sliders.forEach((slider, i) => {
                    slider.value = val[i];
                    container.style.setProperty(`--${slider.id}`, val[i]);
                    document.querySelector(`.output[data-index='${i}']`).innerHTML = val[i];
                });
            });

            suggestionContainer.appendChild(demoText);
            suggestionContainer.appendChild(selectButton);
            suggestionsContainer.appendChild(suggestionContainer);
        });
    };

    regenerateButton.addEventListener('click', function() {
        // Get suggeqstions
        const suggestions = document.querySelectorAll('.suggestion');
        const values = Array.from(suggestions, suggestion => {
            const demoText = suggestion.querySelector('.suggested-text');
            const fontWeight = demoText.style.fontWeight;
            const fontStretch = parseInt(demoText.style.fontStretch.substring(0, demoText.style.fontStretch.length - 1));
            const fontStyle = parseInt(demoText.style.fontStyle.substring(8, demoText.style.fontStyle.length - 3));
            return [fontWeight, fontStretch, fontStyle];
        });
        // Normalize values
        const normalizedSuggestions = values.map(val => {
            return Array.from(sliders, slider => {
                const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
                const value = parseFloat(val[parseInt(slider.getAttribute('data-index'))]);
                const normalizedValue = (value - min) / (max - min); // Normalize the value
                return normalizedValue;
            });
        });
        const otherData = normalizedSuggestions;
        // Get current slider values
        const currentData = Array.from(sliders, slider => {
            const { min, max } = sliderRange[parseInt(slider.getAttribute('data-index'))];
            const value = parseFloat(slider.value);
            const normalizedValue = (value - min) / (max - min); // Normalize the value
            return normalizedValue;
        });
        // Current slider values are preferred data
        const preferredData = currentData;

        // Send data to Python
        sendDataToPython({ preferredData: preferredData, otherData: otherData });
    });
});
