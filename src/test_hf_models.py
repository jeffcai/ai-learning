import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()
client = InferenceClient(token=os.getenv("HF_TOKEN"))

# Try these QA models instead:
qa_models = [
    "deepset/roberta-base-squad2",
    "distilbert-base-uncased-distilled-squad",
    "bert-large-uncased-whole-word-masking-finetuned-squad",
    "microsoft/DialoGPT-medium"  # Can also do QA-style tasks
]

def test_qa_models():
    question = "What is the capital of France?"
    context = "France is a country in Europe. Paris is the capital and largest city of France."
    
    for model in qa_models:
        try:
            print(f"\nTrying model: {model}")
            result = client.question_answering(
                question=question,
                context=context,
                model=model
            )
            print(f"✅ Success with {model}")
            print(f"Answer: {result['answer']}")
            print(f"Score: {result['score']:.4f}")
            break
        except Exception as e:
            print(f"❌ Failed with {model}: {e}")
            continue

test_qa_models()