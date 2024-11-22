import os
import queue
import sounddevice as sd
import vosk
import json
import sys

# Path to the Vosk model
MODEL_PATH = "C:\\Users\\omkar\\OneDrive\\Desktop\\New folder\\Virtual-Ast\\voice_Interface\\vosk-model-en-in-0.5"


# Initialize the Vosk model
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

model = vosk.Model(MODEL_PATH)
samplerate = 16000  # Sample rate for audio input

# Create a queue to hold audio data
q = queue.Queue()

def callback(indata, frames, time, status):
    """Callback function to feed audio data into the queue."""
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))

# Start audio stream
with sd.RawInputStream(samplerate=samplerate, blocksize=8000, dtype='int16',
                       channels=1, callback=callback):
    print("Listening...")
    rec = vosk.KaldiRecognizer(model, samplerate)
    while True:
        data = q.get()
        if rec.AcceptWaveform(data):
            result = rec.Result()
            text = json.loads(result).get('text', '')
            print(f"Recognized: {text}")
            break  # Stop after processing the first complete result
        else:
            partial_result = rec.PartialResult()
            print(f"Partial: {json.loads(partial_result).get('partial', '')}")
