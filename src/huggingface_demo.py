import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

def main():
    load_dotenv()
    api_token = os.getenv("HF_TOKEN")
    
    if not api_token:
        print("Error: HF_TOKEN environment variable not set")
        return
    
    client = InferenceClient(token=api_token)
    
    print("=== Working Hugging Face Models Demo ===\n")
    
    # 1. Text Generation (Usually works)
    print("1. Text Generation")
    print("-" * 30)
    try:
        result = client.text_generation(
            prompt="The capital of France is",
            model="microsoft/DialoGPT-medium",
            max_new_tokens=20
        )
        print(f"✅ Generated: {result}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 2. Sentiment Analysis (Usually works)
    print("\n2. Sentiment Analysis")
    print("-" * 30)
    try:
        result = client.text_classification(
            text="I love this demo!",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
        print(f"✅ Sentiment: {result}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 3. Question Answering - Try multiple models
    print("\n3. Question Answering")
    print("-" * 30)
    
    question = "What is Python?"
    context = "Python is a high-level programming language known for its simplicity."
    
    qa_models_to_try = [
        "deepset/roberta-base-squad2",
        "distilbert-base-uncased-distilled-squad",
        "bert-large-uncased-whole-word-masking-finetuned-squad"
    ]
    
    qa_success = False
    for model in qa_models_to_try:
        try:
            result = client.question_answering(
                question=question,
                context=context,
                model=model
            )
            print(f"✅ QA Success with {model}")
            print(f"Answer: {result['answer']}")
            print(f"Score: {result['score']:.4f}")
            qa_success = True
            break
        except Exception as e:
            print(f"❌ QA failed with {model}: {e}")
    
    if not qa_success:
        print("Trying QA with text generation instead...")
        try:
            prompt = f"Context: {context}\nQuestion: {question}\nAnswer:"
            result = client.text_generation(
                prompt=prompt,
                model="microsoft/DialoGPT-medium",
                max_new_tokens=30
            )
            print(f"✅ QA via text generation: {result}")
        except Exception as e:
            print(f"❌ Text generation QA failed: {e}")

if __name__ == "__main__":
    main()