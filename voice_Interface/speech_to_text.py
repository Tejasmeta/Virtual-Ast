import os
import queue
import sounddevice as sd
import vosk
import json
import pyttsx3
from langchain_huggingface import HuggingFaceEndpoint
from langchain.prompts import PromptTemplate

# Initialize TTS Engine
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)  # Adjust the speech rate

# Vosk Model Path
MODEL_PATH = "C:\\Users\\omkar\\OneDrive\\Desktop\\New folder\\Virtual-Ast\\voice_Interface\\vosk-model-en-in-0.5"

# Check Vosk Model
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Vosk model not found at {MODEL_PATH}")

model = vosk.Model(MODEL_PATH)
samplerate = 16000
q = queue.Queue()

def audio_callback(indata, frames, time, status):
    """Feed audio data into the queue."""
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))

# Hugging Face Endpoint
HUGGING_FACE_TOKEN = "hf_token"
repo_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
llm = HuggingFaceEndpoint(
    repo_id=repo_id,
    temperature=0.7,
    model_kwargs={"max_length": 128},
    huggingfacehub_api_token=HUGGING_FACE_TOKEN,
)

# LangChain Prompt Template
template = """Question: {question}
Answer: Let's think step by step."""
prompt = PromptTemplate(template=template, input_variables=["question"])
chain = prompt | llm

# Start the Speech-to-Text and Query Process
with sd.RawInputStream(samplerate=samplerate, blocksize=8000, dtype='int16',
                       channels=1, callback=audio_callback):
    print("Listening...")
    rec = vosk.KaldiRecognizer(model, samplerate)
    while True:
        data = q.get()
        if rec.AcceptWaveform(data):
            result = rec.Result()
            text = json.loads(result).get('text', '')
            print(f"Recognized: {text}")
            if text:  # If speech is recognized, process it
                # Process the text through the model
                model_result = chain.invoke({"question": text})
                print(f"Model Response: {model_result}")
                # Convert the response to voice output
                tts_engine.say(model_result)
                tts_engine.runAndWait()
                break
