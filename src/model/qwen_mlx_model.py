from smolagents import CodeAgent, DuckDuckGoSearchTool
import subprocess

class MinimalQwenMLXModel:
    def __init__(self, model_name="q3"):
        self.model_name = model_name
        
    def generate(self, prompt, **kwargs):
        """Most basic generation possible"""
        try:
            # Absolutely minimal command
            result = subprocess.run(
                ["llm", "prompt", "--model", self.model_name, prompt],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"Error: {result.stderr}"
                
        except Exception as e:
            return f"Error: {str(e)}"
    
    def __call__(self, prompt, **kwargs):
        return self.generate(prompt, **kwargs)

# Test minimal model
model = MinimalQwenMLXModel("q3")
response = model.generate("Hello, how are you?")
print(f"Response: {response}")