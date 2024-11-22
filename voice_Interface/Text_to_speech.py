import pyttsx3

def text_to_speech(text):
    """Initialize the TTS engine."""
    engine = pyttsx3.init()
    # You can set properties like voice, rate, and volume here
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[0].id)  # Change index to select different voices
    engine.setProperty('rate', 150)  # Speed of speech
    engine.setProperty('volume', 1)  # Volume 0.0 to 1.0

    engine.say(text)
    engine.runAndWait()



if __name__ == "__main__":
    # Example: Get user input and convert it to speech
    user_input = input("Enter the text you want to convert to speech: ")
    text_to_speech(user_input)
