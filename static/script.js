document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const sliders = document.querySelectorAll('.slider');
    const sliderValues = document.querySelectorAll('.output');
    const buttons = document.querySelectorAll('.button');

    // Display property values
    for (let i = 0; i < sliders.length; i++) {
        sliderValues[i].innerHTML = sliders[i].value;
    }

    // Update text property and displayed property value for each slider
    sliders.forEach(slider => {
        const sliderIndex = slider.getAttribute('data-index');
        const output = document.querySelector(`.output[data-index='${sliderIndex}']`);

        slider.addEventListener('input', function() {
            container.style.setProperty(`--${this.id}`, this.value);
            output.innerHTML = this.value;
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
